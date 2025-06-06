import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    const result = await prisma.$queryRaw`SELECT 1 as test`
    
    return NextResponse.json({
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      result
    })
  } catch (error: any) {
    console.error('Test endpoint error:', error)
    
    return NextResponse.json({
      status: 'error',
      database: 'failed',
      error: error.message,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    }, { status: 500 })
  }
}