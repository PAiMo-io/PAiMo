import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../auth'
import connect from '../../../../utils/mongoose'
import PlacementLevel from '../../../../models/PlacementLevel'
import Club from '../../../../models/Club'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || !(session.user?.role === 'super-admin' || session.user?.role === 'admin')) {
    return NextResponse.json({ success: false }, { status: 403 })
  }
  const { code, name, min, max, order } = await request.json()
  await connect()
  const level = await PlacementLevel.findById(params.id)
  if (!level) return NextResponse.json({ success: false }, { status: 404 })
  if (session.user.role !== 'super-admin') {
    const club = await Club.findById(level.club)
    const isAdmin = club?.adminList.some((id: any) => id.toString() === session.user?.id)
    if (!isAdmin) {
      return NextResponse.json({ success: false }, { status: 403 })
    }
  }
  await PlacementLevel.findByIdAndUpdate(params.id, { code, name, min, max, order })
  return NextResponse.json({ success: true })
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || !(session.user?.role === 'super-admin' || session.user?.role === 'admin')) {
    return NextResponse.json({ success: false }, { status: 403 })
  }
  await connect()
  const level = await PlacementLevel.findById(params.id)
  if (!level) return NextResponse.json({ success: false }, { status: 404 })
  if (session.user.role !== 'super-admin') {
    const club = await Club.findById(level.club)
    const isAdmin = club?.adminList.some((id: any) => id.toString() === session.user?.id)
    if (!isAdmin) {
      return NextResponse.json({ success: false }, { status: 403 })
    }
  }
  await PlacementLevel.findByIdAndDelete(params.id)
  return NextResponse.json({ success: true })
}
