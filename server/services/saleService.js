import { prisma } from '@/lib/db/prisma';
import Decimal from 'decimal.js';

/**
 * Generate Next Sale Number (e.g. SAL-2026-0001)
 */
async function generateSaleNo() {
  const count = await prisma.sale.count();
  const year = new Date().getFullYear();
  const nextNum = (count + 1).toString().padStart(4, '0');
  return `SAL-${year}-${nextNum}`;
}

/**
 * Create a new Grain Commercial Sale Transaction (to Customer / Rice Mill)
 */
export async function createSale(data) {
  const saleNo = await generateSaleNo();

  const partyId = data.partyId;
  if (!partyId) throw new Error('Customer / Rice Mill (Party) is required');

  const party = await prisma.party.findUnique({ where: { id: partyId } });
  if (!party) throw new Error('Selected Customer / Rice Mill not found');

  // Fetch or fallback Godown
  let godownId = data.godownId;
  if (!godownId) {
    const mainGodown = await prisma.godown.findFirst({ where: { status: 'ACTIVE' } });
    if (!mainGodown) throw new Error('No active Godown found');
    godownId = mainGodown.id;
  }

  // Fetch or fallback Commodity
  let commodityId = data.commodityId;
  if (!commodityId) {
    const defaultCommodity = await prisma.commodity.findFirst({ where: { status: 'ACTIVE' } });
    if (!defaultCommodity) throw new Error('No active Commodity found');
    commodityId = defaultCommodity.id;
  }

  // Fetch Unit
  let unitId = data.unitId;
  let unit = null;
  if (unitId) {
    unit = await prisma.unit.findUnique({ where: { id: unitId } });
  }
  if (!unit) {
    unit = await prisma.unit.findFirst({ where: { code: 'QTL' } }) || await prisma.unit.findFirst({ where: { isBaseUnit: true } });
  }

  // Calculate Weights & Financials
  const displayQty = new Decimal(data.quantity || 0);
  const ratePerUnit = new Decimal(data.rate || 0);
  const conversionFactor = new Decimal(unit?.baseConversionFactor || 100.0); // Default Quintal = 100 KG
  const baseWeightKg = displayQty.times(conversionFactor);

  const grossAmount = displayQty.times(ratePerUnit);
  const totalDeductions = new Decimal(data.totalDeductions || 0);

  // Net Sale Amount = Gross Amount - Deductions / Freight Discount
  const netAmount = grossAmount.minus(totalDeductions);

  const receivedAmount = new Decimal(data.receivedAmount || 0);
  const dueAmount = netAmount.minus(receivedAmount);

  let paymentStatus = 'UNPAID';
  if (dueAmount.lessThanOrEqualTo(0)) {
    paymentStatus = 'PAID';
  } else if (receivedAmount.greaterThan(0)) {
    paymentStatus = 'PARTIAL';
  }

  // Execute in DB Transaction
  const newSale = await prisma.$transaction(async (tx) => {
    // 1. Create Sale Entry
    const sale = await tx.sale.create({
      data: {
        saleNo,
        date: data.date ? new Date(data.date) : new Date(),
        partyId,
        godownId,
        vehicleId: data.vehicleId || null,
        driverId: data.driverId || null,
        grossAmount: grossAmount.toNumber(),
        totalDeductions: totalDeductions.toNumber(),
        netAmount: netAmount.toNumber(),
        receivedAmount: receivedAmount.toNumber(),
        dueAmount: dueAmount.toNumber(),
        paymentStatus,
        notes: data.notes || `Commercial Sale: ${displayQty.toString()} ${unit?.code || 'QTL'} @ ₹${ratePerUnit.toString()}/unit`,
      },
    });

    // 2. Create Sale Item
    await tx.saleItem.create({
      data: {
        saleId: sale.id,
        commodityId,
        unitId: unit.id,
        netWeightKg: baseWeightKg.toNumber(),
        displayQuantity: displayQty.toNumber(),
        ratePerUnit: ratePerUnit.toNumber(),
        amount: grossAmount.toNumber(),
      },
    });

    // 3. Update Customer Khaata Ledger (Debit Sale Amount -> Increases Receivable balance)
    const currentPartyLedger = await tx.partyLedger.findFirst({
      where: { partyId },
      orderBy: { createdAt: 'desc' },
    });

    const prevBal = new Decimal(currentPartyLedger ? currentPartyLedger.runningBalance : party.openingBalance || 0);
    const newBalAfterSale = prevBal.plus(netAmount);

    await tx.partyLedger.create({
      data: {
        partyId,
        voucherNo: saleNo,
        voucherType: 'SALE',
        debit: netAmount.toNumber(),
        credit: 0.0,
        runningBalance: newBalAfterSale.toNumber(),
        balanceType: 'RECEIVABLE',
        narration: `Grain Sale Invoice: ${displayQty.toString()} ${unit?.code || 'QTL'} (Ref: ${saleNo})`,
        referenceId: sale.id,
      },
    });

    // 4. Record Received Payment if Received Amount > 0
    if (receivedAmount.greaterThan(0)) {
      const payCount = await tx.payment.count();
      const payNo = `PAY-${new Date().getFullYear()}-${(payCount + 1).toString().padStart(4, '0')}`;

      const payment = await tx.payment.create({
        data: {
          paymentNo: payNo,
          date: data.date ? new Date(data.date) : new Date(),
          partyId,
          paymentType: 'PAYMENT_RECEIVED',
          paymentMode: data.paymentMode || 'CASH',
          amount: receivedAmount.toNumber(),
          accountName: 'Main Cash Account',
          notes: `Payment collected for Grain Sale ${saleNo}`,
        },
      });

      const newBalAfterReceipt = newBalAfterSale.minus(receivedAmount);

      await tx.partyLedger.create({
        data: {
          partyId,
          voucherNo: payNo,
          voucherType: 'PAYMENT_RECEIVED',
          debit: 0.0,
          credit: receivedAmount.toNumber(),
          runningBalance: newBalAfterReceipt.toNumber(),
          balanceType: newBalAfterReceipt.greaterThanOrEqualTo(0) ? 'RECEIVABLE' : 'PAYABLE',
          narration: `Payment Received for Sale ${saleNo}`,
          referenceId: payment.id,
        },
      });
    }

    // 5. Create Stock Movement Entry (Stock OUT from Godown - Negative Base KG)
    await tx.stockMovement.create({
      data: {
        commodityId,
        godownId,
        movementType: 'SALE_OUT',
        displayQuantity: displayQty.toNumber(),
        displayUnit: unit?.code || 'QTL',
        baseQuantityKg: baseWeightKg.negated().toNumber(), // Negative for OUT
        referenceNo: saleNo,
        saleId: sale.id,
      },
    });

    return sale;
  });

  return newSale;
}

/**
 * Get List of Sales with Filters
 */
export async function getSales({ partyId = '', godownId = '', paymentStatus = '', limit = 100 } = {}) {
  const where = {};
  if (partyId) where.partyId = partyId;
  if (godownId) where.godownId = godownId;
  if (paymentStatus) where.paymentStatus = paymentStatus;

  const sales = await prisma.sale.findMany({
    where,
    orderBy: { date: 'desc' },
    take: limit,
    include: {
      party: { select: { id: true, name: true, partyCode: true, phone: true } },
      godown: { select: { id: true, name: true, code: true } },
      vehicle: { select: { id: true, vehicleNumber: true } },
      driver: { select: { id: true, fullName: true } },
      items: {
        include: {
          commodity: { select: { id: true, name: true, localName: true } },
          unit: { select: { id: true, code: true, name: true } },
        },
      },
    },
  });

  return sales;
}
