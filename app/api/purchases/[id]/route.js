import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(request, { params }) {
  try {
    const { id } = params;

    const purchase = await prisma.purchase.findUnique({
      where: { id },
      include: {
        party: true,
        godown: true,
        vehicle: true,
        driver: true,
        items: {
          include: {
            commodity: true,
            unit: true,
          },
        },
      },
    });

    if (!purchase) {
      return NextResponse.json(
        { success: false, error: 'Purchase record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: purchase,
    });
  } catch (error) {
    console.error('Error fetching purchase details:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch purchase details' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    const purchase = await prisma.purchase.findUnique({ where: { id } });
    if (!purchase) {
      return NextResponse.json(
        { success: false, error: 'Purchase not found' },
        { status: 404 }
      );
    }

    // Transaction to remove purchase, stock movements, and ledger references
    await prisma.$transaction(async (tx) => {
      // 1. Delete associated stock movements
      await tx.stockMovement.deleteMany({ where: { purchaseId: id } });

      // 2. Delete associated party ledgers referencing this purchase
      await tx.partyLedger.deleteMany({ where: { referenceId: id } });

      // 3. Delete purchase items
      await tx.purchaseItem.deleteMany({ where: { purchaseId: id } });

      // 4. Delete purchase record
      await tx.purchase.delete({ where: { id } });
    });

    return NextResponse.json({
      success: true,
      message: 'Purchase voucher deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting purchase:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete purchase' },
      { status: 500 }
    );
  }
}
