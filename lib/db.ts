import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// In production, create a fresh client to avoid cache issues
// In development, use global cache for hot reloading
export const prisma = process.env.NODE_ENV === 'production' 
  ? new PrismaClient()
  : (globalForPrisma.prisma ?? new PrismaClient())

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma