import { NextResponse } from 'next/server';
import { connectToDatabase, isMongoConnected } from '@/lib/mongodb';
import Order from '@/lib/models/Order';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    await connectToDatabase();

    if (isMongoConnected()) {
      let query = {};
      if (email) {
        query.customerEmail = email;
      }

      const orders = await Order.find(query).sort({ createdAt: -1 });
      return NextResponse.json({ success: true, source: 'mongodb', orders });
    }

    return NextResponse.json({
      success: true,
      source: 'local_fallback',
      orders: [],
      message: 'Connect MongoDB to persist orders server-side.',
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
