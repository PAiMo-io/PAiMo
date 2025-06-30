import { NextResponse } from 'next/server';
import connect from '../../../utils/mongoose';
import User from '../../../models/User';
import PendingUser from '../../../models/PendingUser';
import bcrypt from 'bcryptjs';
import AvatarModule from 'boring-avatars';
const Avatar = (AvatarModule as any).default;
import { uploadAvatar } from '../../../lib/r2';
import sharp from 'sharp';

async function compressAvatar(data: Buffer): Promise<Buffer> {
    let width = 256;
    const limit = 10 * 1024; // 10KB
    let quality = 80;

    let output = await sharp(data).resize(width, width, { fit: 'cover' }).webp({ quality }).toBuffer();

    while (output.byteLength > limit && quality > 50) {
        width = Math.floor(width * 0.9);
        quality -= 10;
        if (width < 96) return output;
        output = await sharp(data).resize(width, width, { fit: 'cover' }).webp({ quality }).toBuffer();
    }

    return output;
}

export async function POST(request: Request) {
    try {
        const form = await request.formData();
        const email = form.get('email') as string | null;
        const username = form.get('username') as string | null;
        const gender = form.get('gender') as string | null;
        const nickname = form.get('nickname') as string | null;
        const wechatId = form.get('wechatId') as string | null;
        const password = form.get('password') as string | null;
        const lang = form.get('lang') as string | null;
        const file = form.get('avatar');

        if (!email) {
            return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 });
        }

        await connect();

        const update: any = {
            username,
            gender,
            nickname,
            wechatId,
            lang,
            profileComplete: true,
            emailVerified: true,
            createProfile: true,
        };

        if (password) {
            const hashed = await bcrypt.hash(password, 10);
            update.password = hashed;
        }

        let user = await User.findOneAndUpdate(
            { email },
            { $set: update, $setOnInsert: { email } },
            { new: true, upsert: true }
        );

        // remove pending user once profile is complete
        await PendingUser.deleteOne({ email });

        if (user) {
            if (file && file instanceof File) {
                const arrayBuffer = await file.arrayBuffer();
                const compressed = await compressAvatar(Buffer.from(arrayBuffer));
                const key = `avatars/${user._id}.webp`;
                const url = await uploadAvatar(key, compressed, 'image/webp');
                user.image = url;
                await user.save();
            } else if (!user.image) {
                const { createElement } = await import('react');
                const { renderToStaticMarkup } = await import('react-dom/server');
                const svg = renderToStaticMarkup(
                    createElement(Avatar, {
                        size: 256,
                        name: user.username || user.email,
                        variant: 'beam',
                    })
                );
                const key = `avatars/${user._id}.svg`;
                const url = await uploadAvatar(key, Buffer.from(svg), 'image/svg+xml');
                user.image = url;
                await user.save();
            }
        }
        return NextResponse.json({ success: true, user });
    } catch (err: any) {
        console.error('Failed to upsert user:', err);
        return NextResponse.json({ success: false, message: err.message || 'Internal Server Error' }, { status: 500 });
    }
}
