import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../auth';
import connect from '../../../../utils/mongoose';
import Club from '../../../../models/Club';
import Event from '../../../../models/Event';
import User from '../../../../models/User';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ success: false }, { status: 401 });
  }
  await connect();
  const club: any = await Club.findById(params.id).populate('adminList', 'username nickname image avatarUpdatedAt').lean();
  if (!club) {
    return NextResponse.json({ success: false }, { status: 404 });
  }
  const memberIds = club.members.map((m: any) => m.id);
  const members: any[] = await User.find(
    { _id: { $in: memberIds } },
    { username: 1, nickname: 1, gender: 1, image: 1, role: 1, avatarUpdatedAt: 1 }
  ).lean();
  const events: any[] = await Event.find({ club: params.id }, {
    name: 1,
    status: 1,
    visibility: 1,
    registrationEndTime: 1,
    location: 1,
    createdAt: 1,
    participants: 1,
  }).lean();
  return NextResponse.json({
    club: {
      id: club._id.toString(),
      name: club.name,
      description: club.description,
      location: club.location,
      logoUrl: club.logoUrl,
      visibility: club.visibility,
      createdBy: club.createdBy,
      createdAt: club.createdAt,
    },
    adminList: (club.adminList || []).map((admin: any) => ({
      id: admin._id.toString(),
      username: admin.username,
      nickname: admin.nickname,
      image: admin.image || null,
      avatarUpdatedAt: admin.avatarUpdatedAt,
    })),
    members: members.map(m => ({
      id: m._id.toString(),
      username: m.username,
      nickname: m.nickname,
      gender: m.gender,
      image: m.image || null,
      role: m.role,
      avatarUpdatedAt: m.avatarUpdatedAt,
    })),
    events: events.map(e => ({
      id: e._id.toString(),
      name: e.name,
      status: e.status,
      visibility: e.visibility,
      registrationEndTime: e.registrationEndTime,
      location: e.location,
      createdAt: e.createdAt,
      participantCount: e.participants.length,
    })),
  });
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ success: false }, { status: 401 });
  }
  await connect();
  const club = await Club.findById(params.id);
  if (!club) {
    return NextResponse.json({ success: false }, { status: 404 });
  }
  const user = await User.findById(session.user.id);
  if (!user) {
    return NextResponse.json({ success: false }, { status: 404 });
  }
  const username = user.username || user.email || 'unknown';
  const already = club.members.some((m: any) => m.id.toString() === user._id.toString());
  if (!already) {
    club.members.push({ id: user._id, username });
    await club.save();
  }
  if (!Array.isArray(user.clubs)) user.clubs = [];
  if (!user.clubs.some((c: any) => c.toString() === club._id.toString())) {
    user.clubs.push(club._id);
    await user.save();
  }
  return NextResponse.json({ success: true });
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ success: false }, { status: 401 });
  }
  
  await connect();
  const club = await Club.findById(params.id);
  if (!club) {
    return NextResponse.json({ success: false }, { status: 404 });
  }
  
  // Check if user is admin of this specific club or super-admin
  const isClubAdmin = club.adminList.some((adminId: any) => adminId.toString() === session.user?.id);
  const isSuperAdmin = session.user?.role === 'super-admin';
  
  if (!isClubAdmin && !isSuperAdmin) {
    return NextResponse.json({ success: false }, { status: 403 });
  }
  const { name, description, location, logoUrl, visibility } = await request.json();
  if (name !== undefined) club.name = name;
  if (description !== undefined) club.description = description;
  if (location !== undefined) club.location = location;
  if (logoUrl !== undefined) club.logoUrl = logoUrl;
  if (visibility !== undefined) club.visibility = visibility;
  await club.save();
  return NextResponse.json({ success: true });
}
