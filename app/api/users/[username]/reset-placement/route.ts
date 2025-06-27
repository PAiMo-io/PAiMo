import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/auth'
import connect from '@/utils/mongoose'
import User from '@/models/User'

export async function POST(
  request: Request,
  { params }: { params: { username: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'super-admin') {
    return NextResponse.json({ success: false }, { status: 403 })
  }
  await connect()
  const user = await User.findOneAndUpdate(
    { username: params.username },
    { profileComplete: false, level: null }
  )
  if (!user) {
    return NextResponse.json({ success: false }, { status: 404 })
  }
  return NextResponse.json({ success: true })
}
