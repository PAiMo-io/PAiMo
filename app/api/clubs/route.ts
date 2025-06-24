import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth';
import connect from '../../../utils/mongoose';
import Club from '../../../models/Club';
import User from '../../../models/User';

export async function GET(request: Request) {
  await connect();
  const url = new URL(request.url);
  const showAll = url.searchParams.get('all') === '1';
  const query = showAll ? {} : { visibility: 'public' };
  const clubs = await Club.find(query, {
    name: 1,
    description: 1,
    location: 1,
    logoUrl: 1,
    createdBy: 1,
    createdAt: 1,
  });
  return NextResponse.json({ clubs });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'super-admin') {
    return NextResponse.json({ success: false }, { status: 403 });
  }
  const { name, description, location, logoUrl, visibility } = await request.json();
  await connect();
  const user = await User.findById(session.user.id);
  const username = user?.username || user?.email || 'unknown';
  const club = await Club.create({
    name,
    description,
    location,
    logoUrl,
    visibility: visibility === 'public' ? 'public' : 'private',
    createdBy: user?.email || '',
    createdAt: new Date(),
    members: [{ id: user._id, username }],
  });
  // also store the club reference on user for convenience
  if (user) {
    if (!Array.isArray(user.clubs)) user.clubs = [];
    if (!user.clubs.some((c: any) => c.toString() === club._id.toString())) {
      user.clubs.push(club._id);
      await user.save();
    }
  }
  return NextResponse.json({ success: true });
}
