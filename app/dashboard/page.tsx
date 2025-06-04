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

  // Serialize data for client component
  const serializedPosts = recentPosts.map(post => ({
    ...post,
    createdAt: post.createdAt.toISOString(),
    scheduledTime: post.scheduledTime?.toISOString() || null,
    postedTime: post.postedTime?.toISOString() || null,
    campaign: {
      ...post.campaign,
      createdAt: post.campaign.createdAt.toISOString(),
      updatedAt: post.campaign.updatedAt.toISOString(),
      company: {
        ...post.campaign.company,
        createdAt: post.campaign.company.createdAt.toISOString(),
        updatedAt: post.campaign.company.updatedAt.toISOString()
      }
    },
    approvals: post.approvals.map(approval => ({
      ...approval,
      timestamp: approval.timestamp.toISOString()
    }))
  }))

  return (
    <DashboardClient 
      user={session.user!}
      companies={companies as any}
      recentPosts={serializedPosts as any}
    />
  )
}