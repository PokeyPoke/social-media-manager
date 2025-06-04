import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from './db'
import { User } from '@prisma/client'

export interface SessionUser {
  id: string
  email: string
  name: string
  role: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(payload: any): string {
  return jwt.sign(payload, process.env.JWT_SECRET!, { 
    expiresIn: '7d' 
  })
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!)
  } catch (error) {
    return null
  }
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) return null

  const isValid = await verifyPassword(password, user.passwordHash)
  if (!isValid) return null

  return user
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
      email,
      passwordHash: hashedPassword,
      name,
      role
    }
  })
}

export async function getUserFromToken(token: string): Promise<User | null> {
  const decoded = verifyToken(token)
  if (!decoded || !decoded.userId) return null

  return prisma.user.findUnique({
    where: { id: decoded.userId }
  })
}