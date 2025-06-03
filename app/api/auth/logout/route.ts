import { NextRequest, NextResponse } from 'next/server'
import { destroySession } from '@/lib/session'

export async function POST(request: NextRequest) {
  try {
    await destroySession()
    return NextResponse.json({ message: 'Logged out successfully' })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    )
  }
}