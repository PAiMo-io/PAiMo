import { NextResponse } from 'next/server'
import Pusher from 'pusher'

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
})

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  let body: { matchId?: string; scores?: [number, number]; senderId?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false }, { status: 400 })
  }
  const { matchId, scores, senderId } = body
  if (!matchId || !Array.isArray(scores) || scores.length !== 2 || !senderId) {
    return NextResponse.json({ success: false }, { status: 400 })
  }
  await pusher.trigger(`score-entry-${params.id}`, 'update', {
    matchId,
    scores,
    senderId,
  })
  return NextResponse.json({ success: true })
}
