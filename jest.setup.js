// Jest setup file
import 'jest-extended'

// Mock Next.js modules
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  usePathname() {
    return '/test-path'
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Mock Next.js server components
jest.mock('next/headers', () => ({
  cookies() {
    return {
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
    }
  },
  headers() {
    return new Map()
  }
}))

// Mock environment variables
process.env.JWT_SECRET = 'test-jwt-secret-that-is-long-enough-for-testing-purposes'
process.env.SESSION_SECRET = 'test-session-secret-that-is-long-enough-for-testing'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'
process.env.GOOGLE_GEMINI_API_KEY = 'test-gemini-key'
process.env.FACEBOOK_APP_ID = 'test-facebook-app-id'
process.env.FACEBOOK_APP_SECRET = 'test-facebook-app-secret'
process.env.FACEBOOK_REDIRECT_URI = 'http://localhost:3000/api/auth/facebook/callback'
process.env.NODE_ENV = 'test'

// Global test utilities
global.createMockRequest = (options = {}) => {
  return {
    method: 'GET',
    url: 'http://localhost:3000/test',
    headers: new Map(),
    json: async () => ({}),
    ...options
  }
}

global.createMockUser = (overrides = {}) => {
  return {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    role: 'MANAGER',
    permissions: [],
    emailVerified: true,
    emailVerifiedAt: new Date(),
    lastLoginAt: null,
    loginAttempts: 0,
    lockedUntil: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    passwordHash: 'hashed-password',
    ...overrides
  }
}

// Silence console errors in tests unless VERBOSE_TESTS is set
if (!process.env.VERBOSE_TESTS) {
  global.console = {
    ...console,
    error: jest.fn(),
    warn: jest.fn(),
  }
}