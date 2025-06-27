import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import connect from '@/utils/mongoose';
import PendingUser from '@/models/PendingUser';
import { Resend } from 'resend';
import { renderLocalizedEmailTemplate } from '@/utils/templates/renderEmailTemplates';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { lang } = await request.json()
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'super-admin') {
    return NextResponse.json({ success: false }, { status: 403 });
  }
  await connect();
  const pending = await PendingUser.findById(params.id);
  if (!pending) {
    return NextResponse.json({ success: false }, { status: 404 });
  }
  const resend = new Resend(process.env.RESEND_API_KEY || '');
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  try {
    const { html, subject } = await renderLocalizedEmailTemplate(
      "confirm-email",
      lang || "en",
      {
        verifyUrl: `${appUrl}/api/verify-email?token=${pending.token}&lang=${lang}`,
        appUrl,
        year: new Date().getFullYear(),
      }
    );
    await resend.emails.send({
      from: 'PAiMO <hello@paimo.io>',
      to: pending.email,
      subject,
      html
    });
  } catch (e) {
    console.error('Failed to send verification email', e);
  }
  return NextResponse.json({ success: true });
}
