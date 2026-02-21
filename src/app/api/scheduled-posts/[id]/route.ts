import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const scheduledPost = await prisma.scheduledPost.findFirst({
      where: {
        id: id,
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
      }
    })

    if (!scheduledPost) {
      return NextResponse.json({ error: 'Scheduled post not found' }, { status: 404 })
    }

    return NextResponse.json({ post: scheduledPost })
  } catch (error) {
    console.error('Error fetching scheduled post:', error)
    return NextResponse.json({ error: 'Failed to fetch scheduled post' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { scheduledAt, content, status } = body

    // Verify scheduled post belongs to user
    const existingPost = await prisma.scheduledPost.findFirst({
      where: {
        id: id,
        campaign: {
          userId: session.user.id
        }
      }
    })

    if (!existingPost) {
      return NextResponse.json({ error: 'Scheduled post not found' }, { status: 404 })
    }

    const updateData: any = {}
    if (scheduledAt) updateData.scheduledAt = new Date(scheduledAt)
    if (content) updateData.content = content
    if (status) updateData.status = status

    const scheduledPost = await prisma.scheduledPost.update({
      where: { id: id },
      data: updateData,
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
    console.error('Error updating scheduled post:', error)
    return NextResponse.json({ error: 'Failed to update scheduled post' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify scheduled post belongs to user
    const existingPost = await prisma.scheduledPost.findFirst({
      where: {
        id: id,
        campaign: {
          userId: session.user.id
        }
      }
    })

    if (!existingPost) {
      return NextResponse.json({ error: 'Scheduled post not found' }, { status: 404 })
    }

    await prisma.scheduledPost.delete({
      where: { id: id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting scheduled post:', error)
    return NextResponse.json({ error: 'Failed to delete scheduled post' }, { status: 500 })
  }
}
