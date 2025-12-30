import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/db/mongodb';
import { User, Product, Order, Transaction } from '@/db/models';
import { getSession } from '@/lib/auth-utils';

// GET /api/admin/stats - Get platform statistics (Admin only)
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { session } = await getSession(request);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await User.findById(session.user.id).lean();

    if (currentUser?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get user counts
    const totalUsers = await User.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalVendors = await User.countDocuments({ role: 'vendor' });

    // Get product counts
    const totalProducts = await Product.countDocuments();
    const approvedProducts = await Product.countDocuments({ status: 'approved' });
    const pendingProducts = await Product.countDocuments({ status: 'pending' });

    // Get order stats
    const allOrders = await Order.find().lean();
    const totalOrders = allOrders.length;
    const totalRevenue = allOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    // Get recent transactions
    const recentTransactions = await Transaction.find()
      .sort({ transactionDate: -1 })
      .limit(10)
      .lean();

    const formattedTransactions = recentTransactions.map(t => ({
      ...t,
      id: t.transactionId
    }));

    return NextResponse.json({
      stats: {
        totalUsers,
        totalCustomers,
        totalVendors,
        totalProducts,
        approvedProducts,
        pendingProducts,
        totalOrders,
        totalRevenue,
        platformRating: 4.9,
        recentTransactions: formattedTransactions
      }
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}