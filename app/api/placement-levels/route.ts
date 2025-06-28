import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../auth'
import connect from '../../../utils/mongoose'
import PlacementLevel from '../../../models/PlacementLevel'
import Club from '../../../models/Club'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const clubId = searchParams.get('clubId')
  if (!clubId) return NextResponse.json({ levels: [] })
  await connect()
  const levels = await PlacementLevel.find({ club: clubId }, null, { sort: { order: 1, min: 1 } })
  return NextResponse.json({
    levels: levels.map(l => ({
      id: l._id.toString(),
      code: l.code,
      name: l.name,
      min: l.min,
      max: l.max,
      order: l.order,
    }))
  })
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || !(session.user?.role === 'super-admin' || session.user?.role === 'admin')) {
    return NextResponse.json({ success: false }, { status: 403 })
  }
  const { clubId, code, name, min, max, order } = await request.json()
  if (!clubId) {
    return NextResponse.json({ success: false }, { status: 400 })
  }
  await connect()
  if (session.user.role !== 'super-admin') {
    const club = await Club.findById(clubId)
    const isAdmin = club?.adminList.some((id: any) => id.toString() === session.user?.id)
    if (!isAdmin) {
      return NextResponse.json({ success: false }, { status: 403 })
    }
  }
  const level = await PlacementLevel.create({ club: clubId, code, name, min, max, order })
  return NextResponse.json({ id: level._id.toString() })
}
