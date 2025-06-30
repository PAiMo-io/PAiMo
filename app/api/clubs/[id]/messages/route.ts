import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import connect from '@/utils/mongoose';
import ChatMessage from '@/models/ChatMessage';
import PushSubscription from '@/models/PushSubscription';
import { pusherServer } from '@/lib/pusher-server';
import { sendPush } from '@/lib/push';
import User from '@/models/User';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    await connect();
    const messages = await ChatMessage.find({ clubId: params.id }).sort({ timestamp: -1 }).limit(50).lean();
    return NextResponse.json(messages);
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();
    await connect();

    // Fetch user profile from DB
    const user = (await User.findById(session.user.id).lean()) as { avatarUrl?: string; image?: string } | null;

    const message = await ChatMessage.create({
        clubId: params.id,
        senderId: session.user.id,
        senderNickname: session.user.nickname || session.user.name || 'Unknown',
        senderAvatarUrl: user?.avatarUrl || user?.image || '/default-avatar.png', // Use DB avatar or fallback
        content: body.content,
    });
    // broadcast via Pusher
    await pusherServer.trigger(`club-${params.id}`, 'new-message', message);

    // send push to subscribers
    const subscriptions = await PushSubscription.find({});
    for (const sub of subscriptions) {
        await sendPush(sub.subscription, {
            title: message.senderNickname,
            body: message.content,
            icon: message.senderAvatarUrl,
        });
    }

    return NextResponse.json(message);
}
