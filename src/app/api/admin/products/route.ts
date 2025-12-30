import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/db/mongodb';
import { Product, User } from '@/db/models';
import { getSession } from '@/lib/auth-utils';

// GET /api/admin/products - Get all products (Admin only)
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const query: any = {};
    if (status) {
      query.status = status;
    }

    const allProducts = await Product.find(query)
      .sort({ createdAt: -1 })
      .lean();

    // Get vendor details for each product
    const productsWithVendors = await Promise.all(
      allProducts.map(async (product) => {
        const vendor = await User.findById(product.vendorId)
          .select('_id name email storeName')
          .lean();
        return {
          ...product,
          id: product.productId ?? product._id?.toString(),
          vendor: vendor ? {
            id: vendor._id.toString(),
            name: vendor.name,
            email: vendor.email,
            storeName: vendor.storeName
          } : null
        };
      })
    );

    return NextResponse.json({ products: productsWithVendors });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}