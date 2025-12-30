import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/db/mongodb';
import { Notification } from '@/db/models';
import { getSession } from '@/lib/auth-utils';

// GET /api/notifications - Get user's notifications
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { session } = await getSession(request);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const read = searchParams.get('read');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    const query: any = { userId: session.user.id };
    if (read !== null) {
      query.read = read === 'true';
    }

    const userNotifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .lean();

    const unreadCount = await Notification.countDocuments({
      userId: session.user.id,
      read: false
    });

    const formattedNotifications = userNotifications.map(notif => ({
      id: notif.notificationId,
      type: notif.type,
      message: notif.message,
      link: notif.link,
      data: notif.data,
      read: notif.read,
      createdAt: notif.createdAt
    }));

    return NextResponse.json({ 
      notifications: formattedNotifications,
      unreadCount
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

// POST /api/notifications - Create notification (internal/admin only)
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { session } = await getSession(request);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admin or internal system can create notifications
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { userId, type, message, link, data } = body;

    if (!userId || !type || !message) {
      return NextResponse.json(
        { error: 'userId, type, and message are required' },
        { status: 400 }
      );
    }

    // Generate unique notificationId
    const lastNotification = await Notification.findOne().sort({ notificationId: -1 });
    const notificationId = lastNotification ? lastNotification.notificationId + 1 : 1;

    const newNotification = await Notification.create({
      notificationId,
      userId,
      type,
      message,
      link: link || null,
      data: data || null,
      read: false,
      createdAt: new Date()
    });

    return NextResponse.json({
      notification: {
        id: newNotification.notificationId,
        userId: newNotification.userId,
        type: newNotification.type,
        message: newNotification.message,
        link: newNotification.link,
        data: newNotification.data,
        read: newNotification.read,
        createdAt: newNotification.createdAt
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
  }
}

// PUT /api/notifications - Mark notifications as read
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    const { session } = await getSession(request);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { notificationIds, markAllAsRead } = body;

    const query: any = { userId: session.user.id };
    
    if (markAllAsRead) {
      query.read = false;
    } else if (notificationIds && Array.isArray(notificationIds)) {
      query.notificationId = { $in: notificationIds };
    } else {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Mark notifications as read
    await Notification.updateMany(query, { read: true });

    const unreadCount = await Notification.countDocuments({
      userId: session.user.id,
      read: false
    });

    return NextResponse.json({ message: 'Notifications marked as read', unreadCount });
  } catch (error) {
    console.error('Error updating notifications:', error);
    return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 });
  }
}