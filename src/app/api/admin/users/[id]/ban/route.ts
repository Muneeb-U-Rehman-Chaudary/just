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
    const body = await request.json();
    const { reason } = body;

    // Validate reason if provided
    if (reason !== undefined && reason !== null) {
      if (typeof reason !== 'string' || reason.trim().length < 10) {
        return NextResponse.json(
          { 
            error: 'Ban reason must be at least 10 characters long',
            code: 'INVALID_REASON'
          },
          { status: 400 }
        );
      }
    }

    // Find user by ID
    const existingUser = await User.findOne({ _id: userId });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found', code: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Check if user is an admin (cannot ban admin users)
    if (existingUser.role === 'admin') {
      return NextResponse.json(
        { 
          error: 'Cannot ban admin users',
          code: 'CANNOT_BAN_ADMIN'
        },
        { status: 400 }
      );
    }

    // Check if user is already banned
    const bankDetailsObj = existingUser.bankDetails 
      ? JSON.parse(existingUser.bankDetails) 
      : {};
    
    if (bankDetailsObj.status === 'banned') {
      return NextResponse.json(
        { 
          error: 'User is already banned',
          code: 'ALREADY_BANNED'
        },
        { status: 400 }
      );
    }

    // Update user status to banned
    const bannedAt = new Date();
    const updatedBankDetails = {
      ...bankDetailsObj,
      status: 'banned',
      bannedAt: bannedAt.toISOString(),
      bannedReason: reason?.trim() || undefined
    };

    existingUser.bankDetails = JSON.stringify(updatedBankDetails);
    existingUser.updatedAt = bannedAt;
    await existingUser.save();

    // Generate unique notificationId
    const lastNotification = await Notification.findOne().sort({ notificationId: -1 });
    const notificationId = lastNotification ? lastNotification.notificationId + 1 : 1;

    // Create notification for the banned user
    const notificationMessage = reason 
      ? `Your account has been banned. Reason: ${reason.trim()}`
      : 'Your account has been banned.';

    await Notification.create({
      notificationId,
      userId: userId,
      type: 'account_banned',
      message: notificationMessage,
      link: null,
      read: false,
      createdAt: bannedAt
    });

    // Parse the bank details to return clean response
    const parsedBankDetails = JSON.parse(existingUser.bankDetails || '{}');

    return NextResponse.json(
      {
        message: 'User banned successfully',
        user: {
          id: existingUser._id.toString(),
          status: 'banned',
          bannedAt: parsedBankDetails.bannedAt,
          bannedReason: parsedBankDetails.bannedReason || null
        }
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('POST /api/admin/users/[id]/ban error:', error);

    // Handle authentication errors
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
      { 
        error: 'Internal server error: ' + error.message,
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}