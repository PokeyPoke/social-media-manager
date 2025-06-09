import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser } from '@/lib/auth'
import { createSession } from '@/lib/session'
import { loginSchema, validateBody, sanitizeInput } from '@/lib/validation'

export async function POST(request: NextRequest) {
  try {
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown'
    console.log(`Login attempt from ${clientIP}`)

    // Validate request body
    const validation = await validateBody(loginSchema)(request)
    if (validation instanceof NextResponse) {
      return validation // Return validation error response
    }
    
    // Sanitize input data
    const sanitizedData = sanitizeInput(validation.data)
    const { email, password } = sanitizedData

    console.log(`Authenticating user: ${email}`)
    const user = await authenticateUser(email, password)
    if (!user) {
      console.log(`Authentication failed for: ${email}`)
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

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
    console.error('Login error:', error)
    
    // Handle Zod validation errors
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid email or password format' },
        { status: 400 }
      )
    }
    
    // Handle database connection errors
    if (error.message && error.message.includes('database') || error.code?.startsWith('P')) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable' },
        { status: 500 }
      )
    }
    
    // Generic error
    return NextResponse.json(
      { error: 'Login failed. Please try again.' },
      { status: 500 }
    )
  }
}