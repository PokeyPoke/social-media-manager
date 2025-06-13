import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    const dbTest = await prisma.$queryRaw`SELECT 1 as test`
    
    // Check if companies table exists
    const companiesCount = await prisma.company.count()
    
    // Check environment variables
    const envCheck = {
      hasEncryptionKey: !!process.env.ENCRYPTION_KEY,
      hasFacebookAppId: !!process.env.FACEBOOK_APP_ID,
      hasFacebookAppSecret: !!process.env.FACEBOOK_APP_SECRET,
      hasGeminiKey: !!process.env.GOOGLE_GEMINI_API_KEY,
      nodeEnv: process.env.NODE_ENV,
      encryptionKeyLength: process.env.ENCRYPTION_KEY?.length || 0
    }
    
    return NextResponse.json({
      status: 'ok',
      database: 'connected',
      companiesCount,
      environment: envCheck,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('Debug endpoint error:', error)
    return NextResponse.json({
      status: 'error',
      error: error.message,
      code: error.code,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}