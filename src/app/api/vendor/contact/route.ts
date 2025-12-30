import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/db/mongodb';
import { ContactMessage } from '@/db/models';
import { getCurrentUser } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const user = await getCurrentUser(request);
    if (!user || user.role !== 'vendor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const messages = await ContactMessage.find({ userId: user.id }).sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      messages: messages.map(m => ({
        ...m,
        id: m._id.toString(),
      })),
    });
  } catch (error: any) {
    console.error('GET vendor contact error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const user = await getCurrentUser(request);
    if (!user || user.role !== 'vendor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { subject, message, type } = body;

    if (!subject || !message) {
      return NextResponse.json({ error: 'Subject and message are required' }, { status: 400 });
    }

    const newMessage = new ContactMessage({
      name: user.name,
      email: user.email,
      subject,
      message,
      type: type || 'support',
      status: 'pending',
      userId: user.id,
      createdAt: new Date(),
    });

    await newMessage.save();

    return NextResponse.json({ message: 'Message sent successfully', contact: newMessage });
  } catch (error: any) {
    console.error('POST vendor contact error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
