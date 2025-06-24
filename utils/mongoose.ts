import mongoose from 'mongoose';

import '@/models/User';
import '@/models/Club';
import '@/models/Event';
import '@/models/Match';
import '@/models/PendingUser';
import '@/models/PasswordReset';




let cached: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export default async function connect() {
  const uri = process.env.DB_URL;
  if (!uri) {
    throw new Error('DB_URL environment variable is not set');
  }
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, { bufferCommands: false });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
