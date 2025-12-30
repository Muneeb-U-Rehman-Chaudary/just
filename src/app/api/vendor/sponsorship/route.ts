import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/db/mongodb';
import { SponsorshipRequest, ActiveSponsor, Product } from '@/db/models';
import { requireRole, getCurrentUser } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const user = await getCurrentUser(request);
    if (!user || user.role !== 'vendor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requests = await SponsorshipRequest.find({ vendorId: user.id }).sort({ requestDate: -1 }).lean() || [];
    const activeSponsors = await ActiveSponsor.find({ vendorId: user.id, status: 'active' }).lean() || [];

    const productIds = Array.from(new Set([...requests, ...activeSponsors].filter(r => r && r.productId).map(r => r.productId)));
    
    let productMap = new Map();
    if (productIds.length > 0) {
      const products = await Product.find({ productId: { $in: productIds } }).select('productId title').lean();
      productMap = new Map(products.map(p => [p.productId, p.title]));
    }

    return NextResponse.json({
      requests: requests.map(r => ({
        ...r,
        id: r._id.toString(),
        productTitle: r.productId ? productMap.get(r.productId) : null,
      })),
      activeSponsors: activeSponsors.map(s => ({
        ...s,
        id: s._id.toString(),
        productTitle: s.productId ? productMap.get(s.productId) : null,
      })),
    });
  } catch (error: any) {
    console.error('GET vendor sponsorship error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const user = await getCurrentUser(request);
    if (!user || user.role !== 'vendor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, productId, tier, message } = body;

    if (!type || !tier) {
      return NextResponse.json({ error: 'Type and tier are required' }, { status: 400 });
    }

    const tierPricing = {
      standard: { vendor: 49, product: 29 },
      premium: { vendor: 99, product: 59 },
    };

    const monthlyFee = tierPricing[tier as keyof typeof tierPricing]?.[type as keyof typeof tierPricing.standard] || 49;

    const newRequest = new SponsorshipRequest({
      vendorId: user.id,
      productId: productId ? parseInt(productId) : undefined,
      type,
      tier,
      monthlyFee,
      commission: 0,
      duration: 30,
      status: 'pending',
      message,
      requestDate: new Date(),
    });

    await newRequest.save();

    return NextResponse.json({ message: 'Sponsorship request submitted', request: newRequest });
  } catch (error: any) {
    console.error('POST vendor sponsorship error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
