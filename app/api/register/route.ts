import { NextResponse } from 'next/server';
import connect from '@/utils/mongoose';
import User from '@/models/User';
import PendingUser from '@/models/PendingUser';
import { randomBytes } from 'crypto';
import { Resend } from 'resend';

export async function POST(request: Request) {
  const { email } = await request.json();
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
    try {
      await resend.emails.send({
        from: 'PAiMO <hello@paimo.io>',
        to: email,
        subject: '🎉 You’re Almost In! Just Confirm Your Email',
        html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Confirm Your Email</title>
          </head>
          <body style="margin:0; padding:0; background-color:#f4f4f7; font-family:Segoe UI, Tahoma, sans-serif;">
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f4f4f7;">
              <tr>
                <td align="center">
                  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px; margin:0 auto; background:#ffffff; padding:30px 20px; border-radius:10px;">
                    <tr>
                      <td align="center">
                        <img src="${appUrl}/paimo_logo.png" alt="PAiMO Logo" width="160" style="margin-bottom:20px;" />
                      </td>
                    </tr>
                    <tr>
                      <td align="center" style="padding:0 20px;">
                        <h2 style="color:#222; font-size:24px;">Let’s Get This Party Started 🎊</h2>
                        <p style="font-size:16px; line-height:1.6; color:#333;">Welcome to <strong>PAiMO</strong>! You’re just one click away from unlocking all the awesome stuff we’ve got for you.</p>
                      </td>
                    </tr>
                    <tr>
                      <td align="center" style="padding:20px;">
                        <!-- BUTTON USING TABLE -->
                        <table role="presentation" cellspacing="0" cellpadding="0">
                          <tr>
                            <td bgcolor="#007bff" style="border-radius:6px; text-align:center;">
                              <a href="${appUrl}/api/verify-email?token=${token}" target="_blank" style="display:inline-block; padding:14px 28px; font-size:16px; color:#ffffff; text-decoration:none; border-radius:6px;">
                                Confirm My Email
                              </a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:0 20px;">
                        <p style="font-size:14px; color:#555;">If that button doesn’t work, just copy and paste this link into your browser:</p>
                        <p style="word-break:break-all; font-size:14px; color:#007bff;">
                          <a href="${appUrl}/api/verify-email?token=${token}" style="color:#007bff; text-decoration:none;">
                            ${appUrl}/api/verify-email?token=${token}
                          </a>
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td align="center" style="padding-top:30px; font-size:12px; color:#888;">
                        You’re receiving this because you signed up for PAiMO.<br />
                        &copy; ${new Date().getFullYear()} PAiMO. All rights reserved.
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `
      });
    } catch (e) {
      console.error('Failed to send verification email', e);
    }
  }

  return NextResponse.json({ success: true });
}
