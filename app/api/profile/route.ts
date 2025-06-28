import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth';
import connect from '../../../utils/mongoose';
import User from '../../../models/User';
import PlacementLevel from '../../../models/PlacementLevel';
import bcrypt from 'bcryptjs';
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ success: false }, { status: 401 });
  }
  const { email, username, clubId } = await request.json();

  if (!email && !username) {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  await connect();

  const query = email ? { email } : { username };
  const user = await User.findOne(query).populate({ path: 'clubs', strictPopulate: false });

  let code: string | undefined
  let name: string | undefined
  let level: number | undefined
  if (user) {
    const club = clubId || user.placementClub?.toString()
    if (club) {
      const entry = user.placementScores.find((p: any) => p.club.toString() === club)
      level = entry ? entry.score : user.level
      if (level != null) {
        const lvl = await PlacementLevel.findOne({ club, min: { $lte: level }, max: { $gte: level } })
        if (lvl) { code = lvl.code; name = lvl.name }
      }
    }
  }

  if (!user) {
    return NextResponse.json({ success: false }, { status: 404 });
  }

  return NextResponse.json({
    email: user.email,
    username: user.username,
    nickname: user.nickname,
    role: user.role,
    image: user.image,
    clubs: Array.isArray(user.clubs)
      ? (user.clubs as any[]).map(c => c.name)
      : [],
    levelCode: code,
    levelName: name,
  });
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ success: false }, { status: 401 });
  }
  const { username, password, nickname } = await request.json();

  if (username === undefined && password === undefined && nickname === undefined) {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  await connect();
  const update: any = {};
  if (username !== undefined) update.username = username;
  if (nickname !== undefined) update.nickname = nickname;
  if (password !== undefined) {
    const hashed = await bcrypt.hash(password, 10);
    update.password = hashed;
  }
  await User.updateOne({ _id: session.user.id }, update);

  return NextResponse.json({ success: true });
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  const { searchParams } = new URL(request.url)
  const clubId = searchParams.get('clubId') || undefined

  await connect();
  const user = await User.findOne({ _id: session.user.id }).populate({ path: 'clubs', strictPopulate: false });
  let code: string | undefined
  let name: string | undefined
  let level: number | undefined
  if (user) {
    const club = clubId || user.placementClub?.toString()
    if (club) {
      const entry = user.placementScores.find((p: any) => p.club.toString() === club)
      level = entry ? entry.score : user.level
      if (level != null) {
        const lvl = await PlacementLevel.findOne({ club, min: { $lte: level }, max: { $gte: level } })
        if (lvl) { code = lvl.code; name = lvl.name }
      }
    }
  }
  const result = {
    user: {
      email: user.email,
      username: user.username,
      nickname: user.nickname,
      role: user.role,
      image: user.image,
      clubs: Array.isArray(user.clubs)
        ? (user.clubs as any[]).map(c => c.name)
        : [],
      levelCode: code,
      levelName: name,
    }
  };
  return NextResponse.json(result);
}
