import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth';
import connect from '../../../utils/mongoose';
import User from '../../../models/User';
import Club from '../../../models/Club';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !(session.user?.role === 'super-admin' || session.user?.role === 'admin')) {
    return NextResponse.json({ success: false }, { status: 403 });
  }
  const { searchParams } = new URL(request.url);
  const clubId = searchParams.get('clubId');
  await connect();
  if (session.user.role !== 'super-admin') {
    if (!clubId) return NextResponse.json({ success: false }, { status: 403 });
    const club = await Club.findById(clubId);
    const isAdmin = club?.adminList.some((id: any) => id.toString() === session.user?.id);
    if (!isAdmin) {
      return NextResponse.json({ success: false }, { status: 403 });
    }
  }
  const query = clubId ? { clubs: clubId } : {};
  const users = await User.find(
    query,
    { _id: 0, username: 1, role: 1, placementComplete: 1, bypassPlacement: 1, level: 1 }
  );
  return NextResponse.json({ users });
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !(session.user?.role === 'super-admin' || session.user?.role === 'admin')) {
    return NextResponse.json({ success: false }, { status: 403 });
  }
  const { username, role, bypassPlacement, clubId } = await request.json();
  await connect();
  if (session.user.role !== 'super-admin') {
    if (!clubId) return NextResponse.json({ success: false }, { status: 403 });
    const club = await Club.findById(clubId);
    const isAdmin = club?.adminList.some((id: any) => id.toString() === session.user?.id);
    if (!isAdmin) {
      return NextResponse.json({ success: false }, { status: 403 });
    }
  }
  const update: any = {};
  if (role !== undefined) update.role = role;
  if (bypassPlacement !== undefined) update.bypassPlacement = bypassPlacement;
  await User.updateOne({ username }, update);
  return NextResponse.json({ success: true });
}
