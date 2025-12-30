import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import connectDB from '@/db/mongodb';
import { Order, Product, User, Transaction, PlatformRevenue, Notification } from '@/db/models';
import { generateLicenseKey } from '@/lib/utils/license';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutComplete(session);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  await connectDB();

  const orderId = session.metadata?.orderId;
  const customerId = session.metadata?.customerId;

  if (!orderId) {
    console.error('No orderId in session metadata');
    return;
  }

  const order = await Order.findOne({ orderId: parseInt(orderId) });
  
  if (!order) {
    console.error('Order not found:', orderId);
    return;
  }

  if (order.paymentStatus === 'completed') {
    console.log('Order already processed:', orderId);
    return;
  }

  order.paymentStatus = 'completed';
  order.transactionId = session.payment_intent as string;

  const itemsWithLicenses = order.items.map((item: any) => ({
    ...item,
    licenseKey: generateLicenseKey(item.productId, order.orderId)
  }));
  order.items = itemsWithLicenses;
  await order.save();

  let platformRevenue = await PlatformRevenue.findOne();
  if (!platformRevenue) {
    platformRevenue = await PlatformRevenue.create({
      totalEarnings: 0,
      totalCommission: 0,
      totalSales: 0
    });
  }

  for (const item of order.items) {
    const product = await Product.findOne({ productId: item.productId });
    
    if (!product) continue;

    const vendor = await User.findById(product.vendorId);
    
    if (!vendor) continue;

    const commissionRate = vendor.commissionRate ?? 15;
    const itemPrice = item.price;
    const netAmount = itemPrice * (1 - commissionRate / 100);
    const commissionAmount = itemPrice - netAmount;

    vendor.totalSales = (vendor.totalSales || 0) + 1;
    vendor.totalEarnings = (vendor.totalEarnings || 0) + netAmount;
    await vendor.save();

    product.totalSales = (product.totalSales || 0) + 1;
    await product.save();

    platformRevenue.totalEarnings = (platformRevenue.totalEarnings || 0) + itemPrice;
    platformRevenue.totalCommission = (platformRevenue.totalCommission || 0) + commissionAmount;
    platformRevenue.totalSales = (platformRevenue.totalSales || 0) + 1;

    await Transaction.create({
      vendorId: product.vendorId,
      orderId: order.orderId,
      amount: itemPrice,
      commissionAmount: commissionAmount,
      netAmount: netAmount,
      type: 'sale',
      status: 'completed',
      paymentMethod: 'stripe',
      transactionDate: new Date()
    });

    await Notification.create({
      userId: product.vendorId,
      type: 'sale',
      message: `You made a sale! "${product.title}" was purchased for $${itemPrice.toFixed(2)}. Your earnings: $${netAmount.toFixed(2)}`,
      link: `/vendor/orders`
    });
  }

  platformRevenue.updatedAt = new Date();
  await platformRevenue.save();

  if (customerId) {
    await Notification.create({
      userId: customerId,
      type: 'order',
      message: `Your order #${order.orderId} has been completed! Your license keys are ready for download.`,
      link: `/orders/${order.orderId}`
    });
  }

  console.log('Order processed successfully:', orderId);
}
