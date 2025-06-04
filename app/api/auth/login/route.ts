import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser } from '@/lib/auth'
import { createSession } from '@/lib/session'
import { withRateLimit, authRateLimit } from '@/lib/rate-limiting'
import { asyncHandler } from '@/lib/error-handling'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
})

export const POST = withRateLimit(
  asyncHandler(async (request: NextRequest) => {
    const body = await request.json()
    const { email, password } = loginSchema.parse(body)

    const user = await authenticateUser(email, password)
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

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
  }),
  authRateLimit
)