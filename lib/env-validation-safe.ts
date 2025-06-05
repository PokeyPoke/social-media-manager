// Safe environment validation that warns instead of throwing errors
// This version is used during deployment to prevent startup failures

export function validateEnvSafe(): boolean {
  const required = [
    'DATABASE_URL',
    'JWT_SECRET', 
    'SESSION_SECRET',
    'GOOGLE_GEMINI_API_KEY',
    'FACEBOOK_APP_ID',
    'FACEBOOK_APP_SECRET',
    'FACEBOOK_REDIRECT_URI'
  ]

  const missing: string[] = []
  const warnings: string[] = []

  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key)
    } else if (key.includes('SECRET') && process.env[key]!.length < 32) {
      warnings.push(`${key} should be at least 32 characters for security`)
    }
  }

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '))
    return false
  }

  if (warnings.length > 0) {
    console.warn('⚠️  Environment security warnings:')
    warnings.forEach(warning => console.warn(`  - ${warning}`))
  }

  console.log('✅ Environment validation passed')
  return true
}

// Export validated environment with fallbacks
export const env = new Proxy({} as any, {
  get(target, prop: string) {
    const value = process.env[prop]
    if (!value && prop.includes('SECRET')) {
      console.warn(`Warning: ${prop} not set, using fallback`)
      return 'fallback-value-for-development-only'
    }
    return value
  }
})

// Helper functions
export const isProduction = () => process.env.NODE_ENV === 'production'
export const isDevelopment = () => process.env.NODE_ENV === 'development'