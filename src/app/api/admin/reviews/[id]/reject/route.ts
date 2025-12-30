import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { reviews } from '@/db/schema';
import { eq } from 'drizzle-orm';
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
    // Extract and verify JWT token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const JWT_SECRET = process.env.JWT_SECRET;

    if (!JWT_SECRET) {
      console.error('JWT_SECRET is not configured');
      return NextResponse.json(
        { error: 'Internal server error: Authentication configuration missing' },
        { status: 500 }
      );
    }

    let decoded: JWTPayload;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid or expired token', code: 'INVALID_TOKEN' },
        { status: 401 }
      );
    }

    // Verify admin role
    if (decoded.role !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied: Admin privileges required', code: 'FORBIDDEN' },
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

    // Parse optional request body
    let reason: string | undefined;
    try {
      const body = await request.json();
      reason = body.reason;
    } catch {
      // Body is optional, ignore parse errors
    }

    // Check if review exists
    const existingReview = await db
      .select()
      .from(reviews)
      .where(eq(reviews.id, parseInt(reviewId)))
      .limit(1);

    if (existingReview.length === 0) {
      return NextResponse.json(
        { error: 'Review not found', code: 'REVIEW_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Update review status to rejected
    const updatedReview = await db
      .update(reviews)
      .set({
        status: 'rejected'
      })
      .where(eq(reviews.id, parseInt(reviewId)))
      .returning();

    if (updatedReview.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update review status' },
        { status: 500 }
      );
    }

    // Return success response
    return NextResponse.json(
      {
        review: {
          id: updatedReview[0].id,
          status: updatedReview[0].status,
          updatedAt: new Date().toISOString()
        },
        message: 'Review rejected successfully',
        ...(reason && { reason })
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('POST /api/admin/reviews/[id]/reject error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}