import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connect from '@/utils/mongoose';
import PasswordReset from '@/models/PasswordReset';
import User from '@/models/User';

export async function POST(request: Request) {
  const { token, password } = await request.json();
  if (!token || !password) {
    return NextResponse.json({ success: false }, { status: 400 });
  }
  await connect();
  const entry = await PasswordReset.findOne({ token });
  if (!entry) {
    return NextResponse.json({ success: false }, { status: 400 });
  }
  const hashed = await bcrypt.hash(password, 10);
  await User.updateOne({ email: entry.email }, { password: hashed });
  await PasswordReset.deleteOne({ token });
  return NextResponse.json({ success: true });
}
