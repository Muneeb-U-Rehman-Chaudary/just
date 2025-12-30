import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/db/mongodb';
import { User, Notification } from '@/db/models';
import { requireRole } from '@/lib/auth-utils';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const admin = await requireRole(request, ['admin']);
    const { id: userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { subject, message, type = 'warning' } = body;

    if (!subject || !message) {
      return NextResponse.json(
        { error: 'Subject and message are required' },
        { status: 400 }
      );
    }

    const notificationType = type === 'warning' ? 'admin_warning' : 'admin_message';
    const notification = new Notification({
      userId: userId,
      type: notificationType,
      message: `${subject}: ${message}`,
      read: false,
      link: '/notifications',
      data: {
        subject,
        message,
        type,
        fromAdmin: true,
        adminId: admin.id,
        sentAt: new Date()
      }
    });

    await notification.save();

    return NextResponse.json({
      success: true,
      message: 'Message sent to user successfully',
      notificationId: notification.notificationId
    });
  } catch (error: any) {
    console.error('Send user message error:', error);
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}