import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/db/mongodb';
import { Withdrawal, User } from '@/db/models';
import { requireRole } from '@/lib/auth-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    // Authentication and authorization
    await requireRole(request, ['admin']);

    const withdrawalId = parseInt(params.id);

    // Validate withdrawal ID format
    if (isNaN(withdrawalId)) {
      return NextResponse.json(
        { error: 'Valid withdrawal ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Find withdrawal by ID
    const withdrawal = await Withdrawal.findOne({ withdrawalId }).lean();

    if (!withdrawal) {
      return NextResponse.json(
        { error: 'Withdrawal not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Get vendor details using string ID
    const vendor = await User.findOne({ _id: withdrawal.vendorId })
      .select('_id name email storeName totalEarnings')
      .lean();

    if (!vendor) {
      return NextResponse.json(
        { error: 'Vendor not found', code: 'VENDOR_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Format response
    const response = {
      withdrawal: {
        id: withdrawal.withdrawalId,
        vendorId: withdrawal.vendorId,
        vendor: {
          id: vendor._id.toString(),
          name: vendor.name,
          email: vendor.email,
          storeName: vendor.storeName,
          totalEarnings: vendor.totalEarnings ?? 0,
        },
        amount: withdrawal.amount,
        status: withdrawal.status,
        requestDate: withdrawal.requestDate,
        processedDate: withdrawal.processedDate,
        bankDetails: withdrawal.bankDetails,
        notes: withdrawal.notes,
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error('GET withdrawal details error:', error);
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(
      {
        error: 'Internal server error: ' + error.message,
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}