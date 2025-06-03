import { NextRequest, NextResponse } from 'next/server'
import { facebookAPI } from '@/lib/facebook'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(
      new URL(`/companies/connect?error=${encodeURIComponent(error)}`, request.url)
    )
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/companies/connect?error=no_code', request.url)
    )
  }

  try {
    const userToken = await facebookAPI.exchangeCodeForToken(code)
    const pages = await facebookAPI.getUserPages(userToken)

    // Store pages in session or pass as URL parameters for user to select
    const pagesData = encodeURIComponent(JSON.stringify(pages))
    
    return NextResponse.redirect(
      new URL(`/companies/connect/select-page?pages=${pagesData}`, request.url)
    )
  } catch (error) {
    console.error('Facebook callback error:', error)
    return NextResponse.redirect(
      new URL('/companies/connect?error=auth_failed', request.url)
    )
  }
}