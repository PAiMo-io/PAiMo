import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../../auth'
import { getDb } from '@/lib/db'
import Pusher from 'pusher'

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
})

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const db = await getDb()
  const messages = await db
    .collection('messages')
    .find({ clubId: params.id })
    .sort({ timestamp: -1 })
    .limit(50)
    .toArray()
  return NextResponse.json({ messages: messages.reverse() })
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user?.id) {
    return NextResponse.json({ success: false }, { status: 401 })
  }
  const { content } = await request.json()
  if (!content) {
    return NextResponse.json({ success: false }, { status: 400 })
  }
  const db = await getDb()
  const user = session.user as any
  const doc = {
    clubId: params.id,
    senderId: session.user.id,
    senderName: user.username || user.email || 'anonymous',
    content,
    timestamp: new Date(),
  }
  await db.collection('messages').insertOne(doc)
  await pusher.trigger(`club-${params.id}`, 'message', {
    senderName: doc.senderName,
    content: doc.content,
    timestamp: doc.timestamp,
  })
  return NextResponse.json({ success: true })
}
