import { NextRequest, NextResponse } from "next/server";
import connectDB from '@/db/mongodb';
import { Order, User } from '@/db/models';
import { requireRole } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Authenticate and verify admin role
    await requireRole(request, ['admin']);

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build query
    const query: any = {};
    if (status) {
      query.paymentStatus = status;
    }

    // Get all orders
    let orders = await Order.find(query)
      .sort({ orderDate: -1 })
      .limit(limit)
      .skip(offset)
      .lean();

    // Get customer details for each order
    const ordersWithCustomers = await Promise.all(
      orders.map(async (order) => {
        const customer = await User.findById(order.customerId)
          .select('_id name email')
          .lean();
        
        return {
          id: order.orderId,
          customerId: order.customerId,
          customerName: customer?.name || 'Unknown',
          customerEmail: customer?.email || 'Unknown',
          totalAmount: order.totalAmount,
          paymentStatus: order.paymentStatus,
          paymentMethod: order.paymentMethod,
          orderDate: order.orderDate,
          items: order.items,
          transactionId: order.transactionId,
          downloadStatus: order.downloadStatus
        };
      })
    );

    // Apply search filter
    let filtered = ordersWithCustomers;
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = ordersWithCustomers.filter(
        (o) =>
          o.customerName?.toLowerCase().includes(searchLower) ||
          o.customerEmail?.toLowerCase().includes(searchLower) ||
          o.id.toString().includes(search) ||
          o.transactionId?.toLowerCase().includes(searchLower)
      );
    }

    // Calculate stats
    const allOrders = await Order.find({}).lean();
    const stats = {
      total: allOrders.length,
      completed: allOrders.filter((o) => o.paymentStatus === "completed").length,
      pending: allOrders.filter((o) => o.paymentStatus === "pending").length,
      failed: allOrders.filter((o) => o.paymentStatus === "failed").length,
      refunded: allOrders.filter((o) => o.paymentStatus === "refunded").length,
      totalRevenue: allOrders
        .filter((o) => o.paymentStatus === "completed")
        .reduce((sum, o) => sum + o.totalAmount, 0),
    };

    return NextResponse.json({ orders: filtered, stats });
  } catch (error: any) {
    console.error("Admin orders fetch error:", error);
    
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