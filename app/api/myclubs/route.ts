import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../auth'
import connect from '../../../utils/mongoose'
import Club from '../../../models/Club'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    return NextResponse.json({ success: false }, { status: 401 })
  }
  await connect()
  const clubs = await Club.find(
    { 'members.id': session.user.id },
    {
      name: 1,
      description: 1,
      location: 1,
      logoUrl: 1,
      createdBy: 1,
      createdAt: 1,
      adminList: 1,
      pendingRequestsCount: 1,
    }
  )
  return NextResponse.json({
    clubs: clubs.map(c => {
      const isAdmin = c.adminList.some((adminId: any) => adminId.toString() === session.user.id);
      return {
        id: c._id.toString(),
        name: c.name,
        description: c.description,
        location: c.location,
        logoUrl: c.logoUrl,
        createdBy: c.createdBy,
        createdAt: c.createdAt,
        pendingRequestsCount: c.pendingRequestsCount || 0,
        isAdmin,
      }
    })
  })
}
