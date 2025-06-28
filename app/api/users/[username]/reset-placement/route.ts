import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/auth'
import connect from '@/utils/mongoose'
import User from '@/models/User'
import Club from '@/models/Club'
import { Resend } from 'resend'
import { renderLocalizedEmailTemplate } from '@/utils/templates/renderEmailTemplates'

export async function POST(
  request: Request,
  { params }: { params: { username: string } }
) {
  const session = await getServerSession(authOptions)
  const { searchParams } = new URL(request.url)
  const clubId = searchParams.get('clubId')
  if (!session || !(session.user?.role === 'super-admin' || session.user?.role === 'admin')) {
    return NextResponse.json({ success: false }, { status: 403 })
  }
  await connect()
  const user = await User.findOne({ username: params.username })
  if (!user) {
    return NextResponse.json({ success: false }, { status: 404 })
  }
  if (session.user.role !== 'super-admin') {
    if (!clubId) return NextResponse.json({ success: false }, { status: 403 })
    const club = await Club.findById(clubId)
    const isAdmin = club?.adminList.some((id: any) => id.toString() === session.user?.id)
    const isMember = club?.members.some((m: any) => m.id.toString() === user._id.toString())
    if (!isAdmin || !isMember) {
      return NextResponse.json({ success: false }, { status: 403 })
    }
  }
  user.placementComplete = false
  user.level = null
  if (clubId) {
    user.placementScores = user.placementScores.filter(
      (p: any) => p.club.toString() !== clubId
    )
    if (user.placementClub && user.placementClub.toString() === clubId) {
      user.placementClub = null
    }
  } else {
    user.placementScores = []
    user.placementClub = null
  }
  await user.save()

  const resend = new Resend(process.env.RESEND_API_KEY || '')
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  if (appUrl) {
    try {
      const { html, subject } = await renderLocalizedEmailTemplate(
        'reset-placement-email',
        user.lang,
        {
          placementUrl: `${appUrl}/placement?email=${encodeURIComponent(user.email)}&lang=${user.lang}${clubId ? `&clubId=${clubId}` : ''}`,
          appUrl,
          year: new Date().getFullYear(),
        }
      )
      await resend.emails.send({
        from: 'PAiMO <hello@paimo.io>',
        to: user.email,
        subject,
        html,
      })
    } catch (e) {
      console.error('Failed to send placement reset email', e)
    }
  }

  return NextResponse.json({ success: true })
}
