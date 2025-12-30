import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/db/mongodb';
import { Order, Product, User } from '@/db/models';
import { getCurrentUser } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const user = await getCurrentUser(request);
    if (!user || user.role !== 'vendor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const vendorProducts = await Product.find({ vendorId: user.id }).select('productId title').lean();
    const productIds = vendorProducts.map(p => p.productId);
    const productMap = new Map(vendorProducts.map(p => [p.productId, p.title]));

    const orders = await Order.find({
      'items.productId': { $in: productIds }
    }).sort({ orderDate: -1 }).lean();

    const customerIds = [...new Set(orders.map(o => o.customerId))];
    const customers = await User.find({ _id: { $in: customerIds } }).select('name email').lean();
    const customerMap = new Map(customers.map(c => [c._id.toString(), c.name]));

    const formattedOrders = orders.map(order => {
      const vendorItems = order.items.filter((item: any) => productIds.includes(item.productId));
      const vendorAmount = vendorItems.reduce((sum: number, item: any) => sum + item.price, 0);
      return {
        orderId: order.orderId,
        customerId: order.customerId,
        customerName: customerMap.get(order.customerId) || 'Customer',
        items: vendorItems.map((item: any) => ({
          ...item,
          title: productMap.get(item.productId) || item.title || 'Product',
        })),
        vendorAmount,
        totalAmount: order.totalAmount,
        paymentStatus: order.paymentStatus,
        orderDate: order.orderDate,
      };
    });

    return NextResponse.json({ orders: formattedOrders });
  } catch (error: any) {
    console.error('GET vendor orders error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
