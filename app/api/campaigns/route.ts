import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const createCampaignSchema = z.object({
  companyId: z.string(),
  name: z.string().min(2),
  description: z.string().optional(),
  theme: z.string().optional(),
  contentStrategy: z.object({
    postFrequency: z.string(),
    postTimes: z.array(z.string()),
    contentTypes: z.array(z.string()),
    includeHashtags: z.boolean().default(true),
    includeEmojis: z.boolean().default(true),
    maxLength: z.number().default(280)
  }),
  scheduleSettings: z.object({
    timezone: z.string(),
    activeDays: z.array(z.number()),
    startTime: z.string(),
    endTime: z.string()
  })
})

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')

    const where = companyId ? { companyId } : {}

    const campaigns = await prisma.campaign.findMany({
      where,
      include: {
        company: true,
        posts: {
          take: 5,
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            posts: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ campaigns })
  } catch (error) {
    console.error('Get campaigns error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = createCampaignSchema.parse(body)

    // Verify company exists
    const company = await prisma.company.findUnique({
      where: { id: data.companyId }
    })

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    const campaign = await prisma.campaign.create({
      data: {
        companyId: data.companyId,
        name: data.name,
        description: data.description,
        theme: data.theme,
        contentStrategy: data.contentStrategy,
        scheduleSettings: data.scheduleSettings
      },
      include: {
        company: true,
        posts: true,
        _count: {
          select: {
            posts: true
          }
        }
      }
    })

    return NextResponse.json({ campaign })
  } catch (error: any) {
    console.error('Create campaign error:', error)
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    )
  }
}