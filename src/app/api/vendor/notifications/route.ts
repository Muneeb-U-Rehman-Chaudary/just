import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/db/mongodb';
import { Notification } from '@/db/models';
import { requireAuth } from '@/lib/auth-utils';

// GET /api/vendor/notifications - Get vendor notifications
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Authenticate user
    const user = await requireAuth(request);
    
    if (user.role !== 'vendor') {
      return NextResponse.json({ error: 'Vendor access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    // Build query
    const query: any = { userId: user.id };
    if (unreadOnly) {
      query.read = false;
    }

    // Get notifications
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    // Get unread count
    const unreadCount = await Notification.countDocuments({ 
      userId: user.id, 
      read: false 
    });

    const formattedNotifications = notifications.map(notif => ({
      id: notif.notificationId,
      type: notif.type,
      message: notif.message,
      read: notif.read,
      link: notif.link || null,
      createdAt: notif.createdAt
    }));

    return NextResponse.json({
      notifications: formattedNotifications,
      unreadCount
    });
  } catch (error: any) {
    console.error('GET /api/vendor/notifications error:', error);
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/vendor/notifications - Mark notifications as read
export async function PATCH(request: NextRequest) {
  try {
    await connectDB();
    
    // Authenticate user
    const user = await requireAuth(request);
    
    if (user.role !== 'vendor') {
      return NextResponse.json({ error: 'Vendor access required' }, { status: 403 });
    }

    const body = await request.json();
    const { notificationIds, markAllAsRead } = body;

    if (markAllAsRead) {
      // Mark all user's notifications as read
      await Notification.updateMany(
        { userId: user.id, read: false },
        { $set: { read: true } }
      );
    } else if (notificationIds && Array.isArray(notificationIds)) {
      // Mark specific notifications as read
      await Notification.updateMany(
        { 
          userId: user.id, 
          notificationId: { $in: notificationIds },
          read: false 
        },
        { $set: { read: true } }
      );
    } else {
      return NextResponse.json(
        { error: 'Either notificationIds or markAllAsRead is required' },
        { status: 400 }
      );
    }

    return NextResponse.json({ 
      message: 'Notifications marked as read',
      success: true 
    });
  } catch (error: any) {
    console.error('PATCH /api/vendor/notifications error:', error);
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}