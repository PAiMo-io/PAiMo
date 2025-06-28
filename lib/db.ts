import { MongoClient, Db } from 'mongodb'

let client: MongoClient | null = null
let db: Db | null = null

export async function getDb(): Promise<Db> {
  if (db) return db
  const uri = process.env.DB_URL
  if (!uri) {
    throw new Error('DB_URL environment variable is not set')
  }
  if (!client) {
    client = new MongoClient(uri)
    await client.connect()
  }
  db = client.db()
  return db
}
