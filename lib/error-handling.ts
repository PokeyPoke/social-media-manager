import { NextResponse } from 'next/server'
import { z } from 'zod'
import { Prisma } from '@prisma/client'

// Custom error classes
export class AppError extends Error {
  public readonly statusCode: number
  public readonly code: string
  public readonly isOperational: boolean

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    isOperational: boolean = true
  ) {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.isOperational = isOperational
    
    // Ensure the name of this error is the same as the class name
    this.name = this.constructor.name
    
    // This clips the constructor invocation from the stack trace
    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR')
    this.details = details
  }
  public details?: any
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR')
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR')
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND_ERROR')
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT_ERROR')
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429, 'RATE_LIMIT_ERROR')
  }
}

// Error response formatter
interface ErrorResponse {
  error: {
    message: string
    code: string
    statusCode: number
    details?: any
    timestamp: string
    path?: string
  }
}

export function formatError(error: AppError, path?: string): ErrorResponse {
  return {
    error: {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      details: (error as any).details,
      timestamp: new Date().toISOString(),
      path
    }
  }
}

// Main error handler
export function handleError(error: unknown, path?: string): NextResponse {
  console.error('Error occurred:', error)

  // Handle known application errors
  if (error instanceof AppError) {
    return NextResponse.json(
      formatError(error, path),
      { status: error.statusCode }
    )
  }

  // Handle Zod validation errors
  if (error instanceof z.ZodError) {
    const validationError = new ValidationError(
      'Validation failed',
      error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
        code: issue.code
      }))
    )
    return NextResponse.json(
      formatError(validationError, path),
      { status: 400 }
    )
  }

  // Handle Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const prismaError = handlePrismaError(error)
    return NextResponse.json(
      formatError(prismaError, path),
      { status: prismaError.statusCode }
    )
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    const validationError = new ValidationError('Database validation error')
    return NextResponse.json(
      formatError(validationError, path),
      { status: 400 }
    )
  }

  // Handle general errors
  if (error instanceof Error) {
    const appError = new AppError(
      process.env.NODE_ENV === 'production' 
        ? 'An unexpected error occurred' 
        : error.message,
      500,
      'INTERNAL_ERROR',
      false
    )
    return NextResponse.json(
      formatError(appError, path),
      { status: 500 }
    )
  }

  // Handle unknown errors
  const unknownError = new AppError(
    'An unknown error occurred',
    500,
    'UNKNOWN_ERROR',
    false
  )
  return NextResponse.json(
    formatError(unknownError, path),
    { status: 500 }
  )
}

// Prisma error handler
function handlePrismaError(error: Prisma.PrismaClientKnownRequestError): AppError {
  switch (error.code) {
    case 'P2002':
      // Unique constraint violation
      const fields = error.meta?.target as string[] || ['field']
      return new ConflictError(
        `A record with this ${fields.join(', ')} already exists`
      )
    
    case 'P2014':
      // Invalid ID
      return new ValidationError('Invalid ID provided')
    
    case 'P2003':
      // Foreign key constraint violation
      return new ValidationError('Referenced record does not exist')
    
    case 'P2025':
      // Record not found
      return new NotFoundError('Record')
    
    case 'P2021':
      // Table does not exist
      return new AppError('Database configuration error', 500, 'DATABASE_ERROR', false)
    
    case 'P2024':
      // Connection timeout
      return new AppError('Database connection timeout', 503, 'DATABASE_TIMEOUT', false)
    
    default:
      return new AppError(
        process.env.NODE_ENV === 'production'
          ? 'Database operation failed'
          : error.message,
        500,
        'DATABASE_ERROR',
        false
      )
  }
}

// Async wrapper for route handlers
export function asyncHandler(
  handler: (request: Request, context?: any) => Promise<Response>
) {
  return async (request: Request, context?: any) => {
    try {
      return await handler(request, context)
    } catch (error) {
      const url = new URL(request.url)
      return handleError(error, url.pathname)
    }
  }
}

// Middleware wrapper
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args)
    } catch (error) {
      if (error instanceof AppError) {
        throw error
      }
      // Convert unknown errors to AppError
      throw new AppError(
        error instanceof Error ? error.message : 'Unknown error occurred'
      )
    }
  }
}

// Logging utilities
export const logger = {
  error: (message: string, error?: Error, context?: any) => {
    console.error(`[ERROR] ${message}`, {
      error: error?.message,
      stack: error?.stack,
      context,
      timestamp: new Date().toISOString()
    })
  },
  
  warn: (message: string, context?: any) => {
    console.warn(`[WARN] ${message}`, {
      context,
      timestamp: new Date().toISOString()
    })
  },
  
  info: (message: string, context?: any) => {
    console.info(`[INFO] ${message}`, {
      context,
      timestamp: new Date().toISOString()
    })
  },
  
  debug: (message: string, context?: any) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[DEBUG] ${message}`, {
        context,
        timestamp: new Date().toISOString()
      })
    }
  }
}