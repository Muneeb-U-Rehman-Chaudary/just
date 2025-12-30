import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/db/mongodb';
import { SponsorshipRequest, Product } from '@/db/models';
import { requireRole } from '@/lib/auth-utils';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    await requireRole(request, ['admin']);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    const query: any = {};
    if (status && status !== 'all') query.status = status;
    if (type && type !== 'all') query.type = type;

    const requests = await SponsorshipRequest.find(query)
      .sort({ requestDate: -1 })
      .skip(offset)
      .limit(limit)
      .lean();

    const vendorIds = [...new Set(requests.map(r => r.vendorId))];
    const productIds = requests.filter(r => r.productId).map(r => r.productId);

    // Use raw MongoDB collection to avoid Mongoose casting issues with string _id
    const db = mongoose.connection.db;
    const usersCollection = db?.collection('users');
    
    const [vendors, products] = await Promise.all([
      vendorIds.length > 0 && usersCollection 
        ? usersCollection.find({ _id: { $in: vendorIds } }).project({ name: 1, email: 1, storeName: 1, image: 1 }).toArray() 
        : [],
      productIds.length > 0 ? Product.find({ productId: { $in: productIds } }).select('productId title images').lean() : []
    ]);

    const vendorMap = new Map(vendors.map(v => [v._id.toString(), v]));
    const productMap = new Map(products.map(p => [p.productId, p]));

    const formattedRequests = requests.map(r => {
      const vendor = vendorMap.get(r.vendorId);
      const product = r.productId ? productMap.get(r.productId) : null;
      return {
        id: r._id.toString(),
        requestId: r.requestId,
        vendorId: r.vendorId,
        vendorName: vendor?.name || 'Unknown',
        vendorEmail: vendor?.email || '',
        storeName: vendor?.storeName || '',
        vendorImage: vendor?.image || null,
        productId: r.productId,
        productTitle: product?.title || null,
        productImage: product?.images?.[0] || null,
        type: r.type,
        tier: r.tier,
        monthlyFee: r.monthlyFee,
        commission: r.commission,
        duration: r.duration,
        status: r.status,
        message: r.message,
        requestDate: r.requestDate,
        processedDate: r.processedDate,
        adminNotes: r.adminNotes
      };
    });

    const total = await SponsorshipRequest.countDocuments(query);
    const stats = {
      total: await SponsorshipRequest.countDocuments({}),
      pending: await SponsorshipRequest.countDocuments({ status: 'pending' }),
      approved: await SponsorshipRequest.countDocuments({ status: 'approved' }),
      rejected: await SponsorshipRequest.countDocuments({ status: 'rejected' })
    };

    return NextResponse.json({
      requests: formattedRequests,
      total,
      stats
    });
  } catch (error: any) {
    console.error('GET sponsorship requests error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
