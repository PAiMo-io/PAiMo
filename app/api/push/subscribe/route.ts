import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../auth'
import { getDb } from '@/lib/db'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user?.id) {
    return NextResponse.json({ success: false }, { status: 401 })
  }
  const subscription = await request.json()
  const db = await getDb()
  await db.collection('push_subscriptions').updateOne(
    { endpoint: subscription.endpoint },
    { $set: { ...subscription, userId: session.user.id } },
    { upsert: true }
  )
  return NextResponse.json({ success: true })
}
