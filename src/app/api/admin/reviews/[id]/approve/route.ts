import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { reviews, products } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  userId: string;
  role: string;
  email: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication check
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    // Verify JWT token
    let decoded: JWTPayload;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid or expired token', code: 'INVALID_TOKEN' },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (decoded.role !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied. Admin role required.', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    // Validate review ID
    const reviewId = params.id;
    if (!reviewId || isNaN(parseInt(reviewId))) {
      return NextResponse.json(
        { error: 'Valid review ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Find review by ID
    const review = await db
      .select()
      .from(reviews)
      .where(eq(reviews.id, parseInt(reviewId)))
      .limit(1);

    if (review.length === 0) {
      return NextResponse.json(
        { error: 'Review not found', code: 'REVIEW_NOT_FOUND' },
        { status: 404 }
      );
    }

    const existingReview = review[0];

    // Update review status to approved
    const updatedReview = await db
      .update(reviews)
      .set({
        status: 'approved'
      })
      .where(eq(reviews.id, parseInt(reviewId)))
      .returning();

    // Get all approved reviews for the product
    const approvedReviews = await db
      .select()
      .from(reviews)
      .where(
        and(
          eq(reviews.productId, existingReview.productId),
          eq(reviews.status, 'approved')
        )
      );

    // Calculate average rating
    let totalRating = 0;
    for (const rev of approvedReviews) {
      totalRating += rev.rating;
    }
    const averageRating = approvedReviews.length > 0 
      ? totalRating / approvedReviews.length 
      : 0;

    // Update product rating and totalReviews count
    await db
      .update(products)
      .set({
        rating: parseFloat(averageRating.toFixed(2)),
        totalReviews: approvedReviews.length,
        updatedAt: new Date()
      })
      .where(eq(products.id, existingReview.productId));

    return NextResponse.json(
      {
        review: {
          id: updatedReview[0].id,
          status: updatedReview[0].status,
          updatedAt: new Date().toISOString()
        },
        message: 'Review approved successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('POST /api/admin/reviews/[id]/approve error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}