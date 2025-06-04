import { z } from 'zod'

// Define the schema for environment variables
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url().startsWith('postgresql://'),
  
  // Authentication
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET must be at least 32 characters'),
  ENCRYPTION_PASSWORD: z.string().min(32).optional(),
  
  // Facebook API
  FACEBOOK_APP_ID: z.string().min(1),
  FACEBOOK_APP_SECRET: z.string().min(1),
  FACEBOOK_REDIRECT_URI: z.string().url(),
  
  // Google Gemini API
  GOOGLE_GEMINI_API_KEY: z.string().min(1),
  
  // Application
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().regex(/^\d+$/).transform(Number).default('3000'),
  
  // Optional features
  REDIS_URL: z.string().url().optional(),
  SENTRY_DSN: z.string().url().optional(),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
})

type EnvConfig = z.infer<typeof envSchema>

let cachedConfig: EnvConfig | null = null

export function validateEnv(): EnvConfig {
  if (cachedConfig) return cachedConfig
  
  try {
    cachedConfig = envSchema.parse(process.env)
    return cachedConfig
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map(issue => {
        const path = issue.path.join('.')
        return `  - ${path}: ${issue.message}`
      }).join('\n')
      
      throw new Error(
        `Environment validation failed:\n${issues}\n\n` +
        'Please check your .env file and ensure all required variables are set.'
      )
    }
    throw error
  }
}

// Export validated environment variables
export const env = new Proxy({} as EnvConfig, {
  get(target, prop: string) {
    if (!cachedConfig) {
      cachedConfig = validateEnv()
    }
    return cachedConfig[prop as keyof EnvConfig]
  }
})

// Helper to check if we're in production
export const isProduction = () => env.NODE_ENV === 'production'

// Helper to check if we're in development
export const isDevelopment = () => env.NODE_ENV === 'development'

// Initialize validation on module load
if (typeof process !== 'undefined' && process.env) {
  validateEnv()
}