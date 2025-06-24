'use server'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../../auth'
import connect from '../../../../../utils/mongoose'
import Club from '../../../../../models/Club'
import User from '../../../../../models/User'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user?.id) {
    return NextResponse.json({ success: false }, { status: 401 })
  }

  await connect()
  const club = await Club.findById(params.id)
  if (!club) {
    return NextResponse.json({ success: false }, { status: 404 })
  }
  const memberIndex = club.members.findIndex((m: any) => m.id.toString() === session.user.id)
  if (memberIndex === -1) {
    return NextResponse.json({ success: false }, { status: 403 })
  }
  club.members.splice(memberIndex, 1)
  await club.save()

  const user = await User.findById(session.user.id)
  if (user) {
    if (Array.isArray(user.clubs)) {
      user.clubs = user.clubs.filter((c: any) => c.toString() !== params.id)
    }
    await user.save()
  }

  return NextResponse.json({ success: true })
}
