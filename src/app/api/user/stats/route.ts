import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      redditAccounts: {
        select: {
          id: true,
          username: true,
          karma: true,
          isActive: true,
          createdAt: true,
        }
      },
      subscription: {
        include: {
          pricingTier: true
        }
      }
    }
  })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // Get usage stats - comments this month
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const commentsThisMonth = await prisma.comment.count({
    where: {
      redditAccount: {
        userId: user.id
      },
      createdAt: {
        gte: startOfMonth
      }
    }
  })

  // Get campaign count
  const campaignCount = await prisma.campaign.count({
    where: { userId: user.id }
  })

  return NextResponse.json({
    user: {
      email: user.email,
      name: user.name,
      image: user.image,
    },
    redditAccounts: user.redditAccounts,
    subscription: user.subscription,
    usage: {
      commentsThisMonth,
      campaignCount,
    }
  })
}
