import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../auth'
import connect from '../../../utils/mongoose'
import PlacementPart from '../../../models/PlacementPart'
import Club from '../../../models/Club'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const clubId = searchParams.get('clubId')
  if (!clubId) return NextResponse.json({ parts: [] })
  await connect()
  const parts = await PlacementPart.find({ club: clubId }, null, { sort: { order: 1 } })
  return NextResponse.json({
    parts: parts.map(p => ({
      id: p._id.toString(),
      name: p.name,
      order: p.order,
      weight: p.weight,
      multiplier: p.multiplier,
      questions: (p.questions || []).map((q: any) => ({
        id: q._id.toString(),
        question: q.question,
        order: q.order,
        options: (q.options || []).map((o: any) => ({ text: o.text, score: o.score }))
      }))
    }))
  })
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || !(session.user?.role === 'super-admin' || session.user?.role === 'admin')) {
    return NextResponse.json({ success: false }, { status: 403 })
  }
  const { clubId, name, order, weight, multiplier, questions } = await request.json()
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
  const part = await PlacementPart.create({ club: clubId, name, order, weight, multiplier, questions })
  return NextResponse.json({ id: part._id.toString() })
}
