import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'

// Common validation schemas
export const idSchema = z.string().cuid()
export const emailSchema = z.string().email().toLowerCase()
export const passwordSchema = z.string().min(8).max(128)
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/, 
    'Password must contain at least one lowercase letter, one uppercase letter, and one number')

// Auth validation schemas
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().min(2).max(100).trim(),
  role: z.enum(['ADMIN', 'MANAGER', 'VIEWER']).optional().default('MANAGER')
})

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required')
})

// Company validation schemas
export const createCompanySchema = z.object({
  name: z.string().min(2).max(100).trim(),
  facebookPageId: z.string().optional(),
  brandSettings: z.object({
    voice: z.enum(['professional', 'casual', 'friendly', 'authoritative']).default('professional'),
    targetAudience: z.string().min(10).max(500),
    brandColors: z.array(z.string().regex(/^#[0-9A-F]{6}$/i)).optional(),
    keywords: z.array(z.string().min(1).max(50)).max(20).optional()
  }).default({
    voice: 'professional',
    targetAudience: 'General audience'
  }),
  defaultInstructions: z.string().max(1000).optional(),
  timezone: z.string().default('UTC')
})

export const updateCompanySchema = createCompanySchema.partial()

// Campaign validation schemas
export const createCampaignSchema = z.object({
  companyId: idSchema,
  name: z.string().min(2).max(100).trim(),
  description: z.string().max(500).optional(),
  theme: z.string().max(100).optional(),
  contentStrategy: z.object({
    postFrequency: z.enum(['daily', 'weekly', 'bi-weekly', 'monthly']),
    postTimes: z.array(z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)).min(1).max(10),
    contentTypes: z.array(z.enum(['promotional', 'educational', 'engaging', 'announcement'])).min(1),
    includeHashtags: z.boolean().default(true),
    includeEmojis: z.boolean().default(true),
    maxLength: z.number().min(50).max(2200).default(280)
  }),
  scheduleSettings: z.object({
    timezone: z.string(),
    activeDays: z.array(z.number().min(0).max(6)).min(1).max(7),
    startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
    endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
  })
})

export const updateCampaignSchema = createCampaignSchema.partial().omit({ companyId: true })

// Content generation validation schemas
export const generateContentSchema = z.object({
  campaignId: idSchema,
  postType: z.enum(['promotional', 'educational', 'engaging', 'announcement']),
  contentTheme: z.string().min(5).max(200),
  customInstructions: z.string().max(500).optional(),
  count: z.number().min(1).max(5).default(1)
})

// Post validation schemas
export const updatePostSchema = z.object({
  finalContent: z.object({
    message: z.string().min(1).max(2200),
    hashtags: z.array(z.string().max(50)).max(30).optional(),
    scheduledTime: z.string().datetime().optional()
  }).optional(),
  status: z.enum(['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'SCHEDULED', 'POSTED', 'FAILED', 'CANCELLED']).optional(),
  scheduledTime: z.string().datetime().optional()
})

export const approvePostSchema = z.object({
  action: z.enum(['APPROVED', 'REJECTED', 'REQUESTED_CHANGES']),
  notes: z.string().max(1000).optional()
})

// Query parameter validation schemas
export const paginationSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).refine(n => n >= 1).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).refine(n => n >= 1 && n <= 100).default('20'),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
})

export const postFilterSchema = z.object({
  status: z.enum(['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'SCHEDULED', 'POSTED', 'FAILED', 'CANCELLED']).optional(),
  campaignId: idSchema.optional(),
  companyId: idSchema.optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional()
}).merge(paginationSchema)

export const campaignFilterSchema = z.object({
  companyId: idSchema.optional(),
  status: z.enum(['ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED']).optional()
}).merge(paginationSchema)

// Validation middleware
export function validateBody<T extends z.ZodType>(schema: T) {
  return async (request: NextRequest): Promise<{ data: z.infer<T> } | NextResponse> => {
    try {
      const body = await request.json()
      const data = schema.parse(body)
      return { data }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }))
        
        return NextResponse.json({
          error: 'Validation failed',
          details: formattedErrors
        }, { status: 400 })
      }
      
      return NextResponse.json({
        error: 'Invalid JSON format'
      }, { status: 400 })
    }
  }
}

export function validateQuery<T extends z.ZodType>(schema: T) {
  return (request: NextRequest): { data: z.infer<T> } | NextResponse => {
    try {
      const { searchParams } = new URL(request.url)
      const queryObject = Object.fromEntries(searchParams.entries())
      const data = schema.parse(queryObject)
      return { data }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }))
        
        return NextResponse.json({
          error: 'Invalid query parameters',
          details: formattedErrors
        }, { status: 400 })
      }
      
      return NextResponse.json({
        error: 'Invalid query format'
      }, { status: 400 })
    }
  }
}

// Sanitization helpers
export function sanitizeHtml(input: string): string {
  // Basic HTML sanitization - remove script tags and dangerous attributes
  return input
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/javascript:/gi, '')
    .trim()
}

export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    return sanitizeHtml(input)
  }
  if (Array.isArray(input)) {
    return input.map(sanitizeInput)
  }
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value)
    }
    return sanitized
  }
  return input
}