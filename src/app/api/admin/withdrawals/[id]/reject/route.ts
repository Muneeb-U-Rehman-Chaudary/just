import { NextRequest, NextResponse } from "next/server";
import connectDB from '@/db/mongodb';
import { Withdrawal, Notification } from '@/db/models';
import { requireRole } from '@/lib/auth-utils';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    // Authenticate and verify admin role
    await requireRole(request, ['admin']);

    const withdrawalId = parseInt(params.id);
    const body = await request.json();
    const { reason } = body;

    if (isNaN(withdrawalId)) {
      return NextResponse.json(
        { error: "Valid withdrawal ID is required" },
        { status: 400 }
      );
    }

    const withdrawal = await Withdrawal.findOne({ withdrawalId });

    if (!withdrawal) {
      return NextResponse.json({ error: "Withdrawal not found" }, { status: 404 });
    }

    if (withdrawal.status !== 'pending') {
      return NextResponse.json(
        { error: "Withdrawal has already been processed" },
        { status: 400 }
      );
    }

    // Update withdrawal status
    withdrawal.status = "rejected";
    withdrawal.processedDate = new Date();
    if (reason) {
      withdrawal.notes = reason;
    }
    await withdrawal.save();

    // Generate unique notificationId
    const lastNotification = await Notification.findOne().sort({ notificationId: -1 });
    const notificationId = lastNotification ? lastNotification.notificationId + 1 : 1;

    // Create notification for vendor
    await Notification.create({
      notificationId,
      userId: withdrawal.vendorId,
      type: 'withdrawal_rejected',
      message: `Your withdrawal request of $${withdrawal.amount} has been rejected.${reason ? ` Reason: ${reason}` : ''}`,
      read: false,
      link: '/vendor/withdrawals',
      createdAt: new Date()
    });

    return NextResponse.json({
      message: "Withdrawal rejected successfully",
      withdrawal: {
        id: withdrawal.withdrawalId,
        status: withdrawal.status,
        processedDate: withdrawal.processedDate,
        reason
      }
    });
  } catch (error: any) {
    console.error("Withdrawal rejection error:", error);
    
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