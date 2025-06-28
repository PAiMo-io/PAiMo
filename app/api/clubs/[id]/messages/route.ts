import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../../auth'
import Pusher from 'pusher'

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
})

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const { text } = await request.json()
  const user = session?.user as any
  const username = user?.username || user?.email || 'anonymous'
  await pusher.trigger(`club-${params.id}`, 'message', {
    user: username,
    text,
    timestamp: Date.now(),
  })
  return NextResponse.json({ success: true })
}
