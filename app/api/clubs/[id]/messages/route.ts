import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../../auth'
import { getDb } from '@/lib/db'
import { ObjectId } from 'mongodb'
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

  const userIds = Array.from(
    new Set(messages.map(m => m.senderId).filter(Boolean))
  )
  const users = await db
    .collection('users')
    .find(
      { _id: { $in: userIds.map(id => new ObjectId(id)) } },
      { projection: { username: 1, email: 1, nickname: 1, image: 1 } }
    )
    .toArray()
  const map = new Map(
    users.map(u => [u._id.toString(), u])
  )
  const result = messages
    .reverse()
    .map(m => ({
      ...m,
      senderNickname:
        m.senderNickname ||
        map.get(m.senderId)?.nickname ||
        map.get(m.senderId)?.username ||
        map.get(m.senderId)?.email ||
        m.senderName,
      senderAvatarUrl: m.senderAvatarUrl || map.get(m.senderId)?.image || null,
    }))

  return NextResponse.json({ messages: result })
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
  const user = await db.collection('users').findOne(
    { _id: new ObjectId(session.user.id) },
    { projection: { username: 1, email: 1, nickname: 1, image: 1 } }
  )
  const doc = {
    clubId: params.id,
    senderId: session.user.id,
    senderName: user?.username || user?.email || 'anonymous',
    senderNickname: user?.nickname || user?.username || user?.email || 'anonymous',
    senderAvatarUrl: user?.image || null,
    content,
    timestamp: new Date(),
  }
  await db.collection('messages').insertOne(doc)
  await pusher.trigger(`club-${params.id}`, 'message', {
    senderId: doc.senderId,
    senderName: doc.senderName,
    senderNickname: doc.senderNickname,
    senderAvatarUrl: doc.senderAvatarUrl,
    content: doc.content,
    timestamp: doc.timestamp,
  })
  return NextResponse.json({ success: true })
}
