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
  const { level } = await request.json()
  if (level == null) {
    return NextResponse.json({ success: false }, { status: 400 })
  }
  await connect()
  await User.findByIdAndUpdate(session.user.id, {
    level,
    placementComplete: true,
  })
  return NextResponse.json({ success: true })
}
