import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/db/mongodb';
import { Product, User, Review } from '@/db/models';
import { getSession } from '@/lib/auth-utils';
import mongoose from 'mongoose';

// GET /api/products/[id] - Get single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    
    // Handle "undefined" string or invalid id
    if (!id || id === 'undefined' || id === 'null') {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }
    
    const productId = parseInt(id);
    
    // Try to find by productId (number) or MongoDB _id (string)
    let product;
    if (!isNaN(productId)) {
      product = await Product.findOne({ productId }).lean();
    }
    
    // If not found by productId, try finding by MongoDB _id
    if (!product && mongoose.Types.ObjectId.isValid(id)) {
      product = await Product.findById(id).lean();
    }

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Get vendor details
    const vendor = await User.findById(product.vendorId)
      .select('_id name image storeName rating totalSales')
      .lean();

    // Get approved reviews
    const reviewProductId = product.productId || parseInt(id);
    const productReviews = !isNaN(reviewProductId) ? await Review.find({ 
      productId: reviewProductId, 
      status: 'approved' 
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean() : [];

    // Get customer details for reviews
    const reviewsWithCustomers = await Promise.all(
      productReviews.map(async (review) => {
        const customer = await User.findById(review.customerId)
          .select('_id name image')
          .lean();
        return {
          ...review,
          id: review.reviewId,
          customer: customer ? {
            id: customer._id.toString(),
            name: customer.name,
            image: customer.image
          } : null
        };
      })
    );

    return NextResponse.json({ 
      product: {
        ...product,
        id: product.productId ?? product._id?.toString(),
        vendor: vendor ? {
          id: vendor._id.toString(),
          name: vendor.name,
          image: vendor.image,
          storeName: vendor.storeName,
          rating: vendor.rating,
          totalSales: vendor.totalSales
        } : null,
        reviews: reviewsWithCustomers
      }
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

// PUT /api/products/[id] - Update product (Vendor only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { session } = await getSession(request);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    
    if (!id || id === 'undefined' || id === 'null') {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }
    
    const productId = parseInt(id);
    const body = await request.json();

    // Try to find by productId (number) or MongoDB _id (string)
    let existingProduct;
    if (!isNaN(productId)) {
      existingProduct = await Product.findOne({ productId });
    }
    
    if (!existingProduct && mongoose.Types.ObjectId.isValid(id)) {
      existingProduct = await Product.findById(id);
    }

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (existingProduct.vendorId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update product
    Object.assign(existingProduct, {
      ...body,
      images: body.images ? (Array.isArray(body.images) ? body.images : JSON.parse(body.images)) : existingProduct.images,
      tags: body.tags ? (Array.isArray(body.tags) ? body.tags : JSON.parse(body.tags)) : existingProduct.tags,
      updatedAt: new Date()
    });

    await existingProduct.save();

    return NextResponse.json({ 
      product: { ...existingProduct.toObject(), id: existingProduct.productId ?? existingProduct._id?.toString() }
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

// DELETE /api/products/[id] - Delete product (Vendor only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { session } = await getSession(request);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    
    if (!id || id === 'undefined' || id === 'null') {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }
    
    const productId = parseInt(id);

    // Try to find by productId (number) or MongoDB _id (string)
    let existingProduct;
    if (!isNaN(productId)) {
      existingProduct = await Product.findOne({ productId });
    }
    
    if (!existingProduct && mongoose.Types.ObjectId.isValid(id)) {
      existingProduct = await Product.findById(id);
    }

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (existingProduct.vendorId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await existingProduct.deleteOne();

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}