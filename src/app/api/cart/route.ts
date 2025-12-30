import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/db/mongodb';
import { Cart, Product } from '@/db/models';
import { getSession } from '@/lib/auth-utils';

// GET /api/cart - Get user's cart
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { session } = await getSession(request);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userCart = await Cart.findOne({ userId: session.user.id }).lean();

    if (!userCart || !userCart.items || userCart.items.length === 0) {
      return NextResponse.json({ cart: { items: [] } });
    }

    const items = userCart.items;
    
    // Fetch product details for each cart item
    const productIds = items.map((item: any) => Number(item.productId));
    const cartProducts = await Product.find({ productId: { $in: productIds } }).lean();

    const cartWithDetails = items.map((item: any) => {
      const product = cartProducts.find(p => Number(p.productId) === Number(item.productId));
      if (!product) return null;

      // Ensure images is always an array
      let images = product.images;
      if (typeof images === 'string') {
        try {
          images = JSON.parse(images);
        } catch (e) {
          images = [images];
        }
      }

      return {
        ...item,
        product: {
          ...product,
          id: product.productId, // Ensure id matches productId for frontend consistency
          images: Array.isArray(images) ? images : [images].filter(Boolean)
        }
      };
    }).filter((item: any) => item !== null);

    // If some products were not found, update the cart to remove them
    if (cartWithDetails.length !== items.length) {
      const updatedItems = cartWithDetails.map((item: any) => ({
        productId: item.productId,
        addedAt: item.addedAt
      }));
      await Cart.updateOne(
        { userId: session.user.id }, 
        { $set: { items: updatedItems, updatedAt: new Date() } }
      );
    }

    return NextResponse.json({ cart: { items: cartWithDetails } });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 });
  }
}

// POST /api/cart - Add item to cart
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { session } = await getSession(request);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    // Check if product exists
    const product = await Product.findOne({ productId }).lean();

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Get or create cart
    let userCart = await Cart.findOne({ userId: session.user.id });

    if (!userCart) {
      userCart = await Cart.create({
        userId: session.user.id,
        items: [{ productId: Number(productId), addedAt: new Date() }]
      });
      return NextResponse.json({ cart: userCart.toObject() }, { status: 201 });
    }

    const items = userCart.items || [];
    
    // Check if item already in cart
    if (items.some((item: any) => Number(item.productId) === Number(productId))) {
      return NextResponse.json({ error: 'Item already in cart' }, { status: 400 });
    }

    items.push({ productId: Number(productId), addedAt: new Date() });

    userCart.items = items;
    userCart.updatedAt = new Date();
    await userCart.save();

    return NextResponse.json({ cart: userCart.toObject() });
  } catch (error) {
    console.error('Error adding to cart:', error);
    return NextResponse.json({ error: 'Failed to add to cart' }, { status: 500 });
  }
}

// DELETE /api/cart - Remove item from cart
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    
    const { session } = await getSession(request);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const productId = Number(searchParams.get('productId'));

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    const userCart = await Cart.findOne({ userId: session.user.id });

    if (!userCart) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
    }

    const items = userCart.items || [];
    const filteredItems = items.filter((item: any) => Number(item.productId) !== productId);

    userCart.items = filteredItems;
    userCart.updatedAt = new Date();
    await userCart.save();

    return NextResponse.json({ cart: userCart.toObject() });
  } catch (error) {
    console.error('Error removing from cart:', error);
    return NextResponse.json({ error: 'Failed to remove from cart' }, { status: 500 });
  }
}
