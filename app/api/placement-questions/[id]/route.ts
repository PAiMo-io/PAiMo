import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../auth'
import connect from '../../../../utils/mongoose'
import PlacementQuestion from '../../../../models/PlacementQuestion'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || !(session.user?.role === 'super-admin' || session.user?.role === 'admin')) {
    return NextResponse.json({ success: false }, { status: 403 })
  }
  const { question, options, order } = await request.json()
  await connect()
  await PlacementQuestion.findByIdAndUpdate(params.id, { question, options, order })
  return NextResponse.json({ success: true })
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || !(session.user?.role === 'super-admin' || session.user?.role === 'admin')) {
    return NextResponse.json({ success: false }, { status: 403 })
  }
  await connect()
  await PlacementQuestion.findByIdAndDelete(params.id)
  return NextResponse.json({ success: true })
}
