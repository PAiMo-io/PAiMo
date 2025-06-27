import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../auth'
import connect from '../../../../utils/mongoose'
import PlacementPart from '../../../../models/PlacementPart'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || !(session.user?.role === 'super-admin' || session.user?.role === 'admin')) {
    return NextResponse.json({ success: false }, { status: 403 })
  }
  const { name, order, weight, multiplier, questions } = await request.json()
  await connect()
  await PlacementPart.findByIdAndUpdate(params.id, { name, order, weight, multiplier, questions })
  return NextResponse.json({ success: true })
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || !(session.user?.role === 'super-admin' || session.user?.role === 'admin')) {
    return NextResponse.json({ success: false }, { status: 403 })
  }
  await connect()
  await PlacementPart.findByIdAndDelete(params.id)
  return NextResponse.json({ success: true })
}
