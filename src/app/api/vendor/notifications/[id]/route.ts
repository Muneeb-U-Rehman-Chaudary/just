import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/db/mongodb';
import { Notification } from '@/db/models';
import { requireAuth } from '@/lib/auth-utils';

// GET /api/vendor/notifications/[id] - Get single notification
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const user = await requireAuth(request);
    
    if (user.role !== 'vendor') {
      return NextResponse.json({ error: 'Vendor access required' }, { status: 403 });
    }

    const { id } = await params;
    
    const notification = await Notification.findOne({ 
      notificationId: id,
      userId: user.id 
    }).lean();

    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: notification.notificationId,
      type: notification.type,
      message: notification.message,
      read: notification.read,
      link: notification.link || null,
      createdAt: notification.createdAt
    });
  } catch (error: any) {
    console.error('GET /api/vendor/notifications/[id] error:', error);
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/vendor/notifications/[id] - Mark notification as read
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const user = await requireAuth(request);
    
    if (user.role !== 'vendor') {
      return NextResponse.json({ error: 'Vendor access required' }, { status: 403 });
    }

    const { id } = await params;

    const notification = await Notification.findOneAndUpdate(
      { notificationId: id, userId: user.id },
      { $set: { read: true } },
      { new: true }
    ).lean();

    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Notification marked as read',
      notification: {
        id: notification.notificationId,
        type: notification.type,
        message: notification.message,
        read: notification.read,
        link: notification.link || null,
        createdAt: notification.createdAt
      }
    });
  } catch (error: any) {
    console.error('PUT /api/vendor/notifications/[id] error:', error);
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/vendor/notifications/[id] - Delete notification
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const user = await requireAuth(request);
    
    if (user.role !== 'vendor') {
      return NextResponse.json({ error: 'Vendor access required' }, { status: 403 });
    }

    const { id } = await params;

    const notification = await Notification.findOneAndDelete({
      notificationId: id,
      userId: user.id
    });

    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Notification deleted',
      success: true
    });
  } catch (error: any) {
    console.error('DELETE /api/vendor/notifications/[id] error:', error);
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
