import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const accountId = searchParams.get('id')

  if (!accountId) {
    return NextResponse.json({ error: 'Account ID required' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // Verify the account belongs to this user
  const account = await prisma.redditAccount.findFirst({
    where: {
      id: accountId,
      userId: user.id
    }
  })

  if (!account) {
    return NextResponse.json({ error: 'Account not found' }, { status: 404 })
  }

  // Delete the account
  await prisma.redditAccount.delete({
    where: { id: accountId }
  })

  return NextResponse.json({ success: true })
}
