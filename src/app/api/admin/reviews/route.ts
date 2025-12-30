import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { reviews, products, user } from '@/db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  userId: string;
  role: string;
  email: string;
}

async function verifyAdminToken(request: NextRequest): Promise<{ userId: string; role: string } | null> {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      console.error('JWT_SECRET not configured');
      return null;
    }

    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;
    
    if (decoded.role !== 'admin') {
      return null;
    }

    return { userId: decoded.userId, role: decoded.role };
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdminToken(request);
    
    if (!admin) {
      const authHeader = request.headers.get('authorization');
      if (!authHeader) {
        return NextResponse.json({ 
          error: 'Authorization token required',
          code: 'MISSING_TOKEN'
        }, { status: 401 });
      }
      
      return NextResponse.json({ 
        error: 'Access denied. Admin privileges required',
        code: 'FORBIDDEN'
      }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const productId = searchParams.get('productId');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    let whereConditions = [];
    
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      whereConditions.push(eq(reviews.status, status as 'pending' | 'approved' | 'rejected'));
    }
    
    if (productId && !isNaN(parseInt(productId))) {
      whereConditions.push(eq(reviews.productId, parseInt(productId)));
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const reviewsData = await db
      .select({
        id: reviews.id,
        productId: reviews.productId,
        productTitle: products.title,
        customerId: reviews.customerId,
        customerName: user.name,
        customerEmail: user.email,
        rating: reviews.rating,
        comment: reviews.comment,
        status: reviews.status,
        helpfulCount: reviews.helpfulCount,
        createdAt: reviews.createdAt,
      })
      .from(reviews)
      .leftJoin(products, eq(reviews.productId, products.id))
      .leftJoin(user, eq(reviews.customerId, user.id))
      .where(whereClause)
      .orderBy(desc(reviews.createdAt))
      .limit(limit)
      .offset(offset);

    const statsQuery = await db
      .select({
        status: reviews.status,
        count: sql<number>`count(*)`.as('count'),
      })
      .from(reviews)
      .groupBy(reviews.status);

    const stats = {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
    };

    statsQuery.forEach(stat => {
      const count = Number(stat.count);
      stats.total += count;
      if (stat.status === 'pending') stats.pending = count;
      if (stat.status === 'approved') stats.approved = count;
      if (stat.status === 'rejected') stats.rejected = count;
    });

    return NextResponse.json({
      reviews: reviewsData,
      stats,
    }, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}