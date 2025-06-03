import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const updateCampaignSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  theme: z.string().optional(),
  contentStrategy: z.object({
    postFrequency: z.string(),
    postTimes: z.array(z.string()),
    contentTypes: z.array(z.string()),
    includeHashtags: z.boolean().default(true),
    includeEmojis: z.boolean().default(true),
    maxLength: z.number().default(280)
  }).optional(),
  scheduleSettings: z.object({
    timezone: z.string(),
    activeDays: z.array(z.number()),
    startTime: z.string(),
    endTime: z.string()
  }).optional(),
  status: z.enum(['ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED']).optional()
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id: params.id },
      include: {
        company: true,
        posts: {
          include: {
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
              orderBy: { timestamp: 'desc' },
              take: 1
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            posts: true
          }
        }
      }
    })

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    return NextResponse.json({ campaign })
  } catch (error) {
    console.error('Get campaign error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch campaign' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = updateCampaignSchema.parse(body)

    const campaign = await prisma.campaign.update({
      where: { id: params.id },
      data,
      include: {
        company: true,
        posts: {
          take: 10,
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            posts: true
          }
        }
      }
    })

    return NextResponse.json({ campaign })
  } catch (error: any) {
    console.error('Update campaign error:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }
    
    return NextResponse.json(
      { error: 'Failed to update campaign' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.campaign.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Campaign deleted successfully' })
  } catch (error: any) {
    console.error('Delete campaign error:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }
    
    return NextResponse.json(
      { error: 'Failed to delete campaign' },
      { status: 500 }
    )
  }
}