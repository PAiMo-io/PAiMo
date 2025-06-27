import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../auth'
import connect from '../../../utils/mongoose'
import PlacementLevel from '../../../models/PlacementLevel'

export async function GET() {
  await connect()
  const levels = await PlacementLevel.find({}, null, { sort: { order: 1, min: 1 } })
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
  const { code, name, min, max, order } = await request.json()
  await connect()
  const level = await PlacementLevel.create({ code, name, min, max, order })
  return NextResponse.json({ id: level._id.toString() })
}
