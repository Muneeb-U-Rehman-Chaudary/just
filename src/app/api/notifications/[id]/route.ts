import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/db/mongodb';
import { Notification } from '@/db/models';
import { getSession } from '@/lib/auth-utils';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const session = await getSession(request);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const notificationId = parseInt(id);
    if (isNaN(notificationId)) {
      return NextResponse.json(
        { error: 'Valid notification ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const notification = await Notification.findOne({
      notificationId: notificationId,
    });

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    if (notification.userId !== session.user.id) {
      return NextResponse.json(
        {
          error: 'You do not have permission to update this notification',
          code: 'FORBIDDEN',
        },
        { status: 403 }
      );
    }

    notification.read = true;
    await notification.save();

    const response = {
      notification: {
        id: notification.notificationId,
        type: notification.type,
        message: notification.message,
        link: notification.link,
        data: notification.data,
        read: notification.read,
        createdAt: notification.createdAt,
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('PATCH notification error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error as Error).message,
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const session = await getSession(request);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const notificationId = parseInt(id);
    if (isNaN(notificationId)) {
      return NextResponse.json(
        { error: 'Valid notification ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const notification = await Notification.findOne({
      notificationId: notificationId,
    });

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    if (notification.userId !== session.user.id) {
      return NextResponse.json(
        {
          error: 'You do not have permission to delete this notification',
          code: 'FORBIDDEN',
        },
        { status: 403 }
      );
    }

    await Notification.deleteOne({ notificationId: notificationId });

    return NextResponse.json(
      {
        success: true,
        message: 'Notification deleted',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE notification error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error as Error).message,
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}