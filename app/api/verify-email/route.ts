import { NextResponse } from 'next/server';
import connect from '@/utils/mongoose';
import User from '@/models/User';
import PendingUser from '@/models/PendingUser';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');
  if (!token) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
  }
  await connect();
  const pending = await PendingUser.findOne({ token });
  if (!pending) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
  }
  const { email } = pending;
  const existing = await User.findOne({ email });
  if (!existing) {
    await User.create({ email });
  }
  await PendingUser.deleteOne({ token });
  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_APP_URL}/create-profile?email=${encodeURIComponent(email)}`
  );
}
