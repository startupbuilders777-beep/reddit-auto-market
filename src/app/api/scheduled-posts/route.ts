import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const scheduledPosts = await prisma.scheduledPost.findMany({
      where: {
        campaign: {
          userId: session.user.id
        }
      },
      include: {
        campaign: {
          select: {
            id: true,
            name: true,
            color: true
          }
        }
      },
      orderBy: {
        scheduledAt: 'asc'
      }
    })

    return NextResponse.json({ posts: scheduledPosts })
  } catch (error) {
    console.error('Error fetching scheduled posts:', error)
    return NextResponse.json({ error: 'Failed to fetch scheduled posts' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { campaignId, content, scheduledAt } = body

    if (!campaignId || !content || !scheduledAt) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify campaign belongs to user
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: campaignId,
        userId: session.user.id
      }
    })

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    const scheduledPost = await prisma.scheduledPost.create({
      data: {
        campaignId,
        content,
        scheduledAt: new Date(scheduledAt),
        status: 'PENDING'
      },
      include: {
        campaign: {
          select: {
            id: true,
            name: true,
            color: true
          }
        }
      }
    })

    return NextResponse.json({ post: scheduledPost })
  } catch (error) {
    console.error('Error creating scheduled post:', error)
    return NextResponse.json({ error: 'Failed to create scheduled post' }, { status: 500 })
  }
}
