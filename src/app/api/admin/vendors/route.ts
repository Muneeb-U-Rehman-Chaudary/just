import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { user, products } from '@/db/schema';
import { eq, like, or, sql } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'MISSING_TOKEN' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid or expired token', code: 'INVALID_TOKEN' },
        { status: 401 }
      );
    }

    // Authorization check - must be admin
    if (decoded.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // Build base query for vendors
    let vendorQuery = db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        storeName: user.storeName,
        storeDescription: user.storeDescription,
        rating: user.rating,
        totalSales: user.totalSales,
        totalEarnings: user.totalEarnings,
        createdAt: user.createdAt,
      })
      .from(user)
      .where(eq(user.role, 'vendor'));

    // Apply search filter if provided
    if (search) {
      const searchTerm = `%${search}%`;
      vendorQuery = vendorQuery.where(
        or(
          like(user.name, searchTerm),
          like(user.email, searchTerm),
          like(user.storeName, searchTerm)
        )
      );
    }

    // Get total count for pagination
    let countQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(user)
      .where(eq(user.role, 'vendor'));

    if (search) {
      const searchTerm = `%${search}%`;
      countQuery = countQuery.where(
        or(
          like(user.name, searchTerm),
          like(user.email, searchTerm),
          like(user.storeName, searchTerm)
        )
      );
    }

    const [totalResult] = await countQuery;
    const total = totalResult?.count ?? 0;

    // Execute vendor query with pagination
    const vendors = await vendorQuery.limit(limit).offset(offset);

    // Get product counts for each vendor
    const vendorsWithCounts = await Promise.all(
      vendors.map(async (vendor) => {
        const productCountResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(products)
          .where(eq(products.vendorId, vendor.id));

        const productCount = productCountResult[0]?.count ?? 0;

        return {
          id: vendor.id,
          name: vendor.name,
          email: vendor.email,
          storeName: vendor.storeName ?? '',
          storeDescription: vendor.storeDescription ?? '',
          rating: vendor.rating ?? 0,
          totalSales: vendor.totalSales ?? 0,
          totalEarnings: vendor.totalEarnings ?? 0,
          productCount: productCount,
          createdAt: vendor.createdAt,
        };
      })
    );

    return NextResponse.json(
      {
        vendors: vendorsWithCounts,
        total: total,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('GET /api/admin/vendors error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + error.message,
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}