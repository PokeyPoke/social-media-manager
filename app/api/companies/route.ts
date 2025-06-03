import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'
import { facebookAPI } from '@/lib/facebook'
import { z } from 'zod'

const createCompanySchema = z.object({
  name: z.string().min(2),
  facebookPageId: z.string().optional(),
  pageAccessToken: z.string().optional(),
  brandSettings: z.object({
    voice: z.string(),
    tone: z.string(),
    targetAudience: z.string(),
    contentThemes: z.array(z.string()),
    postingGuidelines: z.string().optional()
  }),
  defaultInstructions: z.string().optional(),
  timezone: z.string().default('UTC')
})

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const companies = await prisma.company.findMany({
      include: {
        campaigns: {
          take: 5,
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            campaigns: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ companies })
  } catch (error) {
    console.error('Get companies error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch companies' },
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
    const data = createCompanySchema.parse(body)

    let encryptedToken = null
    if (data.pageAccessToken && data.facebookPageId) {
      // Test the Facebook connection before saving
      const isValid = await facebookAPI.testConnection(
        data.facebookPageId,
        data.pageAccessToken
      )
      
      if (!isValid) {
        return NextResponse.json(
          { error: 'Invalid Facebook page credentials' },
          { status: 400 }
        )
      }

      encryptedToken = facebookAPI.encryptToken(data.pageAccessToken)
    }

    const company = await prisma.company.create({
      data: {
        name: data.name,
        facebookPageId: data.facebookPageId,
        accessTokenEncrypted: encryptedToken,
        brandSettings: data.brandSettings,
        defaultInstructions: data.defaultInstructions,
        timezone: data.timezone
      },
      include: {
        campaigns: true,
        _count: {
          select: {
            campaigns: true
          }
        }
      }
    })

    return NextResponse.json({ company })
  } catch (error: any) {
    console.error('Create company error:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Facebook page already connected to another company' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create company' },
      { status: 500 }
    )
  }
}