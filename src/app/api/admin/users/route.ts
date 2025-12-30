import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/db/mongodb';
import { User } from '@/db/models';
import { requireRole } from '@/lib/auth-utils';

// GET /api/admin/users - List all users with filtering and search
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Authenticate and verify admin role
    await requireRole(request, ['admin']);

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    // Build query
    const query: any = {};
    if (role) {
      query.role = role;
    }

    // Get all users with query
    let usersQuery = User.find(query)
      .select('-password')
      .skip(offset)
      .limit(limit);

    // Apply search filter
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      usersQuery = usersQuery.or([
        { name: searchRegex },
        { email: searchRegex },
        { storeName: searchRegex }
      ]);
    }

    // Apply sorting
    const sortField = sortBy === 'name' ? 'name' :
                      sortBy === 'totalSales' ? 'totalSales' :
                      sortBy === 'totalEarnings' ? 'totalEarnings' :
                      'createdAt';
    const sortOrder = order === 'asc' ? 1 : -1;
    usersQuery = usersQuery.sort({ [sortField]: sortOrder });

    const users = await usersQuery.lean();

    // Format users for response
    const formattedUsers = users.map(u => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      role: u.role,
      image: u.image || null,
      storeName: u.storeName || null,
      rating: u.rating || 0,
      totalSales: u.totalSales || 0,
      totalEarnings: u.totalEarnings || 0,
      createdAt: u.createdAt,
      emailVerified: u.emailVerified || false,
      status: 'active'
    }));

    // Calculate stats
    const allUsers = await User.find({}).lean();
    const stats = {
      totalUsers: allUsers.length,
      customers: allUsers.filter(u => u.role === 'customer').length,
      vendors: allUsers.filter(u => u.role === 'vendor').length,
      admins: allUsers.filter(u => u.role === 'admin').length,
      active: allUsers.length,
      banned: 0
    };

    return NextResponse.json({ 
      users: formattedUsers,
      total: formattedUsers.length,
      stats
    });
  } catch (error: any) {
    console.error('GET users error:', error);
    
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