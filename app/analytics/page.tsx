import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import AnalyticsClient from './analytics-client'

export default async function AnalyticsPage() {
  const session = await getSession()
  
  if (!session.isLoggedIn) {
    redirect('/auth/login')
  }

  return <AnalyticsClient />
}