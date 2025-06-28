import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../../auth';
import connect from '../../../../../utils/mongoose';
import Club from '../../../../../models/Club';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ success: false }, { status: 401 });
  }
  const { memberId, role } = await request.json();
  if (!memberId || !role) {
    return NextResponse.json({ success: false }, { status: 400 });
  }
  await connect();
  const club: any = await Club.findById(params.id);
  if (!club) {
    return NextResponse.json({ success: false }, { status: 404 });
  }
  const requester = club.members.find((m: any) => m.id.toString() === session.user.id);
  const requesterRole = requester?.role;
  const isSuperAdmin = session.user.role === 'super-admin';
  if (!isSuperAdmin && requesterRole !== 'president' && requesterRole !== 'vice') {
    return NextResponse.json({ success: false }, { status: 403 });
  }
  const target = club.members.find((m: any) => m.id.toString() === memberId);
  if (!target) {
    return NextResponse.json({ success: false }, { status: 404 });
  }
  if (target.role === 'president' && requesterRole !== 'president' && !isSuperAdmin) {
    return NextResponse.json({ success: false }, { status: 403 });
  }
  target.role = role;
  if (role === 'president' || role === 'vice') {
    if (!club.adminList.some((a: any) => a.toString() === memberId)) {
      club.adminList.push(memberId);
    }
  } else {
    club.adminList = club.adminList.filter((a: any) => a.toString() !== memberId);
  }
  await club.save();
  return NextResponse.json({ success: true });
}
