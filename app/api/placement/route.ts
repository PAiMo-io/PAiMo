import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../auth'
import connect from '../../../utils/mongoose'
import User from '../../../models/User'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ success: false }, { status: 401 })
  }
  const { level, clubId } = await request.json()
  if (level == null || !clubId) {
    return NextResponse.json({ success: false }, { status: 400 })
  }
  await connect()
  const user = await User.findById(session.user.id)
  if (!user) {
    return NextResponse.json({ success: false }, { status: 404 })
  }
  user.level = level
  user.placementComplete = true
  user.placementClub = clubId
  const existing = user.placementScores.find((p: any) => p.club.toString() === clubId)
  if (existing) {
    existing.score = level
  } else {
    user.placementScores.push({ club: clubId, score: level })
  }
  await user.save()
  return NextResponse.json({ success: true })
}
