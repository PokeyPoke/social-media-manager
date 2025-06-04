import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from './db'
import { env } from './env-validation'
import { User } from '@prisma/client'
import { NextRequest } from 'next/server'

export interface SessionUser {
  id: string
  email: string
  name: string
  role: string
}

export interface AuthTokenPayload {
  userId: string
  email: string
  role: string
  iat?: number
  exp?: number
  jti?: string // JWT ID for token invalidation
}

// Token types for different purposes
export const TOKEN_TYPES = {
  ACCESS: 'access',
  REFRESH: 'refresh',
  RESET_PASSWORD: 'reset_password',
  EMAIL_VERIFICATION: 'email_verification'
} as const

type TokenType = typeof TOKEN_TYPES[keyof typeof TOKEN_TYPES]

// Token expiration times
const TOKEN_EXPIRY = {
  ACCESS: '15m',      // Short-lived access tokens
  REFRESH: '30d',     // Longer refresh tokens
  RESET_PASSWORD: '1h',
  EMAIL_VERIFICATION: '24h'
} as const

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(
  payload: AuthTokenPayload, 
  type: TokenType = TOKEN_TYPES.ACCESS
): string {
  const jti = crypto.randomUUID() // Unique token ID
  
  return jwt.sign(
    { 
      ...payload, 
      type,
      jti 
    }, 
    env.JWT_SECRET, 
    { 
      expiresIn: TOKEN_EXPIRY[type.toUpperCase() as keyof typeof TOKEN_EXPIRY],
      issuer: 'social-media-manager',
      audience: 'social-media-manager-users'
    }
  )
}

export function verifyToken(token: string, expectedType?: TokenType): AuthTokenPayload | null {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, {
      issuer: 'social-media-manager',
      audience: 'social-media-manager-users'
    }) as AuthTokenPayload & { type: TokenType, jti: string }
    
    if (expectedType && decoded.type !== expectedType) {
      return null
    }
    
    return decoded
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      console.warn('JWT verification failed:', error.message)
    }
    return null
  }
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (!user) return null

    const isValid = await verifyPassword(password, user.passwordHash)
    if (!isValid) return null

    // Update last login timestamp (add this field to schema)
    await prisma.user.update({
      where: { id: user.id },
      data: { updatedAt: new Date() }
    })

    return user
  } catch (error) {
    console.error('Authentication error:', error)
    return null
  }
}

export async function createUser(
  email: string, 
  password: string, 
  name: string, 
  role: 'ADMIN' | 'MANAGER' | 'VIEWER' = 'MANAGER'
): Promise<User> {
  const hashedPassword = await hashPassword(password)
  
  return prisma.user.create({
    data: {
      email: email.toLowerCase(),
      passwordHash: hashedPassword,
      name: name.trim(),
      role
    }
  })
}

export async function getUserFromToken(token: string): Promise<User | null> {
  const decoded = verifyToken(token, TOKEN_TYPES.ACCESS)
  if (!decoded || !decoded.userId) return null

  try {
    return await prisma.user.findUnique({
      where: { id: decoded.userId }
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    return null
  }
}

// Enhanced middleware for API route protection
export async function requireAuth(request: NextRequest): Promise<{ user: User } | { error: string, status: number }> {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  
  if (!token) {
    return { error: 'Missing authorization token', status: 401 }
  }
  
  const user = await getUserFromToken(token)
  if (!user) {
    return { error: 'Invalid or expired token', status: 401 }
  }
  
  return { user }
}

// Role-based authorization
export function requireRole(userRole: string, requiredRoles: string[]): boolean {
  const roleHierarchy = {
    'ADMIN': 3,
    'MANAGER': 2,
    'VIEWER': 1
  }
  
  const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0
  const requiredLevel = Math.min(...requiredRoles.map(role => 
    roleHierarchy[role as keyof typeof roleHierarchy] || 999
  ))
  
  return userLevel >= requiredLevel
}

// Password strength validation
export function validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }
  
  return { isValid: errors.length === 0, errors }
}

// Token refresh mechanism
export async function refreshTokens(refreshToken: string): Promise<{
  accessToken: string
  refreshToken: string
} | null> {
  const decoded = verifyToken(refreshToken, TOKEN_TYPES.REFRESH)
  if (!decoded) return null
  
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId }
  })
  
  if (!user) return null
  
  const newAccessToken = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role
  }, TOKEN_TYPES.ACCESS)
  
  const newRefreshToken = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role
  }, TOKEN_TYPES.REFRESH)
  
  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken
  }
}