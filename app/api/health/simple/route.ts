import { NextRequest, NextResponse } from 'next/server'

// Simple health check endpoint for Railway
// This endpoint returns immediately without checking external services
export async function GET(request: NextRequest): Promise<NextResponse> {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'Service is running'
  }, { 
    status: 200,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  })
}

// HEAD request for load balancers
export async function HEAD(): Promise<NextResponse> {
  return new NextResponse(null, { status: 200 })
}