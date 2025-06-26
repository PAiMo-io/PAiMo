import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' })
import bcrypt from 'bcryptjs';
import connect from '../utils/mongoose';
import User from '../models/User';
import Club from '../models/Club';
import Event from '../models/Event';
dotenv.config();

async function main() {
  const [mode, ...args] = process.argv.slice(2);
  
  if (mode === 'register') {
    // Register users to existing event
    const [eventId, userCountArg] = args;
    const userCount = parseInt(userCountArg, 10);
    
    if (!eventId || !userCount || userCount <= 0) {
      console.log('Usage: tsx scripts/createTestData.ts register <event-id> <user-count>');
      process.exit(1);
    }
    
    await connect();
    
    // Find the event
    const event = await Event.findById(eventId).populate('club');
    if (!event) {
      console.log(`Event with ID ${eventId} not found`);
      process.exit(1);
    }
    
    console.log(`Registering ${userCount} test users to event: ${event.name}`);
    
    // Create test users
    const users = [];
    for (let i = 0; i < userCount; i++) {
      const email = `testuser_${Date.now()}_${i}@example.com`;
      const password = await bcrypt.hash('password', 10);
      const level = +(Math.random() * (6 - 3) + 3).toFixed(1);
      const user = await User.create({
        email,
        username: `testuser${i}_${Date.now()}`,
        password,
        level,
        profileComplete: true,
      });
      users.push(user);
    }
    
    // Add users to club if event has a club
    if (event.club) {
      const club = await Club.findById(event.club);
      if (club) {
        // Add users to club members
        const newMembers = users.map(u => ({ id: u._id, username: u.username || u.email }));
        club.members = [...(club.members || []), ...newMembers];
        await club.save();
        
        // Add club to users
        for (const user of users) {
          user.clubs = Array.isArray(user.clubs) ? user.clubs : [];
          user.clubs.push(club._id);
          await user.save();
        }
      }
    }
    
    // Register users to event
    event.participants = [...(event.participants || []), ...users.map(u => u._id)];
    await event.save();
    
    console.log(`Successfully registered ${users.length} test users to event '${event.name}'`);
    console.log(`Event now has ${event.participants.length} total participants`);
    
  } else {
    // Original functionality - create everything from scratch
    const [userCountArg, clubName = 'Test Club', eventName = 'Test Event'] = [mode, ...args];
    const userCount = parseInt(userCountArg, 10);
    
    if (!userCount || userCount <= 0) {
      console.log('Usage: tsx scripts/createTestData.ts <user-count> [club-name] [event-name]');
      console.log('   or: tsx scripts/createTestData.ts register <event-id> <user-count>');
      process.exit(1);
    }

    await connect();

    const users = [];
    for (let i = 0; i < userCount; i++) {
      const email = `testuser_${Date.now()}_${i}@example.com`;
      const password = await bcrypt.hash('password', 10);
      const level = +(Math.random() * (6 - 3) + 3).toFixed(1);
      const user = await User.create({
        email,
        username: `testuser${i}`,
        password,
        level,
        profileComplete: true,
      });
      users.push(user);
    }

    const club = await Club.create({
      name: clubName,
      visibility: 'public',
      createdBy: 'script',
      members: users.map(u => ({ id: u._id, username: u.username || u.email })),
    });

    for (const user of users) {
      user.clubs = Array.isArray(user.clubs) ? user.clubs : [];
      user.clubs.push(club._id);
      await user.save();
    }

    const event = await Event.create({
      name: eventName,
      club: club._id,
      status: 'registration',
      visibility: 'public-join',
      participants: users.map(u => u._id),
    });

    console.log(`Created ${users.length} users, club '${club.name}', and event '${event.name}'.`);
  }
}

main().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
