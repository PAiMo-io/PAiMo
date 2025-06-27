import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/auth'
import connect from '@/utils/mongoose'
import User from '@/models/User'
import { Resend } from 'resend'
import { renderLocalizedEmailTemplate } from '@/utils/templates/renderEmailTemplates'

export async function POST(
  request: Request,
  { params }: { params: { username: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'super-admin') {
    return NextResponse.json({ success: false }, { status: 403 })
  }
  await connect()
  const user = await User.findOne({ username: params.username })
  if (!user) {
    return NextResponse.json({ success: false }, { status: 404 })
  }
  user.profileComplete = false
  user.level = null
  await user.save()

  const resend = new Resend(process.env.RESEND_API_KEY || '')
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  if (appUrl) {
    try {
      const { html, subject } = await renderLocalizedEmailTemplate(
        'reset-placement-email',
        user.lang,
        {
          placementUrl: `${appUrl}/create-profile?email=${encodeURIComponent(user.email)}&lang=${user.lang}`,
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
