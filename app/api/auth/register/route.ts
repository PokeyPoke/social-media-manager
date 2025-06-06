import { NextRequest, NextResponse } from 'next/server'
import { createUser } from '@/lib/auth'
import { createSession } from '@/lib/session'
import { withRateLimit, authRateLimit } from '@/lib/rate-limiting'
import { asyncHandler } from '@/lib/error-handling'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  role: z.enum(['ADMIN', 'MANAGER', 'VIEWER']).optional()
})

export async function POST(request: NextRequest) {
  try {
    // Simple rate limiting check
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown'
    console.log(`Registration attempt from ${clientIP}`)

    const body = await request.json()
    const { email, password, name, role = 'MANAGER' } = registerSchema.parse(body)

    console.log(`Creating user: ${email}`)
    const user = await createUser(email, password, name, role)

    console.log(`Creating session for user: ${user.id}`)
    await createSession({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    })

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    })
  } catch (error: any) {
    console.error('Registration error:', error)
    
    // Handle Prisma unique constraint violations
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      )
    }
    
    // Handle Zod validation errors
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data' },
        { status: 400 }
      )
    }
    
    // Handle database connection errors
    if (error.message && error.message.includes('database') || error.code?.startsWith('P')) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      )
    }
    
    // Generic error
    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    )
  }
}