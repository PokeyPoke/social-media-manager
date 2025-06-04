import { NextRequest, NextResponse } from 'next/server'
import { prisma } from './db'
import { RateLimitError } from './error-handling'

interface RateLimitConfig {
  windowMs: number    // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
  keyGenerator?: (req: NextRequest) => string
  onLimitReached?: (req: NextRequest) => void
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: Date
  totalRequests: number
}

// Default configurations for different endpoints
export const RATE_LIMIT_CONFIGS = {
  // Authentication endpoints - stricter limits
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,            // 5 attempts per 15 minutes
  },
  
  // API endpoints - moderate limits
  API: {
    windowMs: 60 * 1000,       // 1 minute
    maxRequests: 100,          // 100 requests per minute
  },
  
  // Content generation - limited due to AI costs
  CONTENT_GENERATION: {
    windowMs: 60 * 60 * 1000,  // 1 hour
    maxRequests: 20,           // 20 generations per hour
  },
  
  // Public endpoints - generous limits
  PUBLIC: {
    windowMs: 60 * 1000,       // 1 minute
    maxRequests: 200,          // 200 requests per minute
  },
} as const

// In-memory store for development (use Redis in production)
class MemoryStore {
  private store = new Map<string, { count: number; resetTime: Date }>()

  async get(key: string): Promise<{ count: number; resetTime: Date } | null> {
    const data = this.store.get(key)
    if (!data) return null
    
    // Clean up expired entries
    if (data.resetTime < new Date()) {
      this.store.delete(key)
      return null
    }
    
    return data
  }

  async set(key: string, count: number, resetTime: Date): Promise<void> {
    this.store.set(key, { count, resetTime })
  }

  async increment(key: string, resetTime: Date): Promise<number> {
    const existing = await this.get(key)
    if (!existing) {
      await this.set(key, 1, resetTime)
      return 1
    }
    
    const newCount = existing.count + 1
    await this.set(key, newCount, resetTime)
    return newCount
  }
}

// Redis store for production
class RedisStore {
  constructor(private redisClient: any) {}

  async get(key: string): Promise<{ count: number; resetTime: Date } | null> {
    try {
      const data = await this.redisClient.hgetall(key)
      if (!data.count) return null
      
      const resetTime = new Date(data.resetTime)
      if (resetTime < new Date()) {
        await this.redisClient.del(key)
        return null
      }
      
      return {
        count: parseInt(data.count),
        resetTime
      }
    } catch (error) {
      console.error('Redis get error:', error)
      return null
    }
  }

  async set(key: string, count: number, resetTime: Date): Promise<void> {
    try {
      await this.redisClient.hset(key, {
        count: count.toString(),
        resetTime: resetTime.toISOString()
      })
      await this.redisClient.expireat(key, Math.floor(resetTime.getTime() / 1000))
    } catch (error) {
      console.error('Redis set error:', error)
    }
  }

  async increment(key: string, resetTime: Date): Promise<number> {
    try {
      const pipeline = this.redisClient.pipeline()
      pipeline.hincrby(key, 'count', 1)
      pipeline.hset(key, 'resetTime', resetTime.toISOString())
      pipeline.expireat(key, Math.floor(resetTime.getTime() / 1000))
      
      const results = await pipeline.exec()
      return parseInt(results[0][1])
    } catch (error) {
      console.error('Redis increment error:', error)
      throw error
    }
  }
}

// Rate limiter class
export class RateLimiter {
  private store: MemoryStore | RedisStore

  constructor(redisClient?: any) {
    this.store = redisClient ? new RedisStore(redisClient) : new MemoryStore()
  }

  async checkLimit(
    key: string, 
    config: RateLimitConfig
  ): Promise<RateLimitResult> {
    const now = new Date()
    const resetTime = new Date(now.getTime() + config.windowMs)
    
    try {
      const currentCount = await this.store.increment(key, resetTime)
      
      return {
        allowed: currentCount <= config.maxRequests,
        remaining: Math.max(0, config.maxRequests - currentCount),
        resetTime,
        totalRequests: currentCount
      }
    } catch (error) {
      console.error('Rate limit check error:', error)
      // Fail open - allow request if rate limiting fails
      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetTime,
        totalRequests: 1
      }
    }
  }
}

// Default rate limiter instance
export const rateLimiter = new RateLimiter()

// Generate rate limit key based on IP and optional user ID
function generateKey(req: NextRequest, prefix: string = 'rl'): string {
  const ip = req.headers.get('x-forwarded-for') || 
             req.headers.get('x-real-ip') || 
             req.headers.get('x-client-ip') ||
             'unknown'
  
  // If user is authenticated, use user-specific limits
  const authHeader = req.headers.get('authorization')
  if (authHeader) {
    // Extract user ID from token (you'd implement this based on your auth)
    const userId = extractUserIdFromAuth(authHeader)
    if (userId) {
      return `${prefix}:user:${userId}`
    }
  }
  
  return `${prefix}:ip:${ip.split(',')[0].trim()}`
}

// Helper to extract user ID from auth header
function extractUserIdFromAuth(authHeader: string): string | null {
  // This is a placeholder - implement based on your JWT structure
  try {
    const token = authHeader.replace('Bearer ', '')
    // Decode JWT without verification (just to get user ID for rate limiting)
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
    return payload.userId
  } catch {
    return null
  }
}

// Middleware factory for different rate limit configurations
export function createRateLimit(
  config: RateLimitConfig,
  prefix?: string
) {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    const key = config.keyGenerator 
      ? config.keyGenerator(request)
      : generateKey(request, prefix)
    
    const result = await rateLimiter.checkLimit(key, config)
    
    if (!result.allowed) {
      if (config.onLimitReached) {
        config.onLimitReached(request)
      }
      
      const response = NextResponse.json(
        {
          error: {
            message: 'Rate limit exceeded',
            code: 'RATE_LIMIT_ERROR',
            statusCode: 429,
            retryAfter: Math.ceil((result.resetTime.getTime() - Date.now()) / 1000)
          }
        },
        { status: 429 }
      )
      
      // Add rate limit headers
      response.headers.set('X-RateLimit-Limit', config.maxRequests.toString())
      response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
      response.headers.set('X-RateLimit-Reset', result.resetTime.toISOString())
      response.headers.set('Retry-After', Math.ceil((result.resetTime.getTime() - Date.now()) / 1000).toString())
      
      return response
    }
    
    return null // Allow request to proceed
  }
}

// Predefined rate limiters for common use cases
export const authRateLimit = createRateLimit(RATE_LIMIT_CONFIGS.AUTH, 'auth')
export const apiRateLimit = createRateLimit(RATE_LIMIT_CONFIGS.API, 'api')
export const contentGenerationRateLimit = createRateLimit(RATE_LIMIT_CONFIGS.CONTENT_GENERATION, 'content')
export const publicRateLimit = createRateLimit(RATE_LIMIT_CONFIGS.PUBLIC, 'public')

// Wrapper for API routes
export function withRateLimit(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>,
  rateLimit: (request: NextRequest) => Promise<NextResponse | null>
) {
  return async (request: NextRequest, context?: any) => {
    const rateLimitResponse = await rateLimit(request)
    if (rateLimitResponse) {
      return rateLimitResponse
    }
    
    return handler(request, context)
  }
}

// Database-based rate limiting for persistent storage
// TODO: Uncomment when RateLimit table is added to schema
export async function checkDatabaseRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): Promise<RateLimitResult> {
  const now = new Date()
  
  // For now, fall back to allowing requests since table doesn't exist
  // This will be enabled when the improved schema is applied
  console.warn('Database rate limiting not available - using memory-based limiting')
  
  return {
    allowed: true,
    remaining: maxRequests - 1,
    resetTime: new Date(now.getTime() + windowMs),
    totalRequests: 1
  }
  
  /* TODO: Uncomment when schema is updated with RateLimit table
  const windowStart = new Date(now.getTime() - windowMs)
  
  try {
    // Clean up old entries
    await prisma.rateLimit.deleteMany({
      where: {
        windowStart: {
          lt: windowStart
        }
      }
    })
    
    // Get or create rate limit entry
    const rateLimit = await prisma.rateLimit.upsert({
      where: { key },
      update: {
        requests: {
          increment: 1
        },
        updatedAt: now
      },
      create: {
        key,
        requests: 1,
        windowStart: now
      }
    })
    
    const resetTime = new Date(rateLimit.windowStart.getTime() + windowMs)
    
    return {
      allowed: rateLimit.requests <= maxRequests,
      remaining: Math.max(0, maxRequests - rateLimit.requests),
      resetTime,
      totalRequests: rateLimit.requests
    }
  } catch (error) {
    console.error('Database rate limit error:', error)
    // Fail open
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: new Date(now.getTime() + windowMs),
      totalRequests: 1
    }
  }
  */
}