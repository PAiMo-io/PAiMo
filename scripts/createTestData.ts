import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' })
import bcrypt from 'bcryptjs';
import connect from '../utils/mongoose';
import User from '../models/User';
import Club from '../models/Club';
import Event from '../models/Event';
dotenv.config();

async function main() {
  const [userCountArg, clubName = 'Test Club', eventName = 'Test Event'] = process.argv.slice(2);
  const userCount = parseInt(userCountArg, 10);
  if (!userCount || userCount <= 0) {
    console.log('Usage: ts-node scripts/createTestData.ts <user-count> [club-name] [event-name]');
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

main().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
