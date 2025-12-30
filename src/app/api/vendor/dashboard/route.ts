import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/db/mongodb';
import { User, Product, Order, Transaction, Withdrawal } from '@/db/models';
import { requireAuth } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await requireAuth(request);
    if (!user) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    // Check if user has vendor role
    if (user.role !== 'vendor') {
      return NextResponse.json({ 
        error: 'Access denied. Vendor role required.',
        code: 'FORBIDDEN' 
      }, { status: 403 });
    }

    // Connect to MongoDB
    await connectDB();

    // Get current month start date
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Fetch all statistics in parallel
    const [
      totalProducts,
      approvedProducts,
      pendingProducts,
      vendorData,
      monthlyTransactions,
      pendingWithdrawalsData,
      vendorProducts
    ] = await Promise.all([
      Product.countDocuments({ vendorId: user.id }),
      Product.countDocuments({ vendorId: user.id, status: 'approved' }),
      Product.countDocuments({ vendorId: user.id, status: 'pending' }),
      User.findById(user.id).select('totalSales totalEarnings rating').lean(),
      Transaction.find({
        vendorId: user.id,
        type: 'sale',
        status: 'completed',
        transactionDate: { $gte: monthStart }
      }).select('amount').lean(),
      Withdrawal.find({
        vendorId: user.id,
        status: 'pending'
      }).select('amount').lean(),
      Product.find({ vendorId: user.id }).select('productId').lean()
    ]);

    // Calculate monthly earnings
    const monthlyEarnings = monthlyTransactions.reduce((sum, transaction) => {
      return sum + (transaction.amount || 0);
    }, 0);

    // Calculate pending withdrawals total
    const pendingWithdrawalsTotal = pendingWithdrawalsData.reduce((sum, withdrawal) => {
      return sum + (withdrawal.amount || 0);
    }, 0);

    // Calculate available balance
    const totalEarnings = vendorData?.totalEarnings || 0;
    const availableBalance = totalEarnings - pendingWithdrawalsTotal;

    // Get vendor product IDs
    const vendorProductIds = vendorProducts.map(p => p.productId);

    // Get recent orders containing vendor's products
    const allOrders = await Order.find({
      paymentStatus: 'completed'
    })
    .sort({ orderDate: -1 })
    .limit(100)
    .lean();

    // Filter orders that contain vendor's products
    const relevantOrders = allOrders
      .filter(order => {
        if (!order.items || !Array.isArray(order.items)) return false;
        return order.items.some(item => vendorProductIds.includes(item.productId));
      })
      .slice(0, 10);

    // Get customer names
    const recentOrders = await Promise.all(
      relevantOrders.map(async (order) => {
        const customer = await User.findById(order.customerId).select('name').lean();
        return {
          id: order.orderId,
          customerId: order.customerId,
          customerName: customer?.name || 'Unknown',
          totalAmount: order.totalAmount,
          orderDate: order.orderDate,
          paymentStatus: order.paymentStatus,
          items: order.items
        };
      })
    );

    // Prepare response
    const response = {
      stats: {
        totalProducts,
        approvedProducts,
        pendingProducts,
        totalSales: vendorData?.totalSales || 0,
        totalEarnings: totalEarnings,
        availableBalance: Math.max(0, availableBalance),
        monthlyEarnings,
        pendingWithdrawals: pendingWithdrawalsData.length,
        rating: vendorData?.rating || 0
      },
      recentOrders
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error: any) {
    console.error('GET vendor dashboard error:', error);
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    return NextResponse.json({ 
      error: 'Internal server error: ' + error.message,
      code: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}