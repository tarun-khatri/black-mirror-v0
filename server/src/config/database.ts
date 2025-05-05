import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'competitor_analysis'; // Fixed database name

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectToDatabase(): Promise<void> {
  if (!process.env.MONGODB_URI) {
    console.log('MONGODB_URI not set, skipping database connection');
    return;
  }

  try {
    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    db = client.db(process.env.MONGODB_DB || 'competitor-analysis');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export function getDatabase(): Db {
  if (!db) {
    throw new Error('Database not connected. Call connectToDatabase() first.');
  }
  return db;
}

export async function closeDatabaseConnection(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('MongoDB connection closed');
  }
} 