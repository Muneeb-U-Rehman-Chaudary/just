import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/db/mongodb';
import { PlatformRevenue, Transaction, User } from '@/db/models';
import { getSession } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { session } = await getSession(request);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let revenue = await PlatformRevenue.findOne().lean();
    if (!revenue) {
      revenue = await PlatformRevenue.create({
        totalEarnings: 0,
        totalCommission: 0,
        totalSales: 0
      });
    }

    // Get recent transactions with vendor info
    const recentTransactions = await Transaction.find({ type: 'sale' })
      .sort({ transactionDate: -1 })
      .limit(10)
      .lean();

    const formattedTransactions = await Promise.all(recentTransactions.map(async (tx) => {
      const vendor = await User.findById(tx.vendorId).select('name storeName').lean();
      return {
        ...tx,
        vendorName: vendor?.storeName || vendor?.name || 'Unknown'
      };
    }));

    // Get stats by category (optional, but good for charts)
    // For now, just return the basics

    return NextResponse.json({
      revenue,
      transactions: formattedTransactions
    });
  } catch (error) {
    console.error('Error fetching admin revenue:', error);
    return NextResponse.json({ error: 'Failed to fetch revenue stats' }, { status: 500 });
  }
}
