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

export const POST = withRateLimit(
  asyncHandler(async (request: NextRequest) => {
    const body = await request.json()
    const { email, password, name, role = 'MANAGER' } = registerSchema.parse(body)

    const user = await createUser(email, password, name, role)

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