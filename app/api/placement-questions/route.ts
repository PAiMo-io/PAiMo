import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../auth'
import connect from '../../../utils/mongoose'
import PlacementQuestion from '../../../models/PlacementQuestion'

export async function GET() {
  await connect()
  const questions = await PlacementQuestion.find({}, null, { sort: { order: 1 } })
  return NextResponse.json({
    questions: questions.map(q => ({
      id: q._id.toString(),
      question: q.question,
      order: q.order,
      options: (q.options || []).map((o: any) => ({ text: o.text, score: o.score }))
    }))
  })
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || !(session.user?.role === 'super-admin' || session.user?.role === 'admin')) {
    return NextResponse.json({ success: false }, { status: 403 })
  }
  const { question, options, order } = await request.json()
  await connect()
  const q = await PlacementQuestion.create({ question, options, order })
  return NextResponse.json({ id: q._id.toString() })
}
