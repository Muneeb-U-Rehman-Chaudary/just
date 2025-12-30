import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import connectDB from '@/db/mongodb';
import { Order, Product, Cart } from '@/db/models';
import { getSession } from '@/lib/auth-utils';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { session } = await getSession(request);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { items } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 });
    }

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    const orderItems = [];
    let totalAmount = 0;

      for (const item of items) {
        const product = await Product.findOne({ productId: item.productId }).lean();

        if (!product) {
          return NextResponse.json({ error: `Product ${item.productId} not found` }, { status: 404 });
        }

        totalAmount += product.price;
        orderItems.push({
          productId: product.productId,
          price: product.price,
          licenseKey: '',
          title: product.title,
          downloadUrl: product.downloadUrl,
          vendorId: product.vendorId
        });

        // Filter out data URLs or extremely long URLs for Stripe images
        const stripeImages = [];
        if (product.images?.length) {
          const firstImage = product.images[0];
          if (firstImage && !firstImage.startsWith('data:') && firstImage.length <= 2000) {
            stripeImages.push(firstImage);
          }
        }

        lineItems.push({
          price_data: {
            currency: 'usd',
            product_data: {
              name: product.title,
              description: product.description?.substring(0, 500) || '',
              images: stripeImages,
            },
            unit_amount: Math.round(product.price * 100),
          },
          quantity: 1,
        });
      }

    const pendingOrder = await Order.create({
      customerId: session.user.id,
      items: orderItems,
      totalAmount,
      paymentMethod: 'stripe',
      paymentStatus: 'pending',
      orderDate: new Date(),
      downloadStatus: 'available'
    });

    const origin = request.headers.get('origin') || 'http://localhost:3000';

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${origin}/orders/${pendingOrder.orderId}?success=true`,
      cancel_url: `${origin}/checkout?canceled=true`,
      metadata: {
        orderId: pendingOrder.orderId.toString(),
        customerId: session.user.id,
      },
      customer_email: session.user.email,
    });

    return NextResponse.json({ 
      sessionId: checkoutSession.id,
      url: checkoutSession.url 
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
