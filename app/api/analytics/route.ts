import { NextRequest, NextResponse } from 'next/server'
import { withAuthenticatedMiddleware } from '@/lib/middleware'
import { prisma } from '@/lib/db'

export const GET = withAuthenticatedMiddleware(async (request: NextRequest, context?: any) => {
  const { searchParams } = new URL(request.url)
  const days = parseInt(searchParams.get('days') || '30')
  
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  try {
    // Get basic counts
    const [totalPosts, totalCompanies, totalCampaigns] = await Promise.all([
      prisma.post.count({
        where: {
          createdAt: {
            gte: startDate
          }
        }
      }),
      prisma.company.count(),
      prisma.campaign.count()
    ])

    // Get posts with engagement data
    const postsWithEngagement = await prisma.post.findMany({
      where: {
        createdAt: {
          gte: startDate
        },
        status: 'POSTED'
      },
      include: {
        campaign: {
          include: {
            company: true
          }
        }
      }
    })

    // Calculate total engagement
    const totalEngagement = postsWithEngagement.reduce((sum, post) => {
      const metrics = post.engagementMetrics as any
      if (metrics) {
        return sum + (metrics.likes || 0) + (metrics.comments || 0) + (metrics.shares || 0)
      }
      return sum
    }, 0)

    const averageEngagement = totalPosts > 0 ? totalEngagement / totalPosts : 0

    // Find top performing post
    const topPerformingPost = postsWithEngagement.reduce((top, post) => {
      const metrics = post.engagementMetrics as any
      const engagement = metrics ? (metrics.likes || 0) + (metrics.comments || 0) + (metrics.shares || 0) : 0
      
      if (!top || engagement > top.engagement) {
        const content = post.aiGeneratedContent as any
        return {
          id: post.id,
          text: content.message || content.text || 'No content available',
          engagement,
          company: post.campaign.company.name
        }
      }
      return top
    }, null as any)

    // Get daily metrics for the chart
    const recentMetrics = []
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      
      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)

      const dayPosts = await prisma.post.count({
        where: {
          createdAt: {
            gte: date,
            lt: nextDate
          }
        }
      })

      const dayEngagement = await prisma.post.findMany({
        where: {
          createdAt: {
            gte: date,
            lt: nextDate
          },
          status: 'POSTED'
        }
      }).then(posts => posts.reduce((sum, post) => {
        const metrics = post.engagementMetrics as any
        if (metrics) {
          return sum + (metrics.likes || 0) + (metrics.comments || 0) + (metrics.shares || 0)
        }
        return sum
      }, 0))

      recentMetrics.push({
        date: date.toISOString().split('T')[0],
        posts: dayPosts,
        engagement: dayEngagement
      })
    }

    // Get company breakdown
    const companies = await prisma.company.findMany({
      include: {
        _count: {
          select: {
            campaigns: true
          }
        }
      }
    })

    const companyBreakdown = await Promise.all(
      companies.map(async (company) => {
        const companyPosts = await prisma.post.count({
          where: {
            campaign: {
              companyId: company.id
            },
            createdAt: {
              gte: startDate
            }
          }
        })

        const companyEngagement = await prisma.post.findMany({
          where: {
            campaign: {
              companyId: company.id
            },
            createdAt: {
              gte: startDate
            },
            status: 'POSTED'
          }
        }).then(posts => posts.reduce((sum, post) => {
          const metrics = post.engagementMetrics as any
          if (metrics) {
            return sum + (metrics.likes || 0) + (metrics.comments || 0) + (metrics.shares || 0)
          }
          return sum
        }, 0))

        return {
          company: company.name,
          posts: companyPosts,
          engagement: companyEngagement
        }
      })
    )

    const analytics = {
      totalPosts,
      totalEngagement,
      averageEngagement: Math.round(averageEngagement * 10) / 10,
      topPerformingPost,
      recentMetrics,
      companyBreakdown: companyBreakdown.filter(c => c.posts > 0),
      summary: {
        totalCompanies,
        totalCampaigns,
        dateRange: {
          from: startDate.toISOString(),
          to: new Date().toISOString(),
          days
        }
      }
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Analytics fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
})