import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/db/mongodb';
import { Product, User, Notification } from '@/db/models';
import { getSession } from '@/lib/auth-utils';
import mongoose from 'mongoose';

// POST /api/admin/products/[id]/reject - Reject product
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const body = await request.json();
    const { reason } = body;
    
    // Try to find product by productId (number) or MongoDB _id (string)
    let product;
    const numericId = parseInt(id);
    if (!isNaN(numericId)) {
      product = await Product.findOne({ productId: numericId });
    }
    
    // If not found by productId, try finding by MongoDB _id
    if (!product && mongoose.Types.ObjectId.isValid(id)) {
      product = await Product.findById(id);
    }

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    product.status = 'rejected';
    product.updatedAt = new Date();
    await product.save();

    // Create notification for vendor
    await Notification.create({
      userId: product.vendorId,
      type: 'product_rejected',
      message: `Your product "${product.title}" has been rejected. ${reason ? `Reason: ${reason}` : ''}`,
      link: `/products/${product.productId || product._id}`
    });

    return NextResponse.json({ 
      product: { ...product.toObject(), id: product.productId || product._id }
    });
  } catch (error) {
    console.error('Error rejecting product:', error);
    return NextResponse.json({ error: 'Failed to reject product' }, { status: 500 });
  }
}