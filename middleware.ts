import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function middleware(request: NextRequest) {
  // Only protect API routes with middleware
  // Page protection is handled client-side (can access localStorage)
  if (request.nextUrl.pathname.startsWith('/api')) {
    const token = request.cookies.get('bearer_token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');

    // Allow public API routes
    if (request.nextUrl.pathname.startsWith('/api/auth/login') ||
        request.nextUrl.pathname.startsWith('/api/auth/register') ||
        request.nextUrl.pathname.startsWith('/api/auth/session') ||
        request.nextUrl.pathname.startsWith('/api/products') ||
        request.nextUrl.pathname.startsWith('/api/vendors')) {
      return NextResponse.next();
    }

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      // Check role-based access for API routes
      const path = request.nextUrl.pathname;
      
      if (path.startsWith('/api/admin') && decoded.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      
      if (path.startsWith('/api/vendor') && decoded.role !== 'vendor' && decoded.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      
      return NextResponse.next();
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};