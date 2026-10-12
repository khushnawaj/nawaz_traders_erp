import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifySessionToken } from '@/lib/auth/session';

export async function POST(request) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    const session = token ? await verifySessionToken(token) : null;

    if (!session || session.role !== 'OWNER') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Only the System Owner can perform this action.' },
        { status: 403 }
      );
    }

    // Perform atomic cleanup of sample demo records
    await prisma.$transaction(async (tx) => {
      // 1. Delete all demo transactions & stock movements
      await tx.stockMovement.deleteMany({});
      await tx.purchaseItem.deleteMany({});
      await tx.purchase.deleteMany({});
      await tx.saleItem.deleteMany({});
      await tx.sale.deleteMany({});
      await tx.payment.deleteMany({});
      await tx.partyLedger.deleteMany({});
      await tx.employeeLedger.deleteMany({});
      await tx.attendance.deleteMany({});
      await tx.trip.deleteMany({});
      await tx.fuelExpense.deleteMany({});
      await tx.vehicleExpense.deleteMany({});
      await tx.advanceRequest.deleteMany({});
      await tx.investorTransaction.deleteMany({});
      await tx.investor.deleteMany({});
      await tx.kiranaSaleItem.deleteMany({});
      await tx.kiranaSale.deleteMany({});
      await tx.kiranaPurchaseItem.deleteMany({});
      await tx.kiranaPurchase.deleteMany({});

      // 2. Delete demo parties (Farmers, Mills, Vendors)
      await tx.party.deleteMany({});

      // 3. Delete demo staff users (keep only OWNER and ADMIN)
      await tx.user.deleteMany({
        where: {
          role: { notIn: ['OWNER', 'ADMIN'] },
        },
      });

      // 4. Delete demo employees
      await tx.employee.deleteMany({});

      // 5. Delete demo vehicles
      await tx.vehicle.deleteMany({});
    });

    return NextResponse.json({
      success: true,
      message: 'Demo data cleaned successfully! Master commodities, units, and Owner login are preserved.',
    });
  } catch (error) {
    console.error('Error cleaning demo data:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to clean demo data' },
      { status: 500 }
    );
  }
}
