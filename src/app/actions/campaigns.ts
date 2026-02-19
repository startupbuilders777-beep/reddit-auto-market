'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createCampaign(data: {
  name: string
  keywords: string[]
  subreddits: string[]
  dailyLimit: number
  maxLength: number
  blockedKeywords: string[]
  tone: string
}) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  const campaign = await prisma.campaign.create({
    data: {
      userId: session.user.id,
      name: data.name,
      keywords: data.keywords,
      subreddits: data.subreddits,
      dailyLimit: data.dailyLimit,
      maxLength: data.maxLength || 200,
      blockedKeywords: data.blockedKeywords || [],
      tone: data.tone,
      status: 'ACTIVE',
    },
  })

  revalidatePath('/dashboard/campaigns')
  return campaign
}

export async function updateCampaign(id: string, data: Partial<{
  name: string
  keywords: string[]
  subreddits: string[]
  dailyLimit: number
  maxLength: number
  blockedKeywords: string[]
  tone: string
  status: string
}>) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  const campaign = await prisma.campaign.update({
    where: { id, userId: session.user.id },
    data: {
      ...data,
      status: data.status as any,
    },
  })

  revalidatePath('/dashboard/campaigns')
  return campaign
}

export async function deleteCampaign(id: string) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  await prisma.campaign.delete({
    where: { id, userId: session.user.id },
  })

  revalidatePath('/dashboard/campaigns')
}

export async function pauseCampaign(id: string) {
  return updateCampaign(id, { status: 'PAUSED' })
}

export async function resumeCampaign(id: string) {
  return updateCampaign(id, { status: 'ACTIVE' })
}
