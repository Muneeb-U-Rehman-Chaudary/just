import { NextRequest, NextResponse } from "next/server";
import connectDB from '@/db/mongodb';
import { ActiveSponsor, User, Product } from '@/db/models';
import { requireRole } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Authenticate and verify admin role
    await requireRole(request, ['admin']);

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const tier = searchParams.get("tier");
    const status = searchParams.get("status") || "active";
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "startDate";
    const order = searchParams.get("order") || "desc";
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build query
    const query: any = {};
    if (type) query.type = type;
    if (tier) query.tier = tier;
    if (status) query.status = status;

    // Base query
    let sponsorsQuery = ActiveSponsor.find(query);

    // Populate vendor and product details
    sponsorsQuery = sponsorsQuery
      .populate({
        path: 'vendorId',
        select: 'name email storeName rating totalSales image',
        model: User
      });

    // Apply sorting
    const sortOptions: any = {};
    sortOptions[sortBy] = order === 'asc' ? 1 : -1;
    sponsorsQuery = sponsorsQuery.sort(sortOptions);

    // Apply pagination
    sponsorsQuery = sponsorsQuery.skip(offset).limit(limit);

    const sponsors = await sponsorsQuery;

    // Populate product details for product-type sponsors
    const sponsorsWithProducts = await Promise.all(
      sponsors.map(async (sponsor) => {
        let productData = null;
        if (sponsor.type === 'product' && sponsor.productId) {
          const product = await Product.findOne({ productId: sponsor.productId });
          
          if (product) {
            productData = {
              id: product.productId,
              title: product.title,
              category: product.category,
              price: product.price,
              image: product.images?.[0] || null
            };
          }
        }

        // Calculate days remaining
        const now = new Date();
        const endDate = new Date(sponsor.endDate);
        const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        return {
          id: sponsor.sponsorId,
          type: sponsor.type,
          vendor: sponsor.vendorId ? {
            id: sponsor.vendorId._id.toString(),
            name: sponsor.vendorId.name,
            email: sponsor.vendorId.email,
            storeName: sponsor.vendorId.storeName || null,
            rating: sponsor.vendorId.rating || 0,
            totalSales: sponsor.vendorId.totalSales || 0,
            image: sponsor.vendorId.image || null
          } : null,
          product: productData,
          tier: sponsor.tier,
          monthlyFee: sponsor.monthlyFee,
          startDate: sponsor.startDate,
          endDate: sponsor.endDate,
          daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
          status: sponsor.status,
          autoRenew: sponsor.autoRenew
        };
      })
    );

    // Apply search filter
    let filtered = sponsorsWithProducts;
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = sponsorsWithProducts.filter(s => 
        s.vendor?.name?.toLowerCase().includes(searchLower) ||
        s.vendor?.email?.toLowerCase().includes(searchLower) ||
        s.vendor?.storeName?.toLowerCase().includes(searchLower) ||
        s.product?.title?.toLowerCase().includes(searchLower)
      );
    }

    // Calculate stats
    const [totalCount, activeCount, expiredCount, cancelledCount] = await Promise.all([
      ActiveSponsor.countDocuments({}),
      ActiveSponsor.countDocuments({ status: 'active' }),
      ActiveSponsor.countDocuments({ status: 'expired' }),
      ActiveSponsor.countDocuments({ status: 'cancelled' })
    ]);

    const activeSponsors = await ActiveSponsor.find({ status: 'active' });
    const totalRevenue = activeSponsors.reduce((sum, s) => sum + (s.monthlyFee || 0), 0);
    const standardCount = activeSponsors.filter(s => s.tier === 'standard').length;
    const premiumCount = activeSponsors.filter(s => s.tier === 'premium').length;

    return NextResponse.json({
      sponsors: filtered,
      stats: {
        total: totalCount,
        active: activeCount,
        expired: expiredCount,
        cancelled: cancelledCount,
        totalRevenue,
        standardCount,
        premiumCount
      }
    });
  } catch (error: any) {
    console.error("GET /api/admin/sponsors error:", error);
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    if (error.message === 'Forbidden') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}