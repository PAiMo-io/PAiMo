import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import connect from '@/utils/mongoose';
import PushSubscription from '@/models/PushSubscription';

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    await connect();
    await PushSubscription.findOneAndUpdate({ userId: session.user.id }, { subscription: body }, { upsert: true });
    return NextResponse.json({ ok: true });
}
