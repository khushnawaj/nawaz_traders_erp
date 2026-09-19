import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(request, { params }) {
  try {
    const { id } = params;

    const sale = await prisma.sale.findUnique({
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

    if (!sale) {
      return NextResponse.json(
        { success: false, error: 'Sale record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: sale,
    });
  } catch (error) {
    console.error('Error fetching sale details:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch sale details' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    const sale = await prisma.sale.findUnique({ where: { id } });
    if (!sale) {
      return NextResponse.json(
        { success: false, error: 'Sale not found' },
        { status: 404 }
      );
    }

    // DB Transaction to revert stock and customer ledger
    await prisma.$transaction(async (tx) => {
      // 1. Delete associated stock movements
      await tx.stockMovement.deleteMany({ where: { saleId: id } });

      // 2. Delete associated party ledgers referencing this sale
      await tx.partyLedger.deleteMany({ where: { referenceId: id } });

      // 3. Delete sale items
      await tx.saleItem.deleteMany({ where: { saleId: id } });

      // 4. Delete sale record
      await tx.sale.delete({ where: { id } });
    });

    return NextResponse.json({
      success: true,
      message: 'Sale invoice deleted and stock reverted successfully',
    });
  } catch (error) {
    console.error('Error deleting sale:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete sale' },
      { status: 500 }
    );
  }
}
