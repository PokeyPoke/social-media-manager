import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import SettingsClient from './settings-client'

export default async function SettingsPage() {
  const session = await getSession()
  
  if (!session.isLoggedIn || !session.user) {
    redirect('/auth/login')
  }

  return <SettingsClient user={session.user} />
}