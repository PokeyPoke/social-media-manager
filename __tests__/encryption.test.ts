import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { encrypt, decrypt, secureCompare, generateSecureToken } from '@/lib/encryption'

const originalEnv = process.env

beforeEach(() => {
  process.env = {
    ...originalEnv,
    ENCRYPTION_PASSWORD: 'test-encryption-password-that-is-very-secure-and-long-enough',
    NODE_ENV: 'test'
  }
})

afterEach(() => {
  process.env = originalEnv
})

describe('Encryption', () => {
  describe('encrypt/decrypt', () => {
    it('should encrypt and decrypt text correctly', () => {
      const plaintext = 'Hello, World!'
      const encrypted = encrypt(plaintext)
      const decrypted = decrypt(encrypted)
      
      expect(decrypted).toBe(plaintext)
    })

    it('should produce different encrypted outputs for same input', () => {
      const plaintext = 'Hello, World!'
      const encrypted1 = encrypt(plaintext)
      const encrypted2 = encrypt(plaintext)
      
      expect(encrypted1).not.toBe(encrypted2)
      expect(decrypt(encrypted1)).toBe(plaintext)
      expect(decrypt(encrypted2)).toBe(plaintext)
    })

    it('should handle empty strings', () => {
      const plaintext = ''
      const encrypted = encrypt(plaintext)
      const decrypted = decrypt(encrypted)
      
      expect(decrypted).toBe(plaintext)
    })

    it('should handle unicode characters', () => {
      const plaintext = '🔐 Secure data with émojis and àccents!'
      const encrypted = encrypt(plaintext)
      const decrypted = decrypt(encrypted)
      
      expect(decrypted).toBe(plaintext)
    })

    it('should handle long strings', () => {
      const plaintext = 'A'.repeat(10000)
      const encrypted = encrypt(plaintext)
      const decrypted = decrypt(encrypted)
      
      expect(decrypted).toBe(plaintext)
    })

    it('should throw error when encryption password is missing', () => {
      delete process.env.ENCRYPTION_PASSWORD
      delete process.env.SESSION_SECRET
      
      expect(() => encrypt('test')).toThrow('ENCRYPTION_PASSWORD or SESSION_SECRET must be set')
    })

    it('should throw error when decrypting with wrong password', () => {
      const plaintext = 'test data'
      const encrypted = encrypt(plaintext)
      
      // Change password
      process.env.ENCRYPTION_PASSWORD = 'different-password-that-should-fail-decryption'
      
      expect(() => decrypt(encrypted)).toThrow()
    })

    it('should throw error when decrypting invalid data', () => {
      expect(() => decrypt('invalid-encrypted-data')).toThrow()
    })
  })

  describe('secureCompare', () => {
    it('should return true for identical strings', () => {
      const str1 = 'test-string'
      const str2 = 'test-string'
      
      expect(secureCompare(str1, str2)).toBe(true)
    })

    it('should return false for different strings', () => {
      const str1 = 'test-string'
      const str2 = 'different-string'
      
      expect(secureCompare(str1, str2)).toBe(false)
    })

    it('should return false for strings of different lengths', () => {
      const str1 = 'short'
      const str2 = 'much-longer-string'
      
      expect(secureCompare(str1, str2)).toBe(false)
    })

    it('should return false for empty vs non-empty strings', () => {
      const str1 = ''
      const str2 = 'non-empty'
      
      expect(secureCompare(str1, str2)).toBe(false)
    })

    it('should return true for two empty strings', () => {
      const str1 = ''
      const str2 = ''
      
      expect(secureCompare(str1, str2)).toBe(true)
    })
  })

  describe('generateSecureToken', () => {
    it('should generate token of default length', () => {
      const token = generateSecureToken()
      
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.length).toBeGreaterThan(0)
    })

    it('should generate token of specified length', () => {
      const length = 16
      const token = generateSecureToken(length)
      
      // Base64URL encoding: 4 chars per 3 bytes, so 16 bytes = ~22 chars
      expect(token.length).toBeGreaterThan(length)
    })

    it('should generate different tokens on each call', () => {
      const token1 = generateSecureToken()
      const token2 = generateSecureToken()
      
      expect(token1).not.toBe(token2)
    })

    it('should generate tokens that are base64url safe', () => {
      const token = generateSecureToken()
      
      // Base64URL should not contain +, /, or = characters
      expect(token).not.toMatch(/[+/=]/)
    })

    it('should handle different token sizes', () => {
      const sizes = [8, 16, 32, 64, 128]
      
      sizes.forEach(size => {
        const token = generateSecureToken(size)
        expect(token).toBeDefined()
        expect(token.length).toBeGreaterThan(0)
      })
    })
  })
})