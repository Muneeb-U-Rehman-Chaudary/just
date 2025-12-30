import { NextRequest, NextResponse } from "next/server";
import connectDB from '@/db/mongodb';
import { ContactMessage } from '@/db/models';
import { requireRole } from '@/lib/auth-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    // Authenticate and verify admin role
    await requireRole(request, ['admin']);

    const { id } = await params;
    const messageId = parseInt(id);

    if (isNaN(messageId)) {
      return NextResponse.json(
        { error: "Valid message ID is required" },
        { status: 400 }
      );
    }

    const message = await ContactMessage.findOne({ messageId }).lean();

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: {
        id: message.messageId,
        name: message.name,
        email: message.email,
        subject: message.subject,
        message: message.message,
        type: message.type,
        status: message.status,
        userId: message.userId || null,
        reply: message.reply || null,
        repliedAt: message.repliedAt || null,
        repliedBy: message.repliedBy || null,
        createdAt: message.createdAt
      }
    });
  } catch (error: any) {
    console.error("Contact message fetch error:", error);
    
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    // Authenticate and verify admin role
    const user = await requireRole(request, ['admin']);

    const { id } = await params;
    const messageId = parseInt(id);
    const body = await request.json();
    const { status, reply } = body;

    if (isNaN(messageId)) {
      return NextResponse.json(
        { error: "Valid message ID is required" },
        { status: 400 }
      );
    }

    const message = await ContactMessage.findOne({ messageId });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Update message
    if (status) {
      message.status = status;
    }
    
    if (reply) {
      message.reply = reply;
      message.repliedAt = new Date();
      message.repliedBy = user.id;
      message.status = 'resolved';
    }

    await message.save();

    return NextResponse.json({
      message: "Reply sent successfully",
      contactMessage: {
        id: message.messageId,
        status: message.status,
        reply: message.reply,
        repliedAt: message.repliedAt
      }
    });
  } catch (error: any) {
    console.error("Contact reply error:", error);
    
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    // Authenticate and verify admin role
    await requireRole(request, ['admin']);

    const { id } = await params;
    const messageId = parseInt(id);

    if (isNaN(messageId)) {
      return NextResponse.json(
        { error: "Valid message ID is required" },
        { status: 400 }
      );
    }

    const message = await ContactMessage.findOne({ messageId });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    await ContactMessage.deleteOne({ messageId });

    return NextResponse.json({ message: "Contact message deleted successfully" });
  } catch (error: any) {
    console.error("Contact delete error:", error);
    
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