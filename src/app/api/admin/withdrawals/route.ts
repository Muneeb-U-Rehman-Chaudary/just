import { NextRequest, NextResponse } from "next/server";
import connectDB from '@/db/mongodb';
import { Withdrawal, User } from '@/db/models';
import { requireRole } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Authenticate and verify admin role
    await requireRole(request, ['admin']);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build query
    const query: any = {};
    if (status) {
      query.status = status;
    }

    // Get all withdrawals
    const allWithdrawals = await Withdrawal.find(query)
      .sort({ requestDate: -1 })
      .limit(limit)
      .skip(offset)
      .lean();

    // Get vendor details for each withdrawal
    const withdrawalsWithVendors = await Promise.all(
      allWithdrawals.map(async (withdrawal) => {
        const vendor = await User.findById(withdrawal.vendorId)
          .select('_id name email storeName')
          .lean();
        
        return {
          id: withdrawal.withdrawalId,
          vendorId: withdrawal.vendorId,
          vendorName: vendor?.name || 'Unknown',
          vendorEmail: vendor?.email || 'Unknown',
          vendorStoreName: vendor?.storeName || null,
          amount: withdrawal.amount,
          status: withdrawal.status,
          requestDate: withdrawal.requestDate,
          processedDate: withdrawal.processedDate,
          bankDetails: withdrawal.bankDetails,
          notes: withdrawal.notes
        };
      })
    );

    // Calculate stats
    const allWithdrawalsForStats = await Withdrawal.find({}).lean();
    const stats = {
      total: allWithdrawalsForStats.length,
      pending: allWithdrawalsForStats.filter((w) => w.status === "pending").length,
      approved: allWithdrawalsForStats.filter((w) => w.status === "approved").length,
      completed: allWithdrawalsForStats.filter((w) => w.status === "completed").length,
      rejected: allWithdrawalsForStats.filter((w) => w.status === "rejected").length,
      totalAmount: allWithdrawalsForStats
        .filter((w) => w.status === "completed" || w.status === "approved")
        .reduce((sum, w) => sum + w.amount, 0),
    };

    return NextResponse.json({ withdrawals: withdrawalsWithVendors, stats });
  } catch (error: any) {
    console.error("Admin withdrawals fetch error:", error);
    
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