import { NextRequest, NextResponse } from 'next/server'
import { withAuthenticatedMiddleware } from '@/lib/middleware'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const createManualPostSchema = z.object({
  campaignId: z.string(),
  content: z.object({
    message: z.string().min(1).max(500),
    hashtags: z.array(z.string()).optional().default([]),
    tone: z.string().optional().default('professional'),
    isManual: z.boolean().optional().default(true)
  }),
  status: z.enum(['DRAFT', 'PENDING_APPROVAL']).optional().default('DRAFT'),
  scheduledTime: z.string().datetime().optional()
})

export const POST = withAuthenticatedMiddleware(async (request: NextRequest, context?: any) => {
  const body = await request.json()
  const data = createManualPostSchema.parse(body)

  // Verify campaign exists and user has access
  const campaign = await prisma.campaign.findUnique({
    where: { id: data.campaignId },
    include: {
      company: true
    }
  })

  if (!campaign) {
    return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
  }

  // Create manual post
  const post = await prisma.post.create({
    data: {
      campaignId: data.campaignId,
      aiGeneratedContent: {
        ...data.content,
        generationMethod: 'manual',
        estimatedEngagement: 'medium',
        suggestedImagePrompt: `Image for post about ${campaign.theme || 'social media'}`
      },
      status: data.status,
      scheduledTime: data.scheduledTime ? new Date(data.scheduledTime) : null
    },
    include: {
      campaign: {
        include: {
          company: true
        }
      }
    }
  })

  return NextResponse.json({ 
    post,
    message: 'Manual post created successfully'
  })
})