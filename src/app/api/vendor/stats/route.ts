import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/db/mongodb';
import { Product, Transaction, User } from '@/db/models';
import { getSession } from '@/lib/auth-utils';

// GET /api/vendor/stats - Get vendor statistics
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { session } = await getSession(request);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await User.findById(session.user.id).lean();

    if (currentUser?.role !== 'vendor') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get vendor products
    const vendorProducts = await Product.find({ vendorId: session.user.id }).lean();

    // Get vendor transactions
    const vendorTransactions = await Transaction.find({ vendorId: session.user.id })
      .sort({ transactionDate: -1 })
      .lean();

    const totalProducts = vendorProducts.length;
    const approvedProducts = vendorProducts.filter(p => p.status === 'approved').length;
    const pendingProducts = vendorProducts.filter(p => p.status === 'pending').length;
    
    const totalSales = currentUser.totalSales || 0;
    const totalEarnings = currentUser.totalEarnings || 0;
    
    const completedTransactions = vendorTransactions.filter(t => t.type === 'sale' && t.status === 'completed');
    const pendingWithdrawals = vendorTransactions.filter(t => t.type === 'withdrawal' && t.status === 'pending');

    // Calculate monthly earnings
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyTransactions = completedTransactions.filter(
      t => t.transactionDate >= thisMonthStart
    );
    const monthlyEarnings = monthlyTransactions.reduce((sum, t) => sum + t.amount, 0);

    const formattedTransactions = vendorTransactions.slice(0, 10).map(t => ({
      ...t,
      id: t.transactionId
    }));

    return NextResponse.json({
      stats: {
        totalProducts,
        approvedProducts,
        pendingProducts,
        totalSales,
        totalEarnings,
        monthlyEarnings,
        availableBalance: totalEarnings - pendingWithdrawals.reduce((sum, t) => sum + t.amount, 0),
        recentTransactions: formattedTransactions
      }
    });
  } catch (error) {
    console.error('Error fetching vendor stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}