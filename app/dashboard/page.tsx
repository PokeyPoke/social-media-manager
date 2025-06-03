import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import DashboardClient from './dashboard-client'

export default async function DashboardPage() {
  const session = await getSession()
  
  if (!session.isLoggedIn) {
    redirect('/auth/login')
  }

  // Fetch initial data
  const [companies, recentPosts] = await Promise.all([
    prisma.company.findMany({
      include: {
        campaigns: {
          take: 3,
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            campaigns: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    }),
    prisma.post.findMany({
      where: {
        status: {
          in: ['PENDING_APPROVAL', 'SCHEDULED', 'POSTED']
        }
      },
      include: {
        campaign: {
          include: {
            company: true
          }
        },
        approvals: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          },
          take: 1,
          orderBy: { timestamp: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })
  ])

  return (
    <DashboardClient 
      user={session.user!}
      companies={companies}
      recentPosts={recentPosts}
    />
  )
}