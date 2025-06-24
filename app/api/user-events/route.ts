import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import connect from '@/utils/mongoose';
import Event from '@/models/Event';

export async function GET(
    request: Request,
) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ success: false }, { status: 401 });
    }
    await connect();
    const userId = session.user.id;

    // Find events where the user is a participant
    const events: any[] = await Event.find(
        { participants: userId },
        {
            name: 1,
            status: 1,
            visibility: 1,
            registrationEndTime: 1,
            location: 1,
            createdAt: 1,
            participants: 1,
            club: 1,
        }
    ).populate({
        path: 'club',
        select: 'name description location logoUrl',
    }).lean();
    return NextResponse.json({
        events: events.map(e => ({
            id: e._id.toString(),
            name: e.name,
            status: e.status,
            visibility: e.visibility,
            registrationEndTime: e.registrationEndTime,
            location: e.location,
            createdAt: e.createdAt,
            participantCount: e.participants.length,
            club: e.club
                ? {
                    id: e.club._id?.toString?.() || e.club.id?.toString?.() || '',
                    name: e.club.name,
                    description: e.club.description,
                    location: e.club.location,
                    logoUrl: e.club.logoUrl,
                }
                : null,
        })),
    });
}