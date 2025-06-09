import { NextRequest, NextResponse } from 'next/server'
import { getSession } from './session'
import { handleError, AuthenticationError, AuthorizationError, logger } from './error-handling'

export type ApiHandler = (request: NextRequest, context?: any) => Promise<NextResponse>

// Enhanced async wrapper with comprehensive error handling
export function withErrorBoundary(handler: ApiHandler): ApiHandler {
  return async (request: NextRequest, context?: any) => {
    const startTime = Date.now()
    const method = request.method
    const url = new URL(request.url)
    
    try {
      // Log incoming request
      logger.info(`${method} ${url.pathname}`, {
        userAgent: request.headers.get('user-agent'),
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        timestamp: new Date().toISOString()
      })
      
      const response = await handler(request, context)
      
      // Log successful response
      const duration = Date.now() - startTime
      logger.info(`${method} ${url.pathname} - ${response.status}`, {
        duration: `${duration}ms`,
        status: response.status
      })
      
      return response
    } catch (error) {
      // Log error with context
      const duration = Date.now() - startTime
      logger.error(`${method} ${url.pathname} - Error`, error as Error, {
        duration: `${duration}ms`,
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent')
      })
      
      return handleError(error, url.pathname)
    }
  }
}

// Authentication middleware
export function requireAuthentication(handler: ApiHandler): ApiHandler {
  return withErrorBoundary(async (request: NextRequest, context?: any) => {
    const session = await getSession()
    
    if (!session.isLoggedIn || !session.user) {
      throw new AuthenticationError('Authentication required')
    }
    
    // Add user to request context
    const enhancedContext = {
      ...context,
      user: session.user,
      session
    }
    
    return handler(request, enhancedContext)
  })
}

// Role-based authorization middleware
export function requireRole(roles: string[]) {
  return (handler: ApiHandler): ApiHandler => {
    return requireAuthentication(async (request: NextRequest, context?: any) => {
      const userRole = context?.user?.role
      
      if (!userRole || !roles.includes(userRole)) {
        throw new AuthorizationError(
          `Access denied. Required roles: ${roles.join(', ')}`
        )
      }
      
      return handler(request, context)
    })
  }
}

// Company access middleware (ensures user can access specific company)
export function requireCompanyAccess(handler: ApiHandler): ApiHandler {
  return requireAuthentication(async (request: NextRequest, context?: any) => {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId') || 
                     context?.params?.id || 
                     (await request.json().catch(() => ({})))?.companyId
    
    if (!companyId) {
      return handler(request, context)
    }
    
    // In a real app, you'd check if the user has access to this company
    // For now, we'll allow ADMIN and MANAGER roles to access any company
    const userRole = context?.user?.role
    if (userRole === 'VIEWER') {
      // Viewers might have restricted access - implement your business logic here
      logger.warn('Viewer attempting to access company data', {
        userId: context?.user?.id,
        companyId,
        userRole
      })
    }
    
    return handler(request, context)
  })
}

// Request logging middleware
export function withRequestLogging(handler: ApiHandler): ApiHandler {
  return async (request: NextRequest, context?: any) => {
    const startTime = Date.now()
    const method = request.method
    const url = new URL(request.url)
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    
    // Log request details
    logger.info(`Incoming ${method} request`, {
      path: url.pathname,
      query: Object.fromEntries(url.searchParams),
      ip,
      userAgent: request.headers.get('user-agent'),
      contentType: request.headers.get('content-type')
    })
    
    try {
      const response = await handler(request, context)
      
      const duration = Date.now() - startTime
      logger.info(`Request completed`, {
        method,
        path: url.pathname,
        status: response.status,
        duration: `${duration}ms`,
        ip
      })
      
      return response
    } catch (error) {
      const duration = Date.now() - startTime
      logger.error(`Request failed`, error as Error, {
        method,
        path: url.pathname,
        duration: `${duration}ms`,
        ip
      })
      throw error
    }
  }
}

// CORS middleware for API routes
export function withCors(handler: ApiHandler): ApiHandler {
  return async (request: NextRequest, context?: any) => {
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' 
            ? 'https://your-domain.com' 
            : '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400'
        }
      })
    }
    
    const response = await handler(request, context)
    
    // Add CORS headers to response
    response.headers.set(
      'Access-Control-Allow-Origin', 
      process.env.NODE_ENV === 'production' 
        ? 'https://your-domain.com' 
        : '*'
    )
    
    return response
  }
}

// Security headers middleware
export function withSecurityHeaders(handler: ApiHandler): ApiHandler {
  return async (request: NextRequest, context?: any) => {
    const response = await handler(request, context)
    
    // Add security headers
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
    )
    
    return response
  }
}

// Composition helper for chaining multiple middlewares
export function compose(...middlewares: ((handler: ApiHandler) => ApiHandler)[]): (handler: ApiHandler) => ApiHandler {
  return (handler: ApiHandler) => {
    return middlewares.reduceRight((acc, middleware) => middleware(acc), handler)
  }
}

// Common middleware combinations
export const withStandardMiddleware = compose(
  withSecurityHeaders,
  withCors,
  withRequestLogging,
  withErrorBoundary
)

export const withAuthenticatedMiddleware = compose(
  withSecurityHeaders,
  withCors,
  withRequestLogging,
  requireAuthentication,
  withErrorBoundary
)

export const withAdminMiddleware = compose(
  withSecurityHeaders,
  withCors,
  withRequestLogging,
  requireRole(['ADMIN']),
  withErrorBoundary
)

export const withManagerMiddleware = compose(
  withSecurityHeaders,
  withCors,
  withRequestLogging,
  requireRole(['ADMIN', 'MANAGER']),
  withErrorBoundary
)