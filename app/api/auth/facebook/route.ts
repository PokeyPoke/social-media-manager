import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const facebookAuthURL = new URL('https://www.facebook.com/v18.0/dialog/oauth')
  
  facebookAuthURL.searchParams.append('client_id', process.env.FACEBOOK_APP_ID!)
  facebookAuthURL.searchParams.append('redirect_uri', process.env.FACEBOOK_REDIRECT_URI!)
  facebookAuthURL.searchParams.append('scope', 'pages_manage_posts,pages_read_engagement,pages_show_list')
  facebookAuthURL.searchParams.append('response_type', 'code')
  facebookAuthURL.searchParams.append('state', 'facebook_auth')

  return NextResponse.redirect(facebookAuthURL.toString())
}