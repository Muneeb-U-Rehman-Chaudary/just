import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-utils';
import connectDB from '@/db/mongodb';
import { ActiveSponsor, SponsorshipRequest, User, Product, Notification } from '@/db/models';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const session = await getSession(request);
    if (!session?.user) {
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

    const requestId = params.id;
    if (!requestId || isNaN(parseInt(requestId))) {
      return NextResponse.json(
        { error: 'Valid request ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { tier, monthlyFee, startDate, duration, adminNotes } = body;

    const sponsorshipRequest = await SponsorshipRequest.findOne({ 
      requestId: parseInt(requestId) 
    });

    if (!sponsorshipRequest) {
      return NextResponse.json(
        { error: 'Sponsorship request not found', code: 'REQUEST_NOT_FOUND' },
        { status: 404 }
      );
    }

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

    const finalTier = tier || sponsorshipRequest.tier;
    const finalMonthlyFee = monthlyFee || sponsorshipRequest.monthlyFee;
    const finalStartDate = startDate ? new Date(startDate) : new Date();
    const finalDuration = duration || 30;
    const finalEndDate = new Date(finalStartDate);
    finalEndDate.setDate(finalEndDate.getDate() + finalDuration);

    sponsorshipRequest.status = 'approved';
    sponsorshipRequest.processedDate = new Date();
    sponsorshipRequest.processedBy = session.user.id;
    sponsorshipRequest.tier = finalTier;
    sponsorshipRequest.monthlyFee = finalMonthlyFee;
    if (adminNotes) {
      sponsorshipRequest.adminNotes = adminNotes;
    }
    await sponsorshipRequest.save();

    const lastActiveSponsor = await ActiveSponsor.findOne()
      .sort({ sponsorId: -1 })
      .limit(1);
    const nextSponsorId = lastActiveSponsor ? lastActiveSponsor.sponsorId + 1 : 1;

    const activeSponsorData = {
      type: sponsorshipRequest.type,
      vendorId: sponsorshipRequest.vendorId,
      tier: finalTier,
      monthlyFee: finalMonthlyFee,
      startDate: finalStartDate,
      endDate: finalEndDate,
      status: 'active',
      autoRenew: false,
      requestId: sponsorshipRequest.requestId,
      sponsorId: nextSponsorId
    };

    if (sponsorshipRequest.type === 'product' && sponsorshipRequest.productId) {
      activeSponsorData.productId = sponsorshipRequest.productId;
    }

    const activeSponsor = await ActiveSponsor.create(activeSponsorData);

    if (sponsorshipRequest.type === 'vendor') {
      await User.findOneAndUpdate(
        { id: sponsorshipRequest.vendorId },
        { sponsored: true }
      );
    } else if (sponsorshipRequest.type === 'product' && sponsorshipRequest.productId) {
      await Product.findOneAndUpdate(
        { id: sponsorshipRequest.productId },
        { sponsored: true }
      );
    }

    const notificationMessage = `Your ${sponsorshipRequest.type} sponsorship request has been approved! Tier: ${finalTier}, Start Date: ${finalStartDate.toLocaleDateString()}, End Date: ${finalEndDate.toLocaleDateString()}`;
    
    await Notification.create({
      userId: sponsorshipRequest.vendorId,
      type: 'sponsorship_approved',
      message: notificationMessage,
      read: false,
      link: sponsorshipRequest.type === 'product' && sponsorshipRequest.productId
        ? `/products/${sponsorshipRequest.productId}`
        : '/vendor/dashboard'
    });

    const responseRequest = {
      id: sponsorshipRequest.requestId,
      type: sponsorshipRequest.type,
      vendorId: sponsorshipRequest.vendorId,
      productId: sponsorshipRequest.productId,
      tier: sponsorshipRequest.tier,
      monthlyFee: sponsorshipRequest.monthlyFee,
      status: sponsorshipRequest.status,
      requestDate: sponsorshipRequest.requestDate,
      processedDate: sponsorshipRequest.processedDate,
      processedBy: sponsorshipRequest.processedBy,
      adminNotes: sponsorshipRequest.adminNotes
    };

    const responseActiveSponsor = {
      id: activeSponsor._id.toString(),
      type: activeSponsor.type,
      vendorId: activeSponsor.vendorId,
      productId: activeSponsor.productId,
      tier: activeSponsor.tier,
      monthlyFee: activeSponsor.monthlyFee,
      startDate: activeSponsor.startDate,
      endDate: activeSponsor.endDate,
      status: activeSponsor.status,
      autoRenew: activeSponsor.autoRenew,
      requestId: activeSponsor.requestId,
      sponsorId: activeSponsor.sponsorId
    };

    return NextResponse.json(
      {
        request: responseRequest,
        activeSponsor: responseActiveSponsor
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('POST approve sponsorship request error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}