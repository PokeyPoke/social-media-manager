import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const updatePostSchema = z.object({
  finalContent: z.object({
    message: z.string(),
    hashtags: z.array(z.string()).optional(),
    suggestedImagePrompt: z.string().optional(),
    tone: z.string().optional(),
    estimatedEngagement: z.enum(['low', 'medium', 'high']).optional()
  }).optional(),
  status: z.enum(['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'SCHEDULED', 'POSTED', 'FAILED', 'CANCELLED']).optional(),
  scheduledTime: z.string().datetime().optional()
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

    const post = await prisma.post.findUnique({
      where: { id: params.id },
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
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    return NextResponse.json({ post })
  } catch (error) {
    console.error('Get post error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch post' },
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
    const data = updatePostSchema.parse(body)

    // Get current post to check if content changed
    const currentPost = await prisma.post.findUnique({
      where: { id: params.id }
    })

    if (!currentPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Create revision if content changed
    if (data.finalContent) {
      await prisma.postRevision.create({
        data: {
          postId: params.id,
          content: data.finalContent,
          reason: 'Manual edit'
        }
      })
    }

    const post = await prisma.post.update({
      where: { id: params.id },
      data: {
        ...data,
        scheduledTime: data.scheduledTime ? new Date(data.scheduledTime) : undefined,
        updatedAt: new Date()
      },
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
      }
    })

    return NextResponse.json({ post })
  } catch (error: any) {
    console.error('Update post error:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }
    
    return NextResponse.json(
      { error: 'Failed to update post' },
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

    await prisma.post.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Post deleted successfully' })
  } catch (error: any) {
    console.error('Delete post error:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }
    
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    )
  }
}