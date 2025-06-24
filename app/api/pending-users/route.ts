import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import connect from '@/utils/mongoose';
import PendingUser from '@/models/PendingUser';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'super-admin') {
    return NextResponse.json({ success: false }, { status: 403 });
  }
  await connect();
  const pendings = await PendingUser.find({}, { email: 1, createdAt: 1 });
  return NextResponse.json({
    users: pendings.map(p => ({
      id: p._id.toString(),
      email: p.email,
      createdAt: p.createdAt,
    })),
  });
}
