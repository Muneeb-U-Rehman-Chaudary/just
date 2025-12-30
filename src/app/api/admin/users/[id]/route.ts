import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/db/mongodb';
import { User, Product, Order } from '@/db/models';
import { requireRole } from '@/lib/auth-utils';

// GET - Get single user details with full information
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    // Verify admin role
    await requireRole(request, ['admin']);

    const userId = params.id;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required', code: 'MISSING_USER_ID' },
        { status: 400 }
      );
    }

    // Get user details
    const userRecord = await User.findOne({ _id: userId })
      .select('_id name email role image storeName storeDescription rating totalSales totalEarnings createdAt emailVerified bio updatedAt')
      .lean();

    if (!userRecord) {
      return NextResponse.json(
        { error: 'User not found', code: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Get products count if vendor
    let productsCount = 0;
    if (userRecord.role === 'vendor') {
      productsCount = await Product.countDocuments({ vendorId: userId });
    }

    // Get orders count if customer
    let ordersCount = 0;
    if (userRecord.role === 'customer') {
      ordersCount = await Order.countDocuments({ customerId: userId });
    }

    // Build response with status field
    const response = {
      user: {
        id: userRecord._id.toString(),
        name: userRecord.name,
        email: userRecord.email,
        role: userRecord.role,
        image: userRecord.image,
        storeName: userRecord.storeName,
        storeDescription: userRecord.storeDescription,
        rating: userRecord.rating,
        totalSales: userRecord.totalSales,
        totalEarnings: userRecord.totalEarnings,
        createdAt: userRecord.createdAt,
        emailVerified: userRecord.emailVerified,
        bio: userRecord.bio,
        updatedAt: userRecord.updatedAt,
        status: 'active', // Default status since it's not in schema
        productsCount,
        ordersCount,
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error('GET user error:', error);
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

// PUT - Update user information
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    // Verify admin role
    await requireRole(request, ['admin']);

    const userId = params.id;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required', code: 'MISSING_USER_ID' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await User.findOne({ _id: userId });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found', code: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, email, role, storeName, storeDescription, bio } = body;

    // Validate name if provided
    if (name !== undefined && name.trim().length < 2) {
      return NextResponse.json(
        {
          error: 'Name must be at least 2 characters',
          code: 'INVALID_NAME',
        },
        { status: 400 }
      );
    }

    // Validate email format if provided
    if (email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: 'Invalid email format', code: 'INVALID_EMAIL' },
          { status: 400 }
        );
      }

      // Check if email is already taken by another user
      const emailExists = await User.findOne({ 
        email: email.toLowerCase(),
        _id: { $ne: userId }
      });

      if (emailExists) {
        return NextResponse.json(
          { error: 'Email already in use', code: 'EMAIL_EXISTS' },
          { status: 400 }
        );
      }
    }

    // Validate role if provided
    if (role !== undefined) {
      const validRoles = ['customer', 'vendor', 'admin'];
      if (!validRoles.includes(role)) {
        return NextResponse.json(
          {
            error: 'Role must be one of: customer, vendor, admin',
            code: 'INVALID_ROLE',
          },
          { status: 400 }
        );
      }
    }

    // Update user fields
    if (name !== undefined) existingUser.name = name.trim();
    if (email !== undefined) existingUser.email = email.toLowerCase().trim();
    if (role !== undefined) existingUser.role = role;
    if (storeName !== undefined) existingUser.storeName = storeName.trim();
    if (storeDescription !== undefined) existingUser.storeDescription = storeDescription.trim();
    if (bio !== undefined) existingUser.bio = bio.trim();
    
    existingUser.updatedAt = new Date();
    await existingUser.save();

    return NextResponse.json({
      id: existingUser._id.toString(),
      name: existingUser.name,
      email: existingUser.email,
      role: existingUser.role,
      image: existingUser.image,
      storeName: existingUser.storeName,
      storeDescription: existingUser.storeDescription,
      rating: existingUser.rating,
      totalSales: existingUser.totalSales,
      totalEarnings: existingUser.totalEarnings,
      createdAt: existingUser.createdAt,
      emailVerified: existingUser.emailVerified,
      bio: existingUser.bio,
      updatedAt: existingUser.updatedAt,
    }, { status: 200 });
  } catch (error: any) {
    console.error('PUT user error:', error);
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete user account
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    // Verify admin role
    await requireRole(request, ['admin']);

    const userId = params.id;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required', code: 'MISSING_USER_ID' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await User.findOne({ _id: userId });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found', code: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Check if this is the last admin
    if (existingUser.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });

      if (adminCount <= 1) {
        return NextResponse.json(
          {
            error: 'Cannot delete the last admin account',
            code: 'LAST_ADMIN',
          },
          { status: 409 }
        );
      }
    }

    // Delete user (cascade will handle related records based on schema)
    await User.deleteOne({ _id: userId });

    return NextResponse.json(
      { message: 'User deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('DELETE user error:', error);
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}