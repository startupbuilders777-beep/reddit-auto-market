import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const campaignId = searchParams.get('campaignId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Build where clause
    const where: any = {
      userId: session.user.id
    }

    if (campaignId) {
      where.id = campaignId
    }

    // Get campaigns with comments
    const campaigns = await prisma.campaign.findMany({
      where,
      include: {
        comments: {
          where: {
            ...(startDate && endDate && {
              createdAt: {
                gte: new Date(startDate),
                lte: new Date(endDate)
              }
            })
          },
          include: {
            redditAccount: {
              select: {
                username: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Generate CSV
    const headers = [
      'Campaign Name',
      'Campaign Status',
      'Keywords',
      'Subreddits',
      'Comment Date',
      'Comment Content',
      'Reddit Post ID',
      'Reddit Comment ID',
      'Upvotes',
      'Replies',
      'Engagement',
      'Comment Status',
      'Reddit Account'
    ]

    const rows = campaigns.flatMap(campaign =>
      campaign.comments.map(comment => [
        campaign.name,
        campaign.status,
        campaign.keywords.join('; '),
        campaign.subreddits.join('; '),
        comment.postedAt?.toISOString() || '',
        `"${(comment.content || '').replace(/"/g, '""')}"`,
        comment.redditPostId || '',
        comment.redditCommentId || '',
        comment.upvotes.toString(),
        comment.replies.toString(),
        comment.engagement.toString(),
        comment.status,
        comment.redditAccount.username
      ])
    )

    // If no comments, add header row
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    // Return CSV as downloadable file
    const filename = campaignId 
      ? `campaign-${campaignId}-export.csv`
      : `all-campaigns-export.csv`

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })
  } catch (error) {
    console.error('Export error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
