import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/db/mongodb';
import { SponsorshipRequest, Notification } from '@/db/models';
import { getSession } from '@/lib/auth-utils';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Connect to MongoDB
    await connectDB();

    // Authenticate and verify admin role
    const session = await getSession(request);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    // Get request ID from params
    const requestId = parseInt(params.id);
    if (isNaN(requestId)) {
      return NextResponse.json(
        { error: 'Valid request ID is required', code: 'INVALID_REQUEST_ID' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { reason } = body;

    // Validate reason is provided
    if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
      return NextResponse.json(
        { error: 'Rejection reason is required', code: 'MISSING_REASON' },
        { status: 400 }
      );
    }

    // Find the sponsorship request
    const sponsorshipRequest = await SponsorshipRequest.findOne({ requestId });

    if (!sponsorshipRequest) {
      return NextResponse.json(
        { error: 'Sponsorship request not found', code: 'REQUEST_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Validate request status is pending
    if (sponsorshipRequest.status !== 'pending') {
      return NextResponse.json(
        {
          error: 'Request has already been processed',
          code: 'REQUEST_ALREADY_PROCESSED',
          currentStatus: sponsorshipRequest.status
        },
        { status: 400 }
      );
    }

    // Update the sponsorship request
    const now = new Date();
    sponsorshipRequest.status = 'rejected';
    sponsorshipRequest.processedDate = now;
    sponsorshipRequest.processedBy = session.user.id;
    sponsorshipRequest.adminNotes = reason.trim();

    await sponsorshipRequest.save();

    // Generate unique notificationId
    const lastNotification = await Notification.findOne().sort({ notificationId: -1 });
    const notificationId = lastNotification ? lastNotification.notificationId + 1 : 1;

    // Create notification for the vendor
    const notificationMessage = `Your sponsorship request for ${sponsorshipRequest.type} - ${sponsorshipRequest.tier} tier has been rejected. Reason: ${reason.trim()}`;

    await Notification.create({
      notificationId,
      userId: sponsorshipRequest.vendorId,
      type: 'sponsorship_rejected',
      message: notificationMessage,
      read: false,
      link: `/vendor/sponsorships`,
      createdAt: now
    });

    // Return the updated request
    return NextResponse.json(
      {
        request: {
          id: sponsorshipRequest.requestId,
          type: sponsorshipRequest.type,
          status: sponsorshipRequest.status,
          tier: sponsorshipRequest.tier,
          vendorId: sponsorshipRequest.vendorId,
          productId: sponsorshipRequest.productId,
          monthlyFee: sponsorshipRequest.monthlyFee,
          commission: sponsorshipRequest.commission,
          requestDate: sponsorshipRequest.requestDate,
          processedDate: sponsorshipRequest.processedDate,
          processedBy: sponsorshipRequest.processedBy,
          adminNotes: sponsorshipRequest.adminNotes,
          message: sponsorshipRequest.message
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('POST /api/admin/sponsors/requests/[id]/reject error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}