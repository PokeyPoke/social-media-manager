import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { SessionUser } from './auth'

export interface SessionData {
  user?: SessionUser
  isLoggedIn: boolean
}

const defaultSession: SessionData = {
  isLoggedIn: false
}

export async function getSession() {
  const cookieStore = await cookies()
  const session = await getIronSession<SessionData>(cookieStore, {
    password: process.env.SESSION_SECRET!,
    cookieName: 'social-media-manager-session',
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7 // 7 days
    }
  })

  if (!session.isLoggedIn) {
    session.isLoggedIn = defaultSession.isLoggedIn
  }

  return session
}

export async function createSession(user: SessionUser) {
  const session = await getSession()
  session.user = user
  session.isLoggedIn = true
  await session.save()
}

export async function destroySession() {
  const session = await getSession()
  session.destroy()
}