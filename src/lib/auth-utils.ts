import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/db/mongodb';
import { User } from '@/db/models';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export async function getCurrentUser(request: NextRequest) {
  try {
    let token: string | null = null;
    
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    
    if (!token) {
      token = request.cookies.get('auth_token')?.value || null;
    }
    
    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    
    await connectDB();
    const user = await User.findById(decoded.userId).lean();
    
    if (!user) {
      return null;
    }

    return {
      id: (user._id as any).toString(),
      email: user.email as string,
      name: user.name as string,
      role: user.role as string,
      image: user.image as string | undefined,
      storeName: user.storeName as string | undefined,
      emailVerified: user.emailVerified as boolean | undefined
    };
  } catch {
    return null;
  }
}

export async function getSession(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { session: null };
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    
    await connectDB();
    const user = await User.findById(decoded.userId).lean();
    
    if (!user) {
      return { session: null };
    }

    return {
      session: {
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
          storeName: user.storeName,
          emailVerified: user.emailVerified
        }
      }
    };
  } catch (error) {
    return { session: null };
  }
}

export async function requireAuth(request: NextRequest) {
  const { session } = await getSession(request);
  
  if (!session?.user) {
    throw new Error('Unauthorized');
  }
  
  return session.user;
}

export async function requireRole(request: NextRequest, allowedRoles: string[]) {
  try {
    const user = await requireAuth(request);
    
    if (!allowedRoles.includes(user.role)) {
      throw new Error('Forbidden');
    }
    
    return user;
  } catch (error: any) {
    // If user not found in DB but token is valid, check JWT payload directly
    if (error.message === 'Unauthorized') {
      let token: string | null = null;
      const authHeader = request.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
      if (!token) {
        token = request.cookies.get('auth_token')?.value || null;
      }
      if (token) {
        try {
          const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
          if (decoded.role && allowedRoles.includes(decoded.role)) {
            return {
              id: decoded.userId,
              email: decoded.email,
              name: 'Admin',
              role: decoded.role
            };
          }
        } catch {}
      }
    }
    throw error;
  }
}