import { NextResponse } from 'next/server';
import connect from '@/utils/mongoose';
import User from '@/models/User';
import PendingUser from '@/models/PendingUser';
import { randomBytes } from 'crypto';
import { Resend } from 'resend';
import { renderLocalizedEmailTemplate } from '@/utils/templates/renderEmailTemplates';

export async function POST(request: Request) {
  const { email, lang } = await request.json();
  if (!email) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  await connect();
  const existing = await User.findOne({ email });
  if (existing) {
    return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
  }
  const pending = await PendingUser.findOne({ email });
  if (pending) {
    await pending.deleteOne();
  }
  
  const token = randomBytes(32).toString('hex');
  await PendingUser.create({ email, token });
 
  const resend = new Resend(process.env.RESEND_API_KEY || '');
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) {
    console.error('NEXT_PUBLIC_APP_URL is not set');
  } else {
    const { html, subject } = await renderLocalizedEmailTemplate('register-email', lang, {
      verifyUrl: `${appUrl}/api/verify-email?token=${token}&lang=${lang}`,
      appUrl,
      year: new Date().getFullYear(),
    });
    try {
      await resend.emails.send({
        from: 'PAiMO <hello@paimo.io>',
        to: email,
        subject,
        html,
      });
    } catch (e) {
      console.error('Failed to send verification email', e);
    }
  }

  return NextResponse.json({ success: true });
}
