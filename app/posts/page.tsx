import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import PostsClient from './posts-client'

export default async function PostsPage() {
  const session = await getSession()
  
  if (!session.isLoggedIn) {
    redirect('/auth/login')
  }

  return <PostsClient />
}