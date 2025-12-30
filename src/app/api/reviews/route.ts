import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/db/mongodb';
import { Review, Product, User } from '@/db/models';
import { getSession } from '@/lib/auth-utils';

// GET /api/reviews - Get reviews for a product
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const productId = parseInt(searchParams.get('productId') || '0');

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    const productReviews = await Review.find({
      productId,
      status: 'approved'
    })
      .sort({ createdAt: -1 })
      .lean();

    // Get customer details for each review
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

    return NextResponse.json({ reviews: reviewsWithCustomers });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

// POST /api/reviews - Create new review
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { session } = await getSession(request);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { productId, rating, comment } = body;

    if (!productId || !rating || !comment) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      productId,
      customerId: session.user.id
    });

    if (existingReview) {
      return NextResponse.json({ error: 'You have already reviewed this product' }, { status: 400 });
    }

    const newReview = await Review.create({
      productId,
      customerId: session.user.id,
      rating,
      comment,
      status: 'pending'
    });

    // Update product rating
    const allReviews = await Review.find({
      productId,
      status: 'approved'
    });

    if (allReviews.length > 0) {
      const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      
      await Product.updateOne(
        { productId },
        {
          rating: avgRating,
          totalReviews: allReviews.length
        }
      );
    }

    return NextResponse.json({ 
      review: { ...newReview.toObject(), id: newReview.reviewId }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}