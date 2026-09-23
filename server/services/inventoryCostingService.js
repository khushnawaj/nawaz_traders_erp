import { prisma } from '@/lib/db/prisma';
import Decimal from 'decimal.js';

/**
 * Calculates Cost of Goods Sold (COGS) for a requested grain sale quantity using FIFO (First-In, First-Out)
 * 
 * @param {string} commodityId Commodity ID
 * @param {string} godownId Warehouse ID
 * @param {number} requestedKg Display or base weight in KG to fulfill
 * @returns {Promise<{totalCogs: number, costPerKg: number, batchesUsed: Array}>}
 */
export async function calculateFifoCogs(commodityId, godownId, requestedKg) {
  const reqKgDecimal = new Decimal(requestedKg || 0);

  // Fetch available purchase inflows ordered by earliest arrival date (FIFO)
  const purchaseItems = await prisma.purchaseItem.findMany({
    where: {
      commodityId,
      purchase: { godownId, status: 'POSTED' },
    },
    include: {
      purchase: { select: { date: true, purchaseNo: true } },
    },
    orderBy: { purchase: { date: 'asc' } },
  });

  let remainingToFulfill = reqKgDecimal;
  let totalCogs = new Decimal(0);
  const batchesUsed = [];

  for (const item of purchaseItems) {
    if (remainingToFulfill.lessThanOrEqualTo(0)) break;

    const netKg = new Decimal(item.netWeightKg || 0);
    const itemAmount = new Decimal(item.amount || 0);
    const costPerKg = netKg.greaterThan(0) ? itemAmount.dividedBy(netKg) : new Decimal(0);

    const allocatedKg = Decimal.min(remainingToFulfill, netKg);
    const batchCost = allocatedKg.times(costPerKg);

    totalCogs = totalCogs.plus(batchCost);
    remainingToFulfill = remainingToFulfill.minus(allocatedKg);

    batchesUsed.push({
      purchaseNo: item.purchase?.purchaseNo,
      date: item.purchase?.date,
      allocatedKg: allocatedKg.toNumber(),
      costPerKg: costPerKg.toNumber(),
      batchTotalCost: batchCost.toNumber(),
    });
  }

  const fulfilledKg = reqKgDecimal.minus(remainingToFulfill);
  const avgCostPerKg = fulfilledKg.greaterThan(0) ? totalCogs.dividedBy(fulfilledKg) : new Decimal(0);

  return {
    requestedKg: reqKgDecimal.toNumber(),
    fulfilledKg: fulfilledKg.toNumber(),
    unfulfilledKg: remainingToFulfill.toNumber(),
    totalCogs: totalCogs.toNumber(),
    avgCostPerKg: avgCostPerKg.toNumber(),
    batchesUsed,
  };
}
