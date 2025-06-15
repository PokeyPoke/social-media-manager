import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'
import { geminiAI } from '@/lib/gemini'
import { z } from 'zod'

const generateContentSchema = z.object({
  campaignId: z.string(),
  postType: z.enum(['promotional', 'educational', 'engaging', 'announcement']),
  contentTheme: z.string(),
  customInstructions: z.string().optional(),
  count: z.number().min(1).max(5).default(1)
})

export async function POST(request: NextRequest) {
  console.log('Content generation POST request received')
  
  try {
    // Check authentication
    const session = await getSession()
    if (!session.isLoggedIn) {
      console.log('Authentication failed - no session')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.log('Authentication successful')

    // Parse request body
    const body = await request.json()
    console.log('Request body parsed:', body)
    
    const data = generateContentSchema.parse(body)
    console.log('Schema validation passed:', data)

    // Get campaign and company details
    const campaign = await prisma.campaign.findUnique({
      where: { id: data.campaignId },
      include: {
        company: true
      }
    })

    if (!campaign) {
      console.log('Campaign not found:', data.campaignId)
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }
    console.log('Campaign found:', campaign.id, campaign.name)

    const brandSettings = campaign.company.brandSettings as any || {}
    const contentStrategy = campaign.contentStrategy as any || {}

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
    console.log('Generation request prepared:', generationRequest)

    // Generate content variations using Gemini AI
    const generatedContent = await geminiAI.generateMultipleVariations(
      generationRequest,
      data.count
    )
    console.log('Content generated successfully:', generatedContent.length, 'variations')

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
    console.log('Posts created in database:', posts.length)

    return NextResponse.json({ posts })
    
  } catch (error: any) {
    console.error('Content generation error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      cause: error.cause
    })
    
    // Return a proper error response instead of throwing
    return NextResponse.json(
      { 
        error: 'Content generation failed', 
        details: error.message,
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    )
  }
}