import { NextRequest, NextResponse } from 'next/server'
import { withAuthenticatedMiddleware } from '@/lib/middleware'
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

export const GET = withAuthenticatedMiddleware(async (request: NextRequest, context?: any) => {
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
})

export const POST = withAuthenticatedMiddleware(async (request: NextRequest, context?: any) => {
  try {
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
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Facebook page already connected to another company' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to create company' },
      { status: 500 }
    )
  }
})