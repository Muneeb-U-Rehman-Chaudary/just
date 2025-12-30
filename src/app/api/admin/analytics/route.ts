import { NextRequest, NextResponse } from "next/server";
import connectDB from '@/db/mongodb';
import { User, Product, Order, Transaction } from '@/db/models';
import { requireRole } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Authenticate and verify admin role
    await requireRole(request, ['admin']);

    // Get total counts
    const [totalUsers, totalProducts, totalOrders] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments()
    ]);

    // Calculate total revenue
    const completedOrders = await Order.find({ paymentStatus: 'completed' }).lean();
    const totalRevenue = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    // Get growth metrics (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [newUsers, newProducts, newOrders] = await Promise.all([
      User.countDocuments({
        createdAt: { $gte: thirtyDaysAgo }
      }),
      Product.countDocuments({
        createdAt: { $gte: thirtyDaysAgo }
      }),
      Order.countDocuments({
        orderDate: { $gte: thirtyDaysAgo }
      })
    ]);

    // Calculate growth percentages
    const oldUsers = totalUsers - newUsers;
    const oldProducts = totalProducts - newProducts;
    const oldOrders = totalOrders - newOrders;

    const userGrowth = oldUsers > 0 ? ((newUsers / oldUsers) * 100).toFixed(1) : 0;
    const productGrowth = oldProducts > 0 ? ((newProducts / oldProducts) * 100).toFixed(1) : 0;
    const orderGrowth = oldOrders > 0 ? ((newOrders / oldOrders) * 100).toFixed(1) : 0;

    // Get top products by sales
    const topProducts = await Product.find({ status: 'approved' })
      .select('productId title price totalSales rating category images')
      .sort({ totalSales: -1 })
      .limit(10)
      .lean();

    const formattedTopProducts = topProducts.map(p => ({
      id: p.productId,
      productId: p.productId,
      title: p.title,
      price: p.price,
      totalSales: p.totalSales || 0,
      rating: p.rating || 0,
      category: p.category,
      image: p.images?.[0] || null
    }));

    // Get top vendors by sales
    const topVendors = await User.find({ role: 'vendor' })
      .select('_id name storeName totalSales totalEarnings rating image')
      .sort({ totalSales: -1 })
      .limit(10)
      .lean();

    const formattedTopVendors = topVendors.map(v => ({
      id: v._id.toString(),
      name: v.name,
      storeName: v.storeName || `${v.name}'s Store`,
      totalSales: v.totalSales || 0,
      totalEarnings: v.totalEarnings || 0,
      rating: v.rating || 0,
      image: v.image || null
    }));

    // Calculate daily revenue for last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentOrders = await Order.find({
      orderDate: { $gte: sevenDaysAgo },
      paymentStatus: 'completed'
    }).lean();

    const dailyRevenue = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayOrders = recentOrders.filter(o => {
        const orderDate = new Date(o.orderDate).toISOString().split('T')[0];
        return orderDate === dateStr;
      });

      dailyRevenue.push({
        date: dateStr,
        revenue: dayOrders.reduce((sum, o) => sum + o.totalAmount, 0),
        orders: dayOrders.length
      });
    }

    // Get category distribution
    const allProducts = await Product.find({ status: 'approved' }).lean();
    const categoryMap: Record<string, number> = {};
    
    allProducts.forEach(p => {
      if (p.category) {
        categoryMap[p.category] = (categoryMap[p.category] || 0) + 1;
      }
    });

    const categoryData = Object.entries(categoryMap).map(([category, count]) => ({
      category,
      count
    }));

    // Order status breakdown
    const orderStats = await Order.aggregate([
      {
        $group: {
          _id: '$paymentStatus',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      }
    ]);

    const orderStatusBreakdown = orderStats.map(stat => ({
      status: stat._id,
      count: stat.count,
      totalAmount: stat.totalAmount
    }));

    // User role breakdown
    const [customerCount, vendorCount, adminCount] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'vendor' }),
      User.countDocuments({ role: 'admin' })
    ]);

    // Product status breakdown
    const [approvedProducts, pendingProducts, rejectedProducts] = await Promise.all([
      Product.countDocuments({ status: 'approved' }),
      Product.countDocuments({ status: 'pending' }),
      Product.countDocuments({ status: 'rejected' })
    ]);

    // Monthly revenue trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyOrders = await Order.find({
      orderDate: { $gte: sixMonthsAgo },
      paymentStatus: 'completed'
    }).lean();

    const monthlyRevenue = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      const monthOrders = monthlyOrders.filter(o => {
        const orderMonth = new Date(o.orderDate).toISOString().substring(0, 7);
        return orderMonth === monthKey;
      });

      monthlyRevenue.push({
        month: monthKey,
        revenue: monthOrders.reduce((sum, o) => sum + o.totalAmount, 0),
        orders: monthOrders.length
      });
    }

    // Recent transactions
    const recentTransactions = await Transaction.find()
      .sort({ transactionDate: -1 })
      .limit(10)
      .lean();

    const formattedTransactions = await Promise.all(
      recentTransactions.map(async (t) => {
        const vendor = await User.findOne({ _id: t.vendorId }).select('name storeName').lean();
        return {
          id: t.transactionId,
          vendorName: vendor?.name || 'Unknown',
          vendorStoreName: vendor?.storeName || null,
          amount: t.amount,
          type: t.type,
          status: t.status,
          transactionDate: t.transactionDate
        };
      })
    );

    return NextResponse.json({
      overview: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        customerCount,
        vendorCount,
        adminCount
      },
      growth: {
        newUsers,
        newProducts,
        newOrders,
        userGrowth: parseFloat(userGrowth.toString()),
        productGrowth: parseFloat(productGrowth.toString()),
        orderGrowth: parseFloat(orderGrowth.toString())
      },
      products: {
        total: totalProducts,
        approved: approvedProducts,
        pending: pendingProducts,
        rejected: rejectedProducts
      },
      topProducts: formattedTopProducts,
      topVendors: formattedTopVendors,
      dailyRevenue,
      monthlyRevenue,
      categoryData,
      orderStatusBreakdown,
      recentTransactions: formattedTransactions
    });
  } catch (error: any) {
    console.error("Analytics fetch error:", error);
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    if (error.message === 'Forbidden') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}