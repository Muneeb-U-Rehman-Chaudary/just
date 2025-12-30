import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/db/mongodb';
import { ActiveSponsor, User, Notification } from '@/db/models';
import { getSession } from '@/lib/auth-utils';

export async function POST(
  request: NextRequest,
  { params }: { params: { vendorId: string } }
) {
  try {
    await connectDB();

    // Authentication check
    const session = await getSession(request);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    // Admin role verification
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const { vendorId } = params;

    // Validate vendor exists
    const vendor = await User.findOne({ id: vendorId });
    if (!vendor) {
      return NextResponse.json(
        { error: 'Vendor not found', code: 'VENDOR_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const { tier, type, duration } = body;

    // Validate tier
    if (!tier || !['standard', 'premium'].includes(tier)) {
      return NextResponse.json(
        { 
          error: 'Invalid tier. Must be "standard" or "premium"', 
          code: 'INVALID_TIER' 
        },
        { status: 400 }
      );
    }

    // Validate type
    if (!type || !['vendor', 'product'].includes(type)) {
      return NextResponse.json(
        { 
          error: 'Invalid type. Must be "vendor" or "product"', 
          code: 'INVALID_TYPE' 
        },
        { status: 400 }
      );
    }

    // Calculate monthly fee based on tier
    const monthlyFee = tier === 'standard' ? 49 : 99;

    // Calculate dates
    const startDate = new Date();
    const durationDays = duration && !isNaN(parseInt(duration)) ? parseInt(duration) : 30;
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + durationDays);

    // Generate unique sponsorId
    const lastSponsor = await ActiveSponsor.findOne().sort({ sponsorId: -1 });
    const sponsorId = lastSponsor ? lastSponsor.sponsorId + 1 : 1;

    // Create ActiveSponsor
    const activeSponsor = await ActiveSponsor.create({
      type,
      vendorId,
      tier,
      monthlyFee,
      startDate,
      endDate,
      status: 'active',
      sponsorId,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // If type is vendor, update User sponsored flag
    if (type === 'vendor') {
      await User.findOneAndUpdate({ id: vendorId }, { sponsored: true });
    }

    // Generate unique notificationId
    const lastNotification = await Notification.findOne().sort({ notificationId: -1 });
    const notificationId = lastNotification ? lastNotification.notificationId + 1 : 1;

    // Create notification for vendor
    await Notification.create({
      notificationId,
      userId: vendorId,
      type: 'sponsorship_granted',
      message: `Your ${type} sponsorship has been activated with ${tier} tier for ${durationDays} days`,
      read: false,
      link: type === 'vendor' ? '/dashboard/vendor' : '/dashboard/products',
      createdAt: new Date()
    });

    return NextResponse.json(
      {
        activeSponsor: {
          id: activeSponsor.sponsorId,
          type: activeSponsor.type,
          vendorId: activeSponsor.vendorId,
          tier: activeSponsor.tier,
          monthlyFee: activeSponsor.monthlyFee,
          startDate: activeSponsor.startDate,
          endDate: activeSponsor.endDate,
          status: activeSponsor.status
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST sponsor error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { vendorId: string } }
) {
  try {
    await connectDB();

    // Authentication check
    const session = await getSession(request);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    // Admin role verification
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const { vendorId } = params;

    // Validate vendor exists
    const vendor = await User.findOne({ id: vendorId });
    if (!vendor) {
      return NextResponse.json(
        { error: 'Vendor not found', code: 'VENDOR_NOT_FOUND' },
        { status: 404 }
      );
    }

    const now = new Date();

    // Find and update all active vendor-type sponsors for this vendor
    await ActiveSponsor.updateMany(
      {
        vendorId,
        type: 'vendor',
        status: 'active'
      },
      {
        status: 'cancelled',
        endDate: now,
        updatedAt: now
      }
    );

    // Check if vendor has any remaining active sponsors (product-level)
    const remainingActiveSponsors = await ActiveSponsor.countDocuments({
      vendorId,
      status: 'active'
    });

    // If no active sponsors remain, update User sponsored flag
    if (remainingActiveSponsors === 0) {
      await User.findOneAndUpdate({ id: vendorId }, { sponsored: false });
    }

    // Generate unique notificationId
    const lastNotification = await Notification.findOne().sort({ notificationId: -1 });
    const notificationId = lastNotification ? lastNotification.notificationId + 1 : 1;

    // Create notification for vendor
    await Notification.create({
      notificationId,
      userId: vendorId,
      type: 'sponsorship_removed',
      message: 'Your vendor sponsorship has been cancelled',
      read: false,
      link: '/dashboard/vendor',
      createdAt: now
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Sponsorship removed'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE sponsor error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}