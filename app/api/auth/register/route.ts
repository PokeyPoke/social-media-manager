import { NextRequest, NextResponse } from 'next/server'
import { createUser } from '@/lib/auth'
import { createSession } from '@/lib/session'
import { registerSchema, validateBody, sanitizeInput } from '@/lib/validation'

export async function POST(request: NextRequest) {
  try {
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown'
    console.log(`Registration attempt from ${clientIP}`)

    // Validate request body
    const validation = await validateBody(registerSchema)(request)
    if (validation instanceof NextResponse) {
      return validation // Return validation error response
    }
    
    // Sanitize input data
    const sanitizedData = sanitizeInput(validation.data)
    const { email, password, name, role } = sanitizedData

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