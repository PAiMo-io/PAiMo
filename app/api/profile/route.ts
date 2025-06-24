import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth';
import connect from '../../../utils/mongoose';
import User from '../../../models/User';
import bcrypt from 'bcryptjs';
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ success: false }, { status: 401 });
  }
  const { email, username } = await request.json();

  if (!email && !username) {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  await connect();

  const query = email ? { email } : { username };
  const user = await User.findOne(query).populate({ path: 'clubs', strictPopulate: false });

  if (!user) {
    return NextResponse.json({ success: false }, { status: 404 });
  }

  return NextResponse.json({
    email: user.email,
    username: user.username,
    role: user.role,
    image: user.image,
    clubs: Array.isArray(user.clubs)
      ? (user.clubs as any[]).map(c => c.name)
      : [],
  });
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ success: false }, { status: 401 });
  }
  const { username, password } = await request.json();

  if (username === undefined && password === undefined) {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  await connect();
  const update: any = {};
  if (username !== undefined) update.username = username;
  if (password !== undefined) {
    const hashed = await bcrypt.hash(password, 10);
    update.password = hashed;
  }
  await User.updateOne({ _id: session.user.id }, update);

  return NextResponse.json({ success: true });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  await connect();
  const user = await User.findOne({ _id: session.user.id }).populate({ path: 'clubs', strictPopulate: false });
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
    }
  };
  return NextResponse.json(result);
}
