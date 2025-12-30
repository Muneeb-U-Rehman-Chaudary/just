import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function GET(request: NextRequest) {
  try {
    const payload = {
      userId: "admin_test_123",
      email: "admin@test.com",
      role: "admin"
    };

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: "7d"
    });

    return NextResponse.json({
      token,
      userId: payload.userId,
      role: payload.role
    }, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}