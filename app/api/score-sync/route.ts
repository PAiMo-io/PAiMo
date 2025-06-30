import { NextResponse } from 'next/server'
import { pusherServer } from '@/lib/pusher-server'

export async function POST(request: Request) {
  const { eventId, teamIndex, scoreValue, senderId } = await request.json()
  if (!eventId || typeof teamIndex !== 'number' || typeof scoreValue !== 'number' || !senderId) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }
  await pusherServer.trigger(`score-entry-${eventId}`, 'score-update', {
    eventId,
    teamIndex,
    scoreValue,
    senderId,
  })
  return NextResponse.json({ success: true })
}
