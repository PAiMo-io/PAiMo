import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../../auth';
import connect from '../../../../../utils/mongoose';
import Club from '../../../../../models/Club';
import ClubJoinRequest from '../../../../../models/ClubJoinRequest';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connect();
    const clubId = params.id;

    // Check if user is admin of the club
    const club = await Club.findById(clubId).populate('adminList', 'username nickname image');

    if (!club) {
      return NextResponse.json({ error: 'Club not found' }, { status: 404 });
    }

    const isClubAdmin = club.adminList.some((admin: any) => admin._id.toString() === session.user.id);
    const isSuperAdmin = session.user.role === 'super-admin';
    
    if (!isClubAdmin && !isSuperAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get all join requests for the club
    const joinRequests = await ClubJoinRequest.find({
      clubId: clubId,
    }).populate('userId', 'username nickname image').lean();

    const formattedRequests = joinRequests.map((request: any) => ({
      id: request._id.toString(),
      userId: request.userId._id.toString(),
      clubId: request.clubId,
      message: request.message,
      status: request.status,
      createdAt: request.createdAt,
      user: {
        id: request.userId._id.toString(),
        username: request.userId.username,
        nickname: request.userId.nickname,
        image: request.userId.image,
      },
    }));

    return NextResponse.json(formattedRequests);
  } catch (error) {
    console.error('Error fetching join requests:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 