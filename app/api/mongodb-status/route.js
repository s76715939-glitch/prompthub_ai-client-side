import { NextResponse } from 'next/server';
import { connectToDatabase, isMongoConnected } from '@/lib/mongodb';

export async function GET() {
  try {
    const conn = await connectToDatabase();
    const connected = isMongoConnected() && conn !== null;

    return NextResponse.json({
      connected: connected,
      status: connected ? 'Connected to MongoDB' : 'Fallback Mode (Local Memory & Storage)',
      databaseUri: process.env.MONGODB_URI ? 'Configured in .env' : 'Default Local Host',
      message: connected
        ? 'Real MongoDB database is live and active.'
        : 'MongoDB URI is not active. App is safely running with local data fallback.',
    });
  } catch (error) {
    return NextResponse.json({
      connected: false,
      status: 'Fallback Mode',
      message: error.message,
    });
  }
}
