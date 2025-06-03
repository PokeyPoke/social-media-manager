import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'
import { facebookAPI } from '@/lib/facebook'
import { z } from 'zod'

const updateCompanySchema = z.object({
  name: z.string().min(2).optional(),
  facebookPageId: z.string().optional(),
  pageAccessToken: z.string().optional(),
  brandSettings: z.object({
    voice: z.string(),
    tone: z.string(),
    targetAudience: z.string(),
    contentThemes: z.array(z.string()),
    postingGuidelines: z.string().optional()
  }).optional(),
  defaultInstructions: z.string().optional(),
  timezone: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional()
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        campaigns: {
          include: {
            posts: {
              take: 10,
              orderBy: { createdAt: 'desc' }
            },
            _count: {
              select: {
                posts: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            campaigns: true
          }
        }
      }
    })

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    return NextResponse.json({ company })
  } catch (error) {
    console.error('Get company error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch company' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = updateCompanySchema.parse(body)

    let updateData: any = { ...data }
    
    // Handle Facebook token update
    if (data.pageAccessToken && data.facebookPageId) {
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

      updateData.accessTokenEncrypted = facebookAPI.encryptToken(data.pageAccessToken)
    }

    // Remove pageAccessToken from update data as it's not a database field
    delete updateData.pageAccessToken

    const { id } = await params
    const company = await prisma.company.update({
      where: { id },
      data: updateData,
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
    console.error('Update company error:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Facebook page already connected to another company' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to update company' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    await prisma.company.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Company deleted successfully' })
  } catch (error: any) {
    console.error('Delete company error:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }
    
    return NextResponse.json(
      { error: 'Failed to delete company' },
      { status: 500 }
    )
  }
}