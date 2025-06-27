import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../auth'
import connect from '../../../utils/mongoose'
import PlacementPart from '../../../models/PlacementPart'

export async function GET() {
  await connect()
  const parts = await PlacementPart.find({}, null, { sort: { order: 1 } })
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
  const { name, order, weight, multiplier, questions } = await request.json()
  await connect()
  const part = await PlacementPart.create({ name, order, weight, multiplier, questions })
  return NextResponse.json({ id: part._id.toString() })
}
