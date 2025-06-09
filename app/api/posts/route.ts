import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { postFilterSchema, validateQuery } from '@/lib/validation'
import { withAuthenticatedMiddleware } from '@/lib/middleware'

export const GET = withAuthenticatedMiddleware(async (request: NextRequest, context?: any) => {
  // Validate query parameters
  const validation = validateQuery(postFilterSchema)(request)
  if (validation instanceof NextResponse) {
    return validation // Return validation error response
  }
  
  const { 
    status, 
    campaignId, 
    companyId, 
    dateFrom, 
    dateTo,
    page, 
    limit, 
    sortBy = 'createdAt', 
    sortOrder 
  } = validation.data

  // Build where clause
  const where: any = {}
  if (status) where.status = status
  if (campaignId) where.campaignId = campaignId
  if (companyId) {
    where.campaign = { companyId }
  }
  
  // Date filtering
  if (dateFrom || dateTo) {
    where.createdAt = {}
    if (dateFrom) where.createdAt.gte = new Date(dateFrom)
    if (dateTo) where.createdAt.lte = new Date(dateTo)
  }

  // Calculate pagination
  const skip = (page - 1) * limit

  // Build sort order
  const orderBy: any = {}
  orderBy[sortBy] = sortOrder

  // Execute query with pagination
  const [posts, totalCount] = await Promise.all([
    prisma.post.findMany({
      where,
      include: {
        campaign: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                status: true
              }
            }
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
          orderBy: { timestamp: 'desc' },
          take: 3 // Limit recent approvals
        },
        revisions: {
          orderBy: { createdAt: 'desc' },
          take: 3, // Limit recent revisions
          select: {
            id: true,
            reason: true,
            createdAt: true
          }
        }
      },
      orderBy,
      take: limit,
      skip
    }),
    prisma.post.count({ where })
  ])

  // Calculate pagination metadata
  const totalPages = Math.ceil(totalCount / limit)
  const hasNextPage = page < totalPages
  const hasPreviousPage = page > 1

  return NextResponse.json({
    data: posts,
    pagination: {
      page,
      limit,
      total: totalCount,
      totalPages,
      hasNextPage,
      hasPreviousPage,
      nextPage: hasNextPage ? page + 1 : null,
      previousPage: hasPreviousPage ? page - 1 : null
    },
    filters: {
      status,
      campaignId,
      companyId,
      dateFrom,
      dateTo
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestedBy: context?.user?.id
    }
  })
})