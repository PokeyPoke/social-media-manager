import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { geminiAI } from '@/lib/gemini'
import { facebookAPI } from '@/lib/facebook'

interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  uptime: number
  version: string
  environment: string
  services: {
    database: ServiceHealth
    ai: ServiceHealth
    facebook: ServiceHealth
    memory: MemoryHealth
  }
  dependencies: DependencyHealth[]
}

interface ServiceHealth {
  status: 'healthy' | 'degraded' | 'unhealthy'
  responseTime?: number
  error?: string
  lastChecked: string
}

interface MemoryHealth {
  status: 'healthy' | 'degraded' | 'unhealthy'
  used: number
  total: number
  percentage: number
}

interface DependencyHealth {
  name: string
  status: 'healthy' | 'degraded' | 'unhealthy'
  url?: string
  responseTime?: number
  error?: string
}

const startTime = Date.now()

// Health check with timeout
async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage: string = 'Operation timed out'
): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs)
  )
  return Promise.race([promise, timeout])
}

// Database health check
async function checkDatabase(): Promise<ServiceHealth> {
  const startTime = Date.now()
  
  try {
    await withTimeout(prisma.$queryRaw`SELECT 1`, 2000, 'Database query timeout')
    
    const responseTime = Date.now() - startTime
    
    return {
      status: responseTime < 1000 ? 'healthy' : 'degraded',
      responseTime,
      lastChecked: new Date().toISOString()
    }
  } catch (error) {
    // During startup, database might not be ready yet
    if (process.uptime && process.uptime() < 60) {
      return {
        status: 'degraded',
        error: 'Database warming up',
        lastChecked: new Date().toISOString()
      }
    }
    
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown database error',
      lastChecked: new Date().toISOString()
    }
  }
}

// AI service health check
async function checkAI(): Promise<ServiceHealth> {
  const startTime = Date.now()
  
  try {
    const isHealthy = await withTimeout(
      geminiAI.testConnection(),
      3000,
      'AI service timeout'
    )
    
    const responseTime = Date.now() - startTime
    
    return {
      status: isHealthy ? (responseTime < 3000 ? 'healthy' : 'degraded') : 'unhealthy',
      responseTime,
      lastChecked: new Date().toISOString()
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown AI service error',
      lastChecked: new Date().toISOString()
    }
  }
}

// Facebook API health check
async function checkFacebook(): Promise<ServiceHealth> {
  const startTime = Date.now()
  
  try {
    // Simple check - we'll just verify the API base URL is reachable
    // In production, you might want to test with a valid token
    const response = await withTimeout(
      fetch('https://graph.facebook.com/v18.0/', { method: 'GET' }),
      2000,
      'Facebook API timeout'
    )
    
    const responseTime = Date.now() - startTime
    
    return {
      status: response.ok ? (responseTime < 2000 ? 'healthy' : 'degraded') : 'unhealthy',
      responseTime,
      lastChecked: new Date().toISOString()
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown Facebook API error',
      lastChecked: new Date().toISOString()
    }
  }
}

// Memory health check
function checkMemory(): MemoryHealth {
  const memUsage = process.memoryUsage()
  const used = memUsage.heapUsed
  const total = memUsage.heapTotal
  const percentage = (used / total) * 100
  
  let status: 'healthy' | 'degraded' | 'unhealthy'
  if (percentage < 70) {
    status = 'healthy'
  } else if (percentage < 90) {
    status = 'degraded'
  } else {
    status = 'unhealthy'
  }
  
  return {
    status,
    used: Math.round(used / 1024 / 1024), // Convert to MB
    total: Math.round(total / 1024 / 1024), // Convert to MB
    percentage: Math.round(percentage)
  }
}

// Check external dependencies
async function checkDependencies(): Promise<DependencyHealth[]> {
  const dependencies = [
    {
      name: 'Railway Health',
      url: 'https://status.railway.app/api/v2/status.json'
    },
    {
      name: 'Facebook API Status', 
      url: 'https://developers.facebook.com/status/'
    }
  ]
  
  const results = await Promise.allSettled(
    dependencies.map(async (dep) => {
      const startTime = Date.now()
      try {
        const response = await withTimeout(
          fetch(dep.url, { 
            method: 'HEAD',
            headers: { 'User-Agent': 'SocialMediaManager/1.0' }
          }),
          5000
        )
        
        const responseTime = Date.now() - startTime
        
        return {
          name: dep.name,
          status: response.ok ? 'healthy' : 'degraded',
          url: dep.url,
          responseTime
        } as DependencyHealth
      } catch (error) {
        return {
          name: dep.name,
          status: 'unhealthy',
          url: dep.url,
          error: error instanceof Error ? error.message : 'Unknown error'
        } as DependencyHealth
      }
    })
  )
  
  return results.map((result, index) => 
    result.status === 'fulfilled' 
      ? result.value 
      : {
          name: dependencies[index].name,
          status: 'unhealthy',
          url: dependencies[index].url,
          error: 'Health check failed'
        } as DependencyHealth
  )
}

// Determine overall health status
function getOverallStatus(
  database: ServiceHealth,
  ai: ServiceHealth,
  facebook: ServiceHealth,
  memory: MemoryHealth
): 'healthy' | 'degraded' | 'unhealthy' {
  const services = [database, ai, facebook, memory]
  
  if (services.some(service => service.status === 'unhealthy')) {
    return 'unhealthy'
  }
  
  if (services.some(service => service.status === 'degraded')) {
    return 'degraded'
  }
  
  return 'healthy'
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const timestamp = new Date().toISOString()
  const uptime = Date.now() - startTime
  
  try {
    // Run health checks in parallel
    const [database, ai, facebook, dependencies] = await Promise.all([
      checkDatabase(),
      checkAI(),
      checkFacebook(),
      checkDependencies()
    ])
    
    const memory = checkMemory()
    const overall = getOverallStatus(database, ai, facebook, memory)
    
    const healthCheck: HealthCheck = {
      status: overall,
      timestamp,
      uptime: Math.round(uptime / 1000), // Convert to seconds
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database,
        ai,
        facebook,
        memory
      },
      dependencies
    }
    
    // Return appropriate HTTP status based on health
    const statusCode = overall === 'healthy' ? 200 : overall === 'degraded' ? 207 : 503
    
    return NextResponse.json(healthCheck, { 
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
    
  } catch (error) {
    const errorHealthCheck: HealthCheck = {
      status: 'unhealthy',
      timestamp,
      uptime: Math.round(uptime / 1000),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: { status: 'unhealthy', error: 'Health check failed', lastChecked: timestamp },
        ai: { status: 'unhealthy', error: 'Health check failed', lastChecked: timestamp },
        facebook: { status: 'unhealthy', error: 'Health check failed', lastChecked: timestamp },
        memory: checkMemory()
      },
      dependencies: []
    }
    
    return NextResponse.json(errorHealthCheck, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  }
}

// Simple health check endpoint for load balancers
export async function HEAD(): Promise<NextResponse> {
  try {
    // Quick database ping
    await withTimeout(prisma.$queryRaw`SELECT 1`, 2000)
    return new NextResponse(null, { status: 200 })
  } catch {
    return new NextResponse(null, { status: 503 })
  }
}