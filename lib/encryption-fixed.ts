import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const KEY_LENGTH = 32 // 256 bits
const IV_LENGTH = 16 // 128 bits
const TAG_LENGTH = 16 // 128 bits
const SALT_LENGTH = 64 // 512 bits

// Derive encryption key from password using PBKDF2
function deriveKey(password: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(password, salt, 100000, KEY_LENGTH, 'sha256')
}

export function encrypt(text: string): string {
  const password = process.env.ENCRYPTION_PASSWORD || process.env.SESSION_SECRET
  if (!password) {
    throw new Error('ENCRYPTION_PASSWORD or SESSION_SECRET must be set')
  }

  // Generate random salt and IV
  const salt = crypto.randomBytes(SALT_LENGTH)
  const iv = crypto.randomBytes(IV_LENGTH)
  
  // Derive key from password and salt
  const key = deriveKey(password, salt)
  
  // Create cipher
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  
  // Encrypt the text
  const encrypted = Buffer.concat([
    cipher.update(text, 'utf8'),
    cipher.final()
  ])
  
  // Get the authentication tag
  const authTag = cipher.getAuthTag()
  
  // Combine salt, iv, authTag, and encrypted data
  const combined = Buffer.concat([salt, iv, authTag, encrypted])
  
  // Return base64 encoded string
  return combined.toString('base64')
}

export function decrypt(encryptedData: string): string {
  const password = process.env.ENCRYPTION_PASSWORD || process.env.SESSION_SECRET
  if (!password) {
    throw new Error('ENCRYPTION_PASSWORD or SESSION_SECRET must be set')
  }

  // Decode from base64
  const combined = Buffer.from(encryptedData, 'base64')
  
  // Extract components
  const salt = combined.subarray(0, SALT_LENGTH)
  const iv = combined.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH)
  const authTag = combined.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH)
  const encrypted = combined.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH)
  
  // Derive key from password and salt
  const key = deriveKey(password, salt)
  
  // Create decipher
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)
  
  // Decrypt
  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final()
  ])
  
  return decrypted.toString('utf8')
}

// Helper function to securely compare strings (prevent timing attacks)
export function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b))
}

// Generate a cryptographically secure random token
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('base64url')
}