import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/db/mongodb';
import { Product, User, Notification } from '@/db/models';
import { getSession } from '@/lib/auth-utils';
import mongoose from 'mongoose';

const counterSchema = new mongoose.Schema({
  _id: String,
  seq: { type: Number, default: 0 }
});

const CounterModel = mongoose.models.Counter || mongoose.model('Counter', counterSchema);

async function getNextProductId() {
  const counter = await CounterModel.findByIdAndUpdate(
    { _id: 'productId' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
}

// GET /api/products - Get all products with filtering
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    const status = searchParams.get('status');
    const vendorId = searchParams.get('vendorId');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    const query: any = {};
    
    // Handle vendorId=me for vendor's own products
    if (vendorId === 'me') {
      const { session } = await getSession(request);
      if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      query.vendorId = session.user.id;
      // Don't filter by status for vendor's own products - they should see all their products
    } else if (vendorId) {
      query.vendorId = vendorId;
      // Only show approved products for other vendors
      query.status = status || 'approved';
    } else {
      // Default: only show approved products for public listings
      query.status = status || 'approved';
    }
    
    if (category) {
      query.category = category;
    }
    
    if (featured === 'true') {
      query.featured = true;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const sortField = sortBy === 'price' ? 'price' : 
                      sortBy === 'rating' ? 'rating' :
                      sortBy === 'sales' ? 'totalSales' :
                      'createdAt';
    
    const sortOrder = order === 'asc' ? 1 : -1;

    const products = await Product.find(query)
      .sort({ [sortField]: sortOrder })
      .limit(limit)
      .skip(offset)
      .lean();

    // Convert MongoDB _id to id for frontend compatibility
    const formattedProducts = products.map(product => ({
      ...product,
      id: product.productId,
      _id: undefined
    }));

    return NextResponse.json({ products: formattedProducts, count: formattedProducts.length });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

// POST /api/products - Create new product (Vendor only)
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { session } = await getSession(request);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      category,
      price,
      images,
      downloadUrl,
      fileSize,
      version,
      compatibility,
      tags,
      demoUrl,
      changelog,
      licenseType
    } = body;

    if (!title || !description || !category || !price || !images || !downloadUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Generate productId explicitly
    const productId = await getNextProductId();

    const newProduct = new Product({
      productId,
      title,
      description,
      category,
      price: parseFloat(price),
      images: Array.isArray(images) ? images : JSON.parse(images),
      downloadUrl,
      fileSize,
      version,
      compatibility,
      vendorId: session.user.id,
      tags: tags ? (Array.isArray(tags) ? tags : JSON.parse(tags)) : [],
      demoUrl,
      changelog,
      licenseType,
      status: 'pending'
    });
    
    await newProduct.save();

    // Get vendor info for notification message
    const vendor = await User.findById(session.user.id).select('name storeName').lean();
    const vendorName = (vendor as any)?.storeName || (vendor as any)?.name || 'A vendor';

    // Create notification for all admin users
    const admins = await User.find({ role: 'admin' }).select('_id').lean();
    if (admins.length > 0) {
      for (const admin of admins) {
        await Notification.create({
          userId: (admin as any)._id.toString(),
          type: 'new_product_submission',
          message: `${vendorName} submitted a new product "${title}" for review`,
          link: `/admin/products`
        });
      }
    }

    return NextResponse.json({ 
      product: { 
        ...newProduct.toObject(), 
        id: newProduct.productId 
      } 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}