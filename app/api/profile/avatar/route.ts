import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../auth';
import connect from '../../../../utils/mongoose';
import User from '../../../../models/User';
import sharp from 'sharp';
import { uploadAvatar } from '../../../../lib/r2';

async function compressAvatar(data: Buffer): Promise<Buffer> {
  let width = 256;
  const limit = 10 * 1024; // 10KB max
  let quality = 80;

  let output = await sharp(data)
    .resize(width, width, { fit: 'cover' })
    .webp({ quality })
    .toBuffer();

  while (output.byteLength > limit && quality > 50) {
    width = Math.floor(width * 0.9);
    quality -= 10;
    if (width < 96) return output; // Avoid slicing corrupted output
    output = await sharp(data)
      .resize(width, width, { fit: 'cover' })
      .webp({ quality })
      .toBuffer();
  }

  return output;
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('avatar');

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ success: false, message: 'No avatar file' }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const compressed = await compressAvatar(Buffer.from(arrayBuffer));

  await connect();

  const key = `avatars/${session.user.id}.webp`;
  const url = await uploadAvatar(key, compressed, 'image/webp');

  await User.updateOne({ _id: session.user.id }, { image: url });

  return NextResponse.json({ success: true, url });
}