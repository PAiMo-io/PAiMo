import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth';
import connect from '../../../utils/mongoose';
import User from '../../../models/User';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'super-admin') {
    return NextResponse.json({ success: false }, { status: 403 });
  }
  await connect();
  const users = await User.find(
    {},
    { _id: 0, username: 1, role: 1, placementComplete: 1, bypassPlacement: 1, level: 1 }
  );
  return NextResponse.json({ users });
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'super-admin') {
    return NextResponse.json({ success: false }, { status: 403 });
  }
  const { username, role, bypassPlacement } = await request.json();
  await connect();
  const update: any = {};
  if (role !== undefined) update.role = role;
  if (bypassPlacement !== undefined) update.bypassPlacement = bypassPlacement;
  await User.updateOne({ username }, update);
  return NextResponse.json({ success: true });
}
