import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../../../../auth';
import connect from '../../../../../../../utils/mongoose';
import Club from '../../../../../../../models/Club';
import ClubJoinRequest from '../../../../../../../models/ClubJoinRequest';
import User from '../../../../../../../models/User';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; requestId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connect();
    const { id: clubId, requestId } = params;

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

    // Find the join request
    const joinRequest = await ClubJoinRequest.findById(requestId);
    if (!joinRequest) {
      return NextResponse.json({ error: 'Join request not found' }, { status: 404 });
    }

    if (joinRequest.status !== 'pending') {
      return NextResponse.json({ error: 'Request already processed' }, { status: 400 });
    }

    // Get user details
    const user = await User.findById(joinRequest.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update join request status
    joinRequest.status = 'approved';
    await joinRequest.save();

    // Add user to club members
    const clubToUpdate = await Club.findById(clubId);
    if (clubToUpdate) {
      clubToUpdate.members.push({
        id: user._id,
        username: user.username,
      });
      clubToUpdate.pendingRequestsCount = Math.max(0, (clubToUpdate.pendingRequestsCount || 0) - 1);
      await clubToUpdate.save();
    }

    return NextResponse.json({ success: true, message: 'Join request approved' });
  } catch (error) {
    console.error('Error approving join request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 