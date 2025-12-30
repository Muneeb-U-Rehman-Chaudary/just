import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/db/mongodb';
import { ContactMessage } from '@/db/models';

// Email validation helper
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { name, email, subject, message, userId } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { 
          error: "Name is required",
          code: "MISSING_NAME" 
        },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { 
          error: "Email is required",
          code: "MISSING_EMAIL" 
        },
        { status: 400 }
      );
    }

    if (!subject) {
      return NextResponse.json(
        { 
          error: "Subject is required",
          code: "MISSING_SUBJECT" 
        },
        { status: 400 }
      );
    }

    if (!message) {
      return NextResponse.json(
        { 
          error: "Message is required",
          code: "MISSING_MESSAGE" 
        },
        { status: 400 }
      );
    }

    // Validate field lengths and formats
    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      return NextResponse.json(
        { 
          error: "Name must be at least 2 characters",
          code: "NAME_TOO_SHORT" 
        },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();
    if (!isValidEmail(trimmedEmail)) {
      return NextResponse.json(
        { 
          error: "Invalid email format",
          code: "INVALID_EMAIL" 
        },
        { status: 400 }
      );
    }

    const trimmedSubject = subject.trim();
    if (trimmedSubject.length < 5) {
      return NextResponse.json(
        { 
          error: "Subject must be at least 5 characters",
          code: "SUBJECT_TOO_SHORT" 
        },
        { status: 400 }
      );
    }

    const trimmedMessage = message.trim();
    if (trimmedMessage.length < 10) {
      return NextResponse.json(
        { 
          error: "Message must be at least 10 characters",
          code: "MESSAGE_TOO_SHORT" 
        },
        { status: 400 }
      );
    }

    // Generate unique messageId
    const lastMessage = await ContactMessage.findOne().sort({ messageId: -1 });
    const messageId = lastMessage ? lastMessage.messageId + 1 : 1;

    // Create contact message
    const newMessage = await ContactMessage.create({
      messageId,
      name: trimmedName,
      email: trimmedEmail,
      subject: trimmedSubject,
      message: trimmedMessage,
      userId: userId ? userId.trim() : null,
      status: "pending",
      createdAt: new Date()
    });

    return NextResponse.json(
      {
        message: {
          id: newMessage.messageId,
          name: newMessage.name,
          email: newMessage.email,
          subject: newMessage.subject,
          message: newMessage.message,
          status: newMessage.status,
          createdAt: newMessage.createdAt
        }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('POST contact message error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}