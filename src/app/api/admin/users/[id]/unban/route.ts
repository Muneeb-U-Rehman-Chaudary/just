import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/db/mongodb';
import { User, Notification } from '@/db/models';
import { requireRole } from '@/lib/auth-utils';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    // Verify admin role
    await requireRole(request, ['admin']);

    const userId = params.id;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required', code: 'MISSING_USER_ID' },
        { status: 400 }
      );
    }

    // Find user by id
    const existingUser = await User.findOne({ _id: userId });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found', code: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Check if user is currently banned
    const bankDetailsObj = existingUser.bankDetails 
      ? JSON.parse(existingUser.bankDetails) 
      : {};
    
    if (!bankDetailsObj.status || bankDetailsObj.status !== 'banned') {
      return NextResponse.json(
        { error: 'User is not currently banned', code: 'USER_NOT_BANNED' },
        { status: 400 }
      );
    }

    // Update user status to active and clear ban fields
    const updatedBankDetails = {
      ...bankDetailsObj,
      status: 'active',
      bannedAt: undefined,
      bannedReason: undefined
    };

    // Remove undefined fields
    delete updatedBankDetails.bannedAt;
    delete updatedBankDetails.bannedReason;

    existingUser.bankDetails = JSON.stringify(updatedBankDetails);
    existingUser.updatedAt = new Date();
    await existingUser.save();

    // Generate unique notificationId
    const lastNotification = await Notification.findOne().sort({ notificationId: -1 });
    const notificationId = lastNotification ? lastNotification.notificationId + 1 : 1;

    // Create notification for the unbanned user
    await Notification.create({
      notificationId,
      userId: userId,
      type: 'account_unbanned',
      message: 'Your account has been unbanned. You can now access all features.',
      link: '/dashboard',
      read: false,
      createdAt: new Date(),
    });

    return NextResponse.json(
      {
        message: 'User unbanned successfully',
        user: {
          id: existingUser._id.toString(),
          status: 'active',
          bannedAt: null,
          bannedReason: null,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('POST /api/admin/users/[id]/unban error:', error);
    
    // Handle auth-utils errors
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json(
        { error: 'Forbidden', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}