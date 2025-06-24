import { NextResponse } from 'next/server';
import connect from '../../../utils/mongoose';
import User from '../../../models/User';
import bcrypt from 'bcryptjs';
import AvatarModule from 'boring-avatars';
const Avatar = (AvatarModule as any).default;
import { uploadAvatar } from '../../../lib/r2';

export async function POST(request: Request) {
  try {
    const { email, username, gender, nickname, wechatId, password } = await request.json()

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      )
    }

    await connect()

    const update: any = { username, gender, nickname, wechatId }
    if (password) {
      const hashed = await bcrypt.hash(password, 10)
      update.password = hashed
    }

    let user = await User.findOneAndUpdate(
      { email },
      { $set: update },
      { new: true, upsert: true }
    )

    if (user && !user.image) {
      const { createElement } = await import('react')
      const { renderToStaticMarkup } = await import('react-dom/server')
      const svg = renderToStaticMarkup(
        createElement(Avatar, {
          size: 256,
          name: user.username || user.email,
          variant: 'beam'
        })
      )
      const key = `avatars/${user._id}.svg`
      const url = await uploadAvatar(key, Buffer.from(svg), 'image/svg+xml')
      user.image = url
      await user.save()
    }

    return NextResponse.json({ success: true, user })
  } catch (err: any) {
    console.error('Failed to upsert user:', err)
    return NextResponse.json(
      { success: false, message: err.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}