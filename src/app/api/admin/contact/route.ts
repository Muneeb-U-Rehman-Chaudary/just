import { NextRequest, NextResponse } from "next/server";
import connectDB from '@/db/mongodb';
import { ContactMessage } from '@/db/models';
import { requireRole } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Authenticate and verify admin role
    await requireRole(request, ['admin']);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build query
    const query: any = {};
    if (status) {
      query.status = status;
    }

    const messages = await ContactMessage.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .lean();

    const formattedMessages = messages.map(msg => ({
      id: msg.messageId,
      name: msg.name,
      email: msg.email,
      subject: msg.subject,
      message: msg.message,
      status: msg.status,
      createdAt: msg.createdAt,
      userId: msg.userId || null,
      reply: msg.reply || null,
      repliedAt: msg.repliedAt || null,
      repliedBy: msg.repliedBy || null
    }));

    // Calculate stats
    const allMessages = await ContactMessage.find({}).lean();
    const stats = {
      total: allMessages.length,
      pending: allMessages.filter((m) => m.status === "pending").length,
      resolved: allMessages.filter((m) => m.status === "resolved").length,
    };

    return NextResponse.json({ messages: formattedMessages, stats });
  } catch (error: any) {
    console.error("Contact messages fetch error:", error);
    
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