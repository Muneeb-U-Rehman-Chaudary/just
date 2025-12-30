import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/db/mongodb';
import { Withdrawal, User } from '@/db/models';
import { getSession } from '@/lib/auth-utils';

// GET /api/withdrawals - Get vendor's withdrawals
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { session } = await getSession(request);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const vendorWithdrawals = await Withdrawal.find({ vendorId: session.user.id })
      .sort({ requestDate: -1 })
      .lean();

    const formattedWithdrawals = vendorWithdrawals.map(withdrawal => ({
      ...withdrawal,
      id: withdrawal.withdrawalId
    }));

    return NextResponse.json({ withdrawals: formattedWithdrawals });
  } catch (error) {
    console.error('Error fetching withdrawals:', error);
    return NextResponse.json({ error: 'Failed to fetch withdrawals' }, { status: 500 });
  }
}

// POST /api/withdrawals - Request withdrawal
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { session } = await getSession(request);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await User.findById(session.user.id).lean();

    if (currentUser?.role !== 'vendor') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { amount, bankDetails: bodyBankDetails, accountDetails } = body;
    const bankDetails = bodyBankDetails || accountDetails;

    if (!amount || !bankDetails) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    if (amount > (currentUser.totalEarnings || 0)) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    const newWithdrawal = await Withdrawal.create({
      vendorId: session.user.id,
      amount,
      bankDetails,
      status: 'pending'
    });

    return NextResponse.json({ 
      withdrawal: { ...newWithdrawal.toObject(), id: newWithdrawal.withdrawalId }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating withdrawal:', error);
    return NextResponse.json({ error: 'Failed to create withdrawal' }, { status: 500 });
  }
}