// api/create-group/route.ts
import { NextResponse } from 'next/server';
import connect from '../../../utils/mongoose';
import Event from '../../../models/Event';
import { bucketUsers, groupBuckets, UserDoc } from '@/utils/createDraws';

export async function POST(request: Request) {
  // Parse request body: expect eventType as the Event _id, and numCourts (number of courts)
  const { eventId, numCourts } = await request.json();
  if (!eventId || typeof numCourts !== 'number') {
    return NextResponse.json(
      { error: 'Missing or invalid `eventType` (eventId) or `numCourts`' },
      { status: 400 }
    );
  }

  // Connect to MongoDB
  await connect();

  // Fetch the event and populate its participants
  const event = await Event.findById(eventId).populate('participants');
  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  // participants should be an array of UserDoc
  const users = Array.isArray(event.participants)
    ? (event.participants as UserDoc[])
    : [];

  if (users.length < 4) {
    return NextResponse.json(
      { error: 'Not enough participants to form groups' },
      { status: 400 }
    );
  }

  // Create buckets & groups
  let buckets: UserDoc[][];
  try {
    buckets = bucketUsers(users, numCourts);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
  const groups = groupBuckets(buckets);

  // Return group assignments for manual adjustment on frontend
  return NextResponse.json({ groups });
}
