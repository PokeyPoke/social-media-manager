import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { facebookAPI } from '@/lib/facebook'

export async function POST(request: NextRequest) {
  try {
    // Get all posts that are scheduled for posting
    const now = new Date()
    const scheduledPosts = await prisma.post.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledTime: {
          lte: now
        }
      },
      include: {
        campaign: {
          include: {
            company: true
          }
        }
      }
    })

    const results = []

    for (const post of scheduledPosts) {
      const company = post.campaign.company
      
      if (!company.facebookPageId || !company.accessTokenEncrypted) {
        console.log(`Skipping post ${post.id}: Company ${company.name} missing Facebook credentials`)
        
        // Mark as failed
        await prisma.post.update({
          where: { id: post.id },
          data: { 
            status: 'FAILED',
            updatedAt: new Date()
          }
        })
        
        results.push({
          postId: post.id,
          status: 'failed',
          reason: 'Missing Facebook credentials'
        })
        continue
      }

      try {
        // Decrypt the page access token
        const pageToken = facebookAPI.decryptToken(company.accessTokenEncrypted)
        
        // Prepare the post content
        const content = post.aiGeneratedContent as any
        const finalContent = post.finalContent as any || content
        
        const facebookPost = {
          message: finalContent.message || finalContent.text || '',
          published: true
        }

        // Post to Facebook
        const fbResponse = await facebookAPI.createPost(
          company.facebookPageId,
          pageToken,
          facebookPost
        )

        // Update post status to POSTED
        await prisma.post.update({
          where: { id: post.id },
          data: {
            status: 'POSTED',
            facebookPostId: fbResponse.id,
            postedTime: new Date(),
            updatedAt: new Date()
          }
        })

        console.log(`Successfully posted to Facebook: ${fbResponse.id}`)
        
        results.push({
          postId: post.id,
          status: 'posted',
          facebookPostId: fbResponse.id
        })

      } catch (error) {
        console.error(`Failed to post ${post.id} to Facebook:`, error)
        
        // Mark as failed
        await prisma.post.update({
          where: { id: post.id },
          data: { 
            status: 'FAILED',
            updatedAt: new Date()
          }
        })
        
        results.push({
          postId: post.id,
          status: 'failed',
          reason: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json({
      message: `Processed ${scheduledPosts.length} scheduled posts`,
      results
    })

  } catch (error) {
    console.error('Post scheduler error:', error)
    return NextResponse.json(
      { error: 'Failed to process scheduled posts' },
      { status: 500 }
    )
  }
}