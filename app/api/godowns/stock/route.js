import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const godownId = searchParams.get('godownId');
    const commodityId = searchParams.get('commodityId');

    const where = {};
    if (godownId) where.godownId = godownId;
    if (commodityId) where.commodityId = commodityId;

    // Aggregate baseQuantityKg from StockMovement
    const stockAgg = await prisma.stockMovement.aggregate({
      where,
      _sum: {
        baseQuantityKg: true,
      },
    });

    const stockKg = parseFloat(stockAgg._sum.baseQuantityKg || 0);
    const stockQtl = stockKg / 100;
    const stockMT = stockKg / 1000;

    let godown = null;
    let commodity = null;

    if (godownId) {
      godown = await prisma.godown.findUnique({
        where: { id: godownId },
        select: { id: true, name: true, code: true },
      });
    }

    if (commodityId) {
      commodity = await prisma.commodity.findUnique({
        where: { id: commodityId },
        select: { id: true, name: true, localName: true, code: true },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        stockKg,
        stockQtl,
        stockMT,
        godown,
        commodity,
      },
    });
  } catch (error) {
    console.error('Error fetching stock:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to query live stock' },
      { status: 500 }
    );
  }
}
