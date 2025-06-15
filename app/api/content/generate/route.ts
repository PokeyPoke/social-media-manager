import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'
import { geminiAI } from '@/lib/gemini'
import { withRateLimit, contentGenerationRateLimit } from '@/lib/rate-limiting'
import { asyncHandler } from '@/lib/error-handling'
import { z } from 'zod'

const generateContentSchema = z.object({
  campaignId: z.string(),
  postType: z.enum(['promotional', 'educational', 'engaging', 'announcement']),
  contentTheme: z.string(),
  customInstructions: z.string().optional(),
  count: z.number().min(1).max(5).default(1)
})

// Temporarily remove rate limiting to debug
export const POST = asyncHandler(async (request: NextRequest) => {
  try {
    const session = await getSession()
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

      const body = await request.json()
      const data = generateContentSchema.parse(body)

    // Get campaign and company details
    const campaign = await prisma.campaign.findUnique({
      where: { id: data.campaignId },
      include: {
        company: true
      }
    })

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    const brandSettings = campaign.company.brandSettings as any
    const contentStrategy = campaign.contentStrategy as any

    // Prepare content generation request
    const generationRequest = {
      companyName: campaign.company.name,
      brandVoice: brandSettings.voice || 'professional',
      contentTheme: data.contentTheme,
      targetAudience: brandSettings.targetAudience || 'general audience',
      postType: data.postType,
      includeHashtags: contentStrategy.includeHashtags !== false,
      includeEmojis: contentStrategy.includeEmojis !== false,
      maxLength: contentStrategy.maxLength || 280,
      customInstructions: data.customInstructions || campaign.company.defaultInstructions || undefined
    }

    // Generate content variations
    let generatedContent
    try {
      generatedContent = await geminiAI.generateMultipleVariations(
        generationRequest,
        data.count
      )
    } catch (aiError: any) {
      console.error('AI generation failed, checking if we can use direct API:', aiError.message)
      
      // Try direct API call as last resort
      if (process.env.GOOGLE_GEMINI_API_KEY && process.env.GOOGLE_GEMINI_API_KEY !== 'your-gemini-api-key') {
        const { generateWithGeminiAPI } = await import('@/lib/gemini-simple')
        try {
          const singleContent = await generateWithGeminiAPI(
            process.env.GOOGLE_GEMINI_API_KEY,
            {
              companyName: campaign.company.name,
              contentTheme: data.contentTheme,
              targetAudience: brandSettings.targetAudience || 'general audience',
              postType: data.postType,
              includeHashtags: contentStrategy.includeHashtags !== false,
              customInstructions: data.customInstructions
            }
          )
          generatedContent = [singleContent]
        } catch (directError) {
          console.error('Direct API also failed:', directError)
          throw aiError // Throw original error
        }
      } else {
        throw aiError
      }
    }

    // Create posts in database with DRAFT status
    const posts = await Promise.all(
      generatedContent.map(content =>
        prisma.post.create({
          data: {
            campaignId: data.campaignId,
            aiGeneratedContent: content as any,
            status: 'DRAFT'
          },
          include: {
            campaign: {
              include: {
                company: true
              }
            }
          }
        })
      )
    )

      return NextResponse.json({ posts })
    } catch (error: any) {
      console.error('Content generation error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
      throw error
    }
  }
)