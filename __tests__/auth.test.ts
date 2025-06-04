import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'
import { hashPassword, verifyPassword, generateToken, verifyToken, authenticateUser } from '@/lib/auth-improved'
import { prisma } from '@/lib/db'

// Mock Prisma
jest.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}))

// Mock environment variables
const originalEnv = process.env
beforeEach(() => {
  process.env = {
    ...originalEnv,
    JWT_SECRET: 'test-secret-key-that-is-long-enough-for-security-requirements',
    NODE_ENV: 'test'
  }
})

afterEach(() => {
  process.env = originalEnv
  jest.clearAllMocks()
})

describe('Authentication', () => {
  describe('Password Hashing', () => {
    it('should hash password correctly', async () => {
      const password = 'testPassword123!'
      const hash = await hashPassword(password)
      
      expect(hash).toBeDefined()
      expect(hash).not.toBe(password)
      expect(hash.length).toBeGreaterThan(50) // bcrypt hashes are typically 60 chars
    })

    it('should verify correct password', async () => {
      const password = 'testPassword123!'
      const hash = await hashPassword(password)
      const isValid = await verifyPassword(password, hash)
      
      expect(isValid).toBe(true)
    })

    it('should reject incorrect password', async () => {
      const password = 'testPassword123!'
      const wrongPassword = 'wrongPassword123!'
      const hash = await hashPassword(password)
      const isValid = await verifyPassword(wrongPassword, hash)
      
      expect(isValid).toBe(false)
    })
  })

  describe('JWT Token Management', () => {
    it('should generate valid JWT token', () => {
      const payload = {
        userId: 'test-user-id',
        email: 'test@example.com',
        role: 'MANAGER'
      }
      
      const token = generateToken(payload)
      
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.split('.')).toHaveLength(3) // JWT has 3 parts
    })

    it('should verify valid JWT token', () => {
      const payload = {
        userId: 'test-user-id',
        email: 'test@example.com',
        role: 'MANAGER'
      }
      
      const token = generateToken(payload)
      const decoded = verifyToken(token)
      
      expect(decoded).toBeDefined()
      expect(decoded?.userId).toBe(payload.userId)
      expect(decoded?.email).toBe(payload.email)
      expect(decoded?.role).toBe(payload.role)
    })

    it('should reject invalid JWT token', () => {
      const invalidToken = 'invalid.jwt.token'
      const decoded = verifyToken(invalidToken)
      
      expect(decoded).toBeNull()
    })

    it('should reject token with wrong secret', () => {
      const payload = {
        userId: 'test-user-id',
        email: 'test@example.com',
        role: 'MANAGER'
      }
      
      // Generate token with different secret
      process.env.JWT_SECRET = 'different-secret'
      const token = generateToken(payload)
      
      // Try to verify with original secret
      process.env.JWT_SECRET = 'test-secret-key-that-is-long-enough-for-security-requirements'
      const decoded = verifyToken(token)
      
      expect(decoded).toBeNull()
    })
  })

  describe('User Authentication', () => {
    it('should authenticate user with correct credentials', async () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        passwordHash: await hashPassword('testPassword123!'),
        name: 'Test User',
        role: 'MANAGER',
        createdAt: new Date(),
        updatedAt: new Date(),
        permissions: [],
        emailVerified: true,
        emailVerifiedAt: new Date(),
        lastLoginAt: null,
        loginAttempts: 0,
        lockedUntil: null
      }

      const prismaMock = prisma as jest.Mocked<typeof prisma>
      prismaMock.user.findUnique.mockResolvedValue(mockUser)
      prismaMock.user.update.mockResolvedValue(mockUser)

      const result = await authenticateUser('test@example.com', 'testPassword123!')
      
      expect(result).toBeDefined()
      expect(result?.email).toBe('test@example.com')
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' }
      })
    })

    it('should reject authentication with wrong password', async () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        passwordHash: await hashPassword('testPassword123!'),
        name: 'Test User',
        role: 'MANAGER',
        createdAt: new Date(),
        updatedAt: new Date(),
        permissions: [],
        emailVerified: true,
        emailVerifiedAt: new Date(),
        lastLoginAt: null,
        loginAttempts: 0,
        lockedUntil: null
      }

      const prismaMock = prisma as jest.Mocked<typeof prisma>
      prismaMock.user.findUnique.mockResolvedValue(mockUser)

      const result = await authenticateUser('test@example.com', 'wrongPassword!')
      
      expect(result).toBeNull()
    })

    it('should reject authentication for non-existent user', async () => {
      const prismaMock = prisma as jest.Mocked<typeof prisma>
      prismaMock.user.findUnique.mockResolvedValue(null)

      const result = await authenticateUser('nonexistent@example.com', 'testPassword123!')
      
      expect(result).toBeNull()
    })
  })
})