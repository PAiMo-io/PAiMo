import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import mongoose, { Schema, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

const { DB_URL } = process.env;
if (!DB_URL) {
    console.error('DB_URL not found in .env.local');
    process.exit(1);
}

await mongoose.connect(DB_URL);

const userSchema = new Schema({
    username: String,
    email: String,
    nickname: String,
    password: String,
    createdAt: { type: Date, default: Date.now },
});

const eventSchema = new Schema({
    name: String,
    date: Date,
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now },
});

const matchSchema = new Schema({
    eventId: { type: Schema.Types.ObjectId, ref: 'Event' },
    players: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    scores: [
        {
            userId: { type: Schema.Types.ObjectId, ref: 'User' },
            score: Number,
        },
    ],
    createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);
const Event = mongoose.model('Event', eventSchema);
const Match = mongoose.model('Match', matchSchema);

async function seed() {
    const hashed = await bcrypt.hash('test1234', 10);
    const users = await User.create([
        { username: 'user1', email: 'user1@example.com', nickname: 'Alice', password: hashed },
        { username: 'user2', email: 'user2@example.com', nickname: 'Bob', password: hashed },
        { username: 'user3', email: 'user3@example.com', nickname: 'Charlie', password: hashed },
        { username: 'user4', email: 'user4@example.com', nickname: 'Dana', password: hashed },
    ]);

    const event = await Event.create({
        name: 'Test Sync Event',
        date: new Date(),
        members: users.map((u) => u._id),
    });

    await Match.create({
        eventId: event._id,
        players: users.map((u) => u._id),
        scores: users.map((u) => ({ userId: u._id, score: 0 })),
    });

    console.log('Seeded test users:');
    for (const user of users) {
        console.log(`- ${user.username} (${user.nickname}) -> password: test1234`);
    }
}

seed()
    .catch((err) => {
        console.error(err);
    })
    .finally(() => {
        mongoose.disconnect();
    });
