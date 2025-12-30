import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/db/mongodb';
import { Product } from '@/db/models';
import { requireAuth } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (!user || user.role !== 'vendor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const products = await Product.find({ vendorId: user.id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ products }, { status: 200 });
  } catch (error: any) {
    console.error('GET vendor products error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
