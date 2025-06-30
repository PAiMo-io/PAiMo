import { NextResponse } from 'next/server';
import connect from '@/utils/mongoose';
import User from '@/models/User';
import PendingUser from '@/models/PendingUser';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');
    const lang = searchParams.get('lang');
    if (!token) {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/verify-email/error`);
    }
    await connect();
    const pending = await PendingUser.findOne({ token });
    if (!pending) {
        const fallbackUser = await User.findOne({
            emailVerified: true,
            createProfile: false,
        });
        if (fallbackUser) {
            return NextResponse.redirect(
                `${process.env.NEXT_PUBLIC_APP_URL}/create-profile?email=${encodeURIComponent(
                    fallbackUser.email
                )}&lang=${lang}`
            );
        }
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/verify-email/error`);
    }

    pending.emailVerified = true;
    await pending.save();

    const { email } = pending;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        existingUser.emailVerified = true;
        await existingUser.save();
    }

    return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/create-profile?email=${encodeURIComponent(email)}&lang=${lang}`
    );
}
