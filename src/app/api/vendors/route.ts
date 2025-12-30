import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/db/mongodb';
import { User, Product } from '@/db/models';

// GET /api/vendors - Get all vendors with their products
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '12');
    const featured = searchParams.get('featured') === 'true';
    
    // Get vendors with at least one approved product
      const vendors = await User.find({ 
        role: 'vendor'
      })
        .select('_id name email storeName storeDescription rating totalSales totalEarnings image sponsored')
        .limit(limit)
        .sort({ totalSales: -1 })
        .lean();
    
    // Get product counts and featured products for each vendor
    const vendorsWithDetails = await Promise.all(
      vendors.map(async (vendor) => {
        const productCount = await Product.countDocuments({ 
          vendorId: vendor._id.toString(), 
          status: 'approved' 
        });
        
        const featuredProducts = await Product.find({ 
          vendorId: vendor._id.toString(), 
          status: 'approved' 
        })
          .select('productId title price images rating')
          .limit(3)
          .sort({ totalSales: -1 })
          .lean();
        
        return {
          id: vendor._id.toString(),
          name: vendor.name,
          email: vendor.email,
          storeName: vendor.storeName || `${vendor.name}'s Store`,
          storeDescription: vendor.storeDescription || 'Quality digital products',
          rating: vendor.rating || 0,
          totalSales: vendor.totalSales || 0,
          totalEarnings: vendor.totalEarnings || 0,
          image: vendor.image,
          productCount,
          featuredProducts: featuredProducts.map(p => ({
            id: p.productId,
            title: p.title,
            price: p.price,
            image: p.images[0],
            rating: p.rating
          }))
        };
      })
    );
    
    // Filter out vendors with no products if needed
    const activeVendors = featured 
      ? vendorsWithDetails.filter(v => v.productCount > 0)
      : vendorsWithDetails;
    
    return NextResponse.json({ 
      vendors: activeVendors,
      total: activeVendors.length
    });
  } catch (error) {
    console.error('Error fetching vendors:', error);
    return NextResponse.json({ error: 'Failed to fetch vendors' }, { status: 500 });
  }
}
