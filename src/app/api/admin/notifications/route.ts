import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/db/mongodb';
import { Notification, User } from '@/db/models';
import { requireRole } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Authenticate and verify admin role
    await requireRole(request, ['admin']);

    const { searchParams } = new URL(request.url);

    // Extract query parameters
    const userId = searchParams.get('userId');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const order = searchParams.get('order') || 'desc';
    
    // Handle "undefined" or "null" strings from frontend
    const cleanUserId = (userId === 'undefined' || userId === 'null') ? null : userId;
    const cleanType = (type === 'undefined' || type === 'null' || type === 'all') ? null : type;
    const cleanStatus = (status === 'undefined' || status === 'null' || status === 'all') ? null : status;

    // Pagination parameters
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // Validate status parameter
    if (cleanStatus && cleanStatus !== 'read' && cleanStatus !== 'unread') {
      return NextResponse.json(
        { 
          error: 'Invalid status parameter. Must be read or unread', 
          code: 'INVALID_STATUS' 
        },
        { status: 400 }
      );
    }

    // Build query
    const query: any = {};

      if (cleanUserId) {
        // Verify user exists - use findById since cleanUserId is the MongoDB _id
        const userExists = await User.findById(cleanUserId);
        if (!userExists) {
        return NextResponse.json(
          { 
            notifications: [], 
            total: 0,
            stats: {
              totalNotifications: 0,
              unreadCount: 0,
              readCount: 0,
              byType: {}
            }
          },
          { status: 200 }
        );
      }
      query.userId = cleanUserId;
    }

    if (cleanType) {
      query.type = cleanType;
    }

    if (cleanStatus) {
      query.read = cleanStatus === 'read';
    }

    // Fetch notifications
    const total = await Notification.countDocuments(query);
    const notifications = await Notification.find(query)
      .sort({ [sortBy]: order === 'asc' ? 1 : -1 })
      .skip(offset)
      .limit(limit)
      .lean();

    // Fetch user details for each notification
    const userIds = Array.from(new Set(notifications.map(n => n.userId).filter(id => id && mongoose.Types.ObjectId.isValid(id))));
    const users = await User.find({ _id: { $in: userIds } }).select('name email image storeName').lean();
    const userMap = new Map(users.map(u => [u._id.toString(), u]));

    const notificationsWithUsers = notifications.map(n => {
      const user = userMap.get(n.userId) || null;
      return {
        ...n,
        id: n._id.toString(),
        user,
        userName: user?.name || 'System',
        userEmail: user?.email || '',
      };
    });

    // Calculate statistics
    const statsQuery = cleanUserId ? { userId: cleanUserId } : {};

    const unreadCount = await Notification.countDocuments({ 
      ...statsQuery, 
      read: false 
    });

    const readCount = await Notification.countDocuments({ 
      ...statsQuery, 
      read: true 
    });

    // Get count by type
    const typeAggregation = await Notification.aggregate([
      { $match: statsQuery },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    const byType: Record<string, number> = {};
    typeAggregation.forEach(item => {
      byType[item._id] = item.count;
    });

    return NextResponse.json({
      notifications: notificationsWithUsers,
      total,
      stats: {
        totalNotifications: total,
        unreadCount,
        readCount,
        byType,
      },
    });

  } catch (error: any) {
    console.error('GET notifications error:', error);
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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

export async function PATCH(request: NextRequest) {
  try {
    await connectDB();
    await requireRole(request, ['admin']);

    const body = await request.json();
    const { notificationIds, markAllAsRead, userId } = body;

    const query: any = {};
    if (userId) query.userId = userId;

    if (markAllAsRead) {
      query.read = false;
    } else if (notificationIds && Array.isArray(notificationIds)) {
      query._id = { $in: notificationIds };
    } else {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    await Notification.updateMany(query, { $set: { read: true } });

    return NextResponse.json({ message: 'Notifications marked as read' });
  } catch (error: any) {
    console.error('PATCH notifications error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
