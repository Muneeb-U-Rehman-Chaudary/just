import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/db/mongodb';
import { Order, Product, Cart, Transaction, User, PlatformSettings } from '@/db/models';
import { getSession } from '@/lib/auth-utils';
import { generateLicenseKey } from '@/lib/utils/license';

// GET /api/orders - Get user's orders
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { session } = await getSession(request);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userOrders = await Order.find({ customerId: session.user.id })
      .sort({ orderDate: -1 })
      .lean();

    const formattedOrders = userOrders.map(order => ({
      ...order,
      id: order.orderId
    }));

    return NextResponse.json({ orders: formattedOrders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

// POST /api/orders - Create new order
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { session } = await getSession(request);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { items, paymentMethod, transactionId } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 });
    }

    // Fetch enabled payment methods from settings
    const paymentSettings = await PlatformSettings.findOne({ category: 'paymentMethods' });
    const enabledMethods = paymentSettings?.settings 
      ? Object.entries(paymentSettings.settings)
          .filter(([_, v]: [string, any]) => v.enabled)
          .map(([k]) => k)
      : ['jazzcash', 'easypaisa', 'nayapay'];

    if (!paymentMethod || !enabledMethods.includes(paymentMethod)) {
      return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 });
    }

    // Fetch product details and calculate total
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findOne({ productId: item.productId }).lean();

      if (!product) {
        return NextResponse.json({ error: `Product ${item.productId} not found` }, { status: 404 });
      }

      totalAmount += product.price;
      orderItems.push({
        productId: product.productId,
        price: product.price,
        licenseKey: '', // Will be generated after order creation
        title: product.title,
        downloadUrl: product.downloadUrl
      });
    }

    // Create order
    const newOrder = await Order.create({
      customerId: session.user.id,
      items: orderItems,
      totalAmount,
      paymentMethod,
      paymentStatus: 'completed', // In real app, verify payment first
      transactionId: transactionId || `TXN-${Date.now()}`,
      orderDate: new Date(),
      downloadStatus: 'available'
    });

    const orderId = newOrder.orderId;

    // Generate license keys and update order
    const itemsWithLicenses = orderItems.map((item) => ({
      ...item,
      licenseKey: generateLicenseKey(item.productId, orderId)
    }));

    newOrder.items = itemsWithLicenses;
    await newOrder.save();

    // Update product sales and vendor earnings
    for (const item of orderItems) {
      const product = await Product.findOne({ productId: item.productId });

      if (product) {
        // Update product sales
        product.totalSales = (product.totalSales || 0) + 1;
        await product.save();

        // Update vendor stats
        const vendor = await User.findById(product.vendorId);

        if (vendor) {
          vendor.totalSales = (vendor.totalSales || 0) + 1;
          vendor.totalEarnings = (vendor.totalEarnings || 0) + product.price;
          await vendor.save();
        }

        // Create transaction record
        await Transaction.create({
          vendorId: product.vendorId,
          orderId: orderId,
          amount: product.price,
          type: 'sale',
          status: 'completed',
          paymentMethod,
          transactionDate: new Date()
        });
      }
    }

    // Clear cart
    await Cart.deleteOne({ userId: session.user.id });

    return NextResponse.json({ 
      order: { ...newOrder.toObject(), id: newOrder.orderId, items: itemsWithLicenses },
      message: 'Order created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}