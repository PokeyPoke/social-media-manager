import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const approvePostSchema = z.object({
  action: z.enum(['APPROVED', 'REJECTED', 'REQUESTED_CHANGES']),
  notes: z.string().optional(),
  scheduledTime: z.string().datetime().optional()
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = approvePostSchema.parse(body)

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: params.id },
      include: {
        campaign: {
          include: {
            company: true
          }
        }
      }
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Create approval record
    const approval = await prisma.approval.create({
      data: {
        postId: params.id,
        userId: session.user!.id,
        action: data.action,
        notes: data.notes
      }
    })

    // Update post status based on approval action
    let newStatus = post.status
    let updateData: any = {}

    switch (data.action) {
      case 'APPROVED':
        if (data.scheduledTime) {
          newStatus = 'SCHEDULED'
          updateData.scheduledTime = new Date(data.scheduledTime)
        } else {
          newStatus = 'APPROVED'
        }
        break
      case 'REJECTED':
        newStatus = 'CANCELLED'
        break
      case 'REQUESTED_CHANGES':
        newStatus = 'DRAFT'
        break
    }

    const updatedPost = await prisma.post.update({
      where: { id: params.id },
      data: {
        status: newStatus,
        ...updateData
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
        }
      }
    })

    return NextResponse.json({ 
      post: updatedPost,
      approval 
    })
  } catch (error) {
    console.error('Approve post error:', error)
    return NextResponse.json(
      { error: 'Failed to process approval' },
      { status: 500 }
    )
  }
}