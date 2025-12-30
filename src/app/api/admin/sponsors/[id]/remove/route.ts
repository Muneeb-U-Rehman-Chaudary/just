import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/db/mongodb';
import { ActiveSponsor, User, Product, Notification } from '@/db/models';
import { getSession } from '@/lib/auth-utils';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Connect to MongoDB
    await connectDB();

    // Authentication check
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Authorization check - must be admin
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    // Validate sponsor ID
    const sponsorId = parseInt(params.id);
    if (isNaN(sponsorId)) {
      return NextResponse.json(
        { error: 'Valid sponsor ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { reason } = body;

    // Find the sponsor
    const sponsor = await ActiveSponsor.findOne({ sponsorId });
    if (!sponsor) {
      return NextResponse.json(
        { error: 'Sponsor not found', code: 'SPONSOR_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Validate sponsor status
    if (sponsor.status !== 'active') {
      return NextResponse.json(
        {
          error: 'Sponsor is already cancelled or expired',
          code: 'INVALID_STATUS',
        },
        { status: 400 }
      );
    }

    // Update sponsor status
    sponsor.status = 'cancelled';
    sponsor.endDate = new Date();
    await sponsor.save();

    // Handle vendor sponsorship
    if (sponsor.type === 'vendor') {
      // Check if vendor has other active sponsors
      const otherActiveSponsors = await ActiveSponsor.countDocuments({
        vendorId: sponsor.vendorId,
        status: 'active',
        _id: { $ne: sponsor._id },
      });

      // If no other active sponsors, update vendor's sponsored status
      if (otherActiveSponsors === 0) {
        await User.findOneAndUpdate(
          { id: sponsor.vendorId },
          { sponsored: false }
        );
      }
    }

    // Handle product sponsorship
    if (sponsor.type === 'product' && sponsor.productId) {
      await Product.findOneAndUpdate(
        { productId: sponsor.productId },
        { sponsored: false }
      );
    }

    // Generate unique notificationId
    const lastNotification = await Notification.findOne().sort({ notificationId: -1 });
    const notificationId = lastNotification ? lastNotification.notificationId + 1 : 1;

    // Create notification for vendor
    const notificationMessage = reason
      ? `Your ${sponsor.tier} sponsorship has been cancelled. Reason: ${reason}`
      : `Your ${sponsor.tier} sponsorship has been cancelled.`;

    await Notification.create({
      notificationId,
      userId: sponsor.vendorId,
      type: 'sponsorship_cancelled',
      message: notificationMessage,
      read: false,
      link: `/vendor/sponsorships`,
      createdAt: new Date(),
    });

    // Prepare response
    const responseData = {
      sponsor: {
        id: sponsor.sponsorId,
        type: sponsor.type,
        vendorId: sponsor.vendorId,
        productId: sponsor.productId,
        tier: sponsor.tier,
        status: sponsor.status,
        endDate: sponsor.endDate,
      },
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error('POST /api/admin/sponsors/:id/remove error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}