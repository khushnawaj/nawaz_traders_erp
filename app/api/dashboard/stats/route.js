import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getPartySummaryStats } from '@/server/services/partyService';

export async function GET(req) {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // 1. Today's Purchases
    const todayPurchases = await prisma.purchase.aggregate({
      where: {
        date: { gte: todayStart, lte: todayEnd },
      },
      _sum: {
        netAmount: true,
      },
      _count: { id: true },
    });

    const todayPurchaseItems = await prisma.purchaseItem.aggregate({
      where: {
        purchase: {
          date: { gte: todayStart, lte: todayEnd },
        },
      },
      _sum: {
        displayQuantity: true,
      },
    });

    // 2. Today's Sales
    const todaySales = await prisma.sale.aggregate({
      where: {
        date: { gte: todayStart, lte: todayEnd },
      },
      _sum: {
        netAmount: true,
      },
      _count: { id: true },
    });

    const todaySaleItems = await prisma.saleItem.aggregate({
      where: {
        sale: {
          date: { gte: todayStart, lte: todayEnd },
        },
      },
      _sum: {
        displayQuantity: true,
      },
    });

    // 3. Receivables & Payables from Party stats service
    const partyStats = await getPartySummaryStats();

    // 4. Pending Salary Advances
    const pendingAdvances = await prisma.advanceRequest.count({
      where: { status: 'PENDING' },
    });

    // 5. Asset counts
    const warehouseCount = await prisma.godown.count();
    const vehicleCount = await prisma.vehicle.count();
    const staffCount = await prisma.employee.count();

    return NextResponse.json({
      success: true,
      stats: {
        purchasesTodayAmount: parseFloat(todayPurchases._sum.netAmount || 0),
        purchasesTodayQuintal: parseFloat(todayPurchaseItems._sum.displayQuantity || 0),
        purchasesTodayCount: todayPurchases._count.id || 0,
        salesTodayAmount: parseFloat(todaySales._sum.netAmount || 0),
        salesTodayQuintal: parseFloat(todaySaleItems._sum.displayQuantity || 0),
        salesTodayCount: todaySales._count.id || 0,
        totalReceivables: parseFloat(partyStats.totalReceivables || 0),
        totalPayables: parseFloat(partyStats.totalPayables || 0),
        pendingAdvances,
        warehouseCount,
        vehicleCount,
        staffCount,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to compute dashboard metrics' },
      { status: 500 }
    );
  }
}
