import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const getPostsSchema = z.object({
  status: z.enum(['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'SCHEDULED', 'POSTED', 'FAILED', 'CANCELLED']).optional(),
  campaignId: z.string().optional(),
  companyId: z.string().optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0)
})

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const queryParams = {
      status: searchParams.get('status'),
      campaignId: searchParams.get('campaignId'),
      companyId: searchParams.get('companyId'),
      limit: parseInt(searchParams.get('limit') || '20'),
      offset: parseInt(searchParams.get('offset') || '0')
    }

    const validatedParams = getPostsSchema.parse(queryParams)

    const where: any = {}
    if (validatedParams.status) where.status = validatedParams.status
    if (validatedParams.campaignId) where.campaignId = validatedParams.campaignId
    if (validatedParams.companyId) {
      where.campaign = { companyId: validatedParams.companyId }
    }

    const [posts, totalCount] = await Promise.all([
      prisma.post.findMany({
        where,
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
                  id: true,
                  name: true,
                  email: true
                }
              }
            },
            orderBy: { timestamp: 'desc' }
          },
          revisions: {
            orderBy: { createdAt: 'desc' },
            take: 5
          }
        },
        orderBy: { createdAt: 'desc' },
        take: validatedParams.limit,
        skip: validatedParams.offset
      }),
      prisma.post.count({ where })
    ])

    return NextResponse.json({
      posts,
      pagination: {
        total: totalCount,
        limit: validatedParams.limit,
        offset: validatedParams.offset,
        hasMore: totalCount > (validatedParams.offset + validatedParams.limit)
      }
    })
  } catch (error) {
    console.error('Get posts error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}