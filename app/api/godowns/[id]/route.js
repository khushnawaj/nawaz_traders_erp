import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(request, { params }) {
  try {
    const { id } = params;

    const godown = await prisma.godown.findUnique({
      where: { id },
      include: {
        stockMovements: {
          orderBy: { date: 'desc' },
          take: 100,
          include: {
            commodity: { select: { id: true, name: true, localName: true } },
            purchase: {
              select: {
                purchaseNo: true,
                party: { select: { name: true } },
              },
            },
            sale: {
              select: {
                saleNo: true,
                party: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    if (!godown) {
      return NextResponse.json(
        { success: false, error: 'Godown not found' },
        { status: 404 }
      );
    }

    // Calculate stock breakdown
    const stockByCommodity = {};
    let totalStockKg = 0;

    godown.stockMovements.forEach((m) => {
      const cmdName = m.commodity?.localName || m.commodity?.name || 'Unknown Grain';
      const kg = parseFloat(m.baseQuantityKg) || 0;

      if (!stockByCommodity[cmdName]) {
        stockByCommodity[cmdName] = 0;
      }
      stockByCommodity[cmdName] += kg;
      totalStockKg += kg;
    });

    const stockBreakdown = Object.entries(stockByCommodity).map(([name, kg]) => ({
      commodityName: name,
      stockKg: kg,
      stockQtl: kg / 100,
      stockMT: kg / 1000,
    }));

    return NextResponse.json({
      success: true,
      data: {
        ...godown,
        capacity: godown.capacity ? parseFloat(godown.capacity) : 0,
        totalStockKg,
        totalStockQtl: totalStockKg / 100,
        totalStockMT: totalStockKg / 1000,
        stockBreakdown,
      },
    });
  } catch (error) {
    console.error('Error fetching godown details:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch godown details' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();

    const godown = await prisma.godown.update({
      where: { id },
      data: {
        name: body.name,
        location: body.location,
        capacity: body.capacity ? parseFloat(body.capacity) : 0,
        supervisor: body.supervisor,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Godown updated successfully',
      data: godown,
    });
  } catch (error) {
    console.error('Error updating godown:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update godown' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    // Check if stock movements exist
    const movementCount = await prisma.stockMovement.count({
      where: { godownId: id },
    });

    if (movementCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot delete godown. It contains ${movementCount} historical stock records.`,
        },
        { status: 400 }
      );
    }

    await prisma.godown.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: 'Godown deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting godown:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete godown' },
      { status: 500 }
    );
  }
}
