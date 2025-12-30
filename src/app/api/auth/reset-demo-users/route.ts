import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/db/mongodb';
import { User } from '@/db/models';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Delete existing demo users
    await User.deleteMany({
      email: { $in: ['admin@digiverse.com', 'vendor@digiverse.com', 'customer@digiverse.com'] }
    });

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@digiverse.com',
      password: 'Admin@123',
      role: 'admin',
      emailVerified: true
    });

    // Create vendor user
    const vendor = await User.create({
      name: 'Vendor User',
      email: 'vendor@digiverse.com',
      password: 'Vendor@123',
      role: 'vendor',
      emailVerified: true,
      storeName: 'Premium Digital Store',
      storeDescription: 'High-quality digital products and templates',
      rating: 4.8,
      totalSales: 150,
      totalEarnings: 15000
    });

    // Create customer user
    const customer = await User.create({
      name: 'Customer User',
      email: 'customer@digiverse.com',
      password: 'Customer@123',
      role: 'customer',
      emailVerified: true
    });

    return NextResponse.json({
      success: true,
      message: 'Demo users reset successfully',
      users: [
        { email: admin.email, role: admin.role },
        { email: vendor.email, role: vendor.role },
        { email: customer.email, role: customer.role }
      ]
    });

  } catch (error: any) {
    console.error('Reset demo users error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
