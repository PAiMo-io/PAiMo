import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../../../../auth';
import connect from '../../../../../../../utils/mongoose';
import Club from '../../../../../../../models/Club';
import ClubJoinRequest from '../../../../../../../models/ClubJoinRequest';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; requestId: string } }
) {
  try {
    console.log('Reject request started:', { clubId: params.id, requestId: params.requestId });
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Session validated, connecting to database...');
    await connect();
    console.log('Database connected successfully');
    
    const { id: clubId, requestId } = params;

    // Check if user is admin of the club
    console.log('Finding club...');
    const club = await Club.findById(clubId).populate('adminList', 'username nickname image');

    if (!club) {
      return NextResponse.json({ error: 'Club not found' }, { status: 404 });
    }

    console.log('Club found, checking admin status...');
    const isClubAdmin = club.adminList.some((admin: any) => admin._id.toString() === session.user.id);
    const isSuperAdmin = session.user.role === 'super-admin';
    
    if (!isClubAdmin && !isSuperAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Find the join request
    console.log('Finding join request...');
    const joinRequest = await ClubJoinRequest.findById(requestId);
    if (!joinRequest) {
      return NextResponse.json({ error: 'Join request not found' }, { status: 404 });
    }

    if (joinRequest.status !== 'pending') {
      return NextResponse.json({ error: 'Request already processed' }, { status: 400 });
    }

    console.log('Updating join request status...');
    // Update join request status
    joinRequest.status = 'rejected';
    await joinRequest.save();

    console.log('Updating club pending count...');
    // Decrease pending requests count
    const clubToUpdate = await Club.findById(clubId);
    if (clubToUpdate) {
      clubToUpdate.pendingRequestsCount = Math.max(0, (clubToUpdate.pendingRequestsCount || 0) - 1);
      await clubToUpdate.save();
    }

    console.log('Reject request completed successfully');
    return NextResponse.json({ success: true, message: 'Join request rejected' });
  } catch (error) {
    console.error('Error rejecting join request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 