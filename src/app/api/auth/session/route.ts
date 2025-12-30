import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/db/mongodb';
import { User, Session } from '@/db/models';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { user: null },
        { status: 200 }
      );
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return NextResponse.json(
          { user: null },
          { status: 200 }
        );
      }

      return NextResponse.json({
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
          storeName: user.storeName,
          storeDescription: user.storeDescription,
          bio: user.bio,
          bankDetails: user.bankDetails,
          emailVerified: user.emailVerified
        }
      });

    } catch (jwtError) {
      return NextResponse.json(
        { user: null },
        { status: 200 }
      );
    }

  } catch (error: any) {
    console.error('Session error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}