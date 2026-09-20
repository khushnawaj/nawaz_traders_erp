import { prisma } from '@/lib/db/prisma';
import Decimal from 'decimal.js';
import { getNextVoucherNumber } from '@/server/services/sequenceService';

/**
 * Create a new Crop Purchase Transaction from a Farmer
 */
export async function createPurchase(data) {
  const partyId = data.partyId;
  if (!partyId) throw new Error('Farmer (Party) is required');

  const party = await prisma.party.findUnique({ where: { id: partyId } });
  if (!party) throw new Error('Selected Farmer not found');

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

  const labourCharges = new Decimal(data.labourCharges || 0);
  
  // Mandi Tax / GST calculation (default 1.5% Mandi Tax if mandiTaxPercent provided, else use gstAmount directly)
  let gstAmount = new Decimal(data.gstAmount || 0);
  if (data.mandiTaxPercent && parseFloat(data.mandiTaxPercent) > 0) {
    const taxRate = new Decimal(data.mandiTaxPercent).dividedBy(100);
    gstAmount = grossAmount.times(taxRate);
  }

  const otherExpenses = new Decimal(data.otherExpenses || 0);
  const totalDeductions = new Decimal(data.totalDeductions || 0);

  // Net Amount = Gross Crop Value + Labour + Mandi Tax/GST + Other Expenses - Deductions
  const totalCharges = labourCharges.plus(gstAmount).plus(otherExpenses);
  const netAmount = grossAmount.plus(totalCharges).minus(totalDeductions);

  const advancePaid = new Decimal(data.advancePaid || 0);
  const dueAmount = netAmount.minus(advancePaid);

  let paymentStatus = 'UNPAID';
  if (dueAmount.lessThanOrEqualTo(0)) {
    paymentStatus = 'PAID';
  } else if (advancePaid.greaterThan(0)) {
    paymentStatus = 'PARTIAL';
  }

  const promisedDate = data.promisedDate ? new Date(data.promisedDate) : null;

  // Execute in DB Transaction
  const newPurchase = await prisma.$transaction(async (tx) => {
    // Generate atomic sequence voucher number inside transaction
    const purchaseNo = await getNextVoucherNumber(tx, 'PUR', 'purchase', 'purchaseNo');

    // 1. Create Purchase Entry
    const purchase = await tx.purchase.create({
      data: {
        purchaseNo,
        date: data.date ? new Date(data.date) : new Date(),
        partyId,
        godownId,
        grossAmount: grossAmount.toNumber(),
        labourCharges: labourCharges.toNumber(),
        gstAmount: gstAmount.toNumber(),
        otherExpenses: otherExpenses.toNumber(),
        totalDeductions: totalDeductions.toNumber(),
        netAmount: netAmount.toNumber(),
        paidAmount: advancePaid.toNumber(),
        dueAmount: dueAmount.toNumber(),
        promisedDate,
        paymentStatus,
        parchiUrl: data.parchiUrl || null,
        notes: data.notes || `Crop purchase: ${displayQty.toString()} ${unit?.code || 'QTL'} @ ₹${ratePerUnit.toString()}/unit`,
      },
    });

    // 2. Create Purchase Item
    await tx.purchaseItem.create({
      data: {
        purchaseId: purchase.id,
        commodityId,
        unitId: unit.id,
        netWeightKg: baseWeightKg.toNumber(),
        displayQuantity: displayQty.toNumber(),
        ratePerUnit: ratePerUnit.toNumber(),
        amount: grossAmount.toNumber(),
      },
    });

    // 3. Update Farmer Khaata Ledger (Credit Purchase Amount)
    const currentPartyLedger = await tx.partyLedger.findFirst({
      where: { partyId },
      orderBy: { createdAt: 'desc' },
    });

    const prevBal = new Decimal(currentPartyLedger ? currentPartyLedger.runningBalance : party.openingBalance || 0);
    // Purchases increase Payable amount to Farmer
    const newBalAfterPurchase = prevBal.plus(netAmount);

    await tx.partyLedger.create({
      data: {
        partyId,
        voucherNo: purchaseNo,
        voucherType: 'PURCHASE',
        debit: 0.0,
        credit: netAmount.toNumber(),
        runningBalance: newBalAfterPurchase.toNumber(),
        balanceType: 'PAYABLE',
        narration: `Crop Purchase: ${displayQty.toString()} ${unit?.code || 'QTL'} (Ref: ${purchaseNo})`,
        referenceId: purchase.id,
      },
    });

    // 4. Record Advance Payment if Advance Paid > 0
    if (advancePaid.greaterThan(0)) {
      const payNo = await getNextVoucherNumber(tx, 'PAY', 'payment', 'paymentNo');

      const payment = await tx.payment.create({
        data: {
          paymentNo: payNo,
          date: data.date ? new Date(data.date) : new Date(),
          partyId,
          paymentType: 'PAYMENT_MADE',
          paymentMode: data.paymentMode || 'CASH',
          amount: advancePaid.toNumber(),
          accountName: 'Main Cash Account',
          notes: `Advance paid for Crop Purchase ${purchaseNo}`,
        },
      });

      const newBalAfterAdvance = newBalAfterPurchase.minus(advancePaid);

      await tx.partyLedger.create({
        data: {
          partyId,
          voucherNo: payNo,
          voucherType: 'PAYMENT_MADE',
          debit: advancePaid.toNumber(),
          credit: 0.0,
          runningBalance: newBalAfterAdvance.toNumber(),
          balanceType: newBalAfterAdvance.greaterThanOrEqualTo(0) ? 'PAYABLE' : 'RECEIVABLE',
          narration: `Advance Payment for ${purchaseNo}`,
          referenceId: payment.id,
        },
      });
    }

    // 5. Create Stock Movement Entry (Stock IN to Godown)
    await tx.stockMovement.create({
      data: {
        commodityId,
        godownId,
        movementType: 'PURCHASE_IN',
        displayQuantity: displayQty.toNumber(),
        displayUnit: unit?.code || 'QTL',
        baseQuantityKg: baseWeightKg.toNumber(),
        referenceNo: purchaseNo,
        purchaseId: purchase.id,
      },
    });

    return purchase;
  });

  return newPurchase;
}

/**
 * Get List of Purchases with Enhanced Filters
 */
export async function getPurchases({ partyId = '', godownId = '', paymentStatus = '', limit = 100 } = {}) {
  const where = {};
  if (partyId) where.partyId = partyId;
  if (godownId) where.godownId = godownId;
  if (paymentStatus) where.paymentStatus = paymentStatus;

  const purchases = await prisma.purchase.findMany({
    where,
    orderBy: { date: 'desc' },
    take: limit,
    include: {
      party: { select: { id: true, name: true, partyCode: true, phone: true } },
      godown: { select: { id: true, name: true, code: true } },
      items: {
        include: {
          commodity: { select: { id: true, name: true, localName: true } },
          unit: { select: { id: true, code: true, name: true } },
        },
      },
    },
  });

  return purchases;
}

/**
 * Soft Cancel Purchase Transaction & Post Reversing Ledger Entry
 */
export async function cancelPurchase(purchaseId) {
  return await prisma.$transaction(async (tx) => {
    const purchase = await tx.purchase.findUnique({
      where: { id: purchaseId },
      include: { items: true },
    });

    if (!purchase) throw new Error('Purchase record not found');
    if (purchase.status === 'CANCELLED') throw new Error('Purchase is already cancelled');

    // 1. Update purchase status
    await tx.purchase.update({
      where: { id: purchaseId },
      data: { status: 'CANCELLED' },
    });

    // 2. Reverse stock movement (Outflow of canceled purchase stock)
    for (const item of purchase.items) {
      await tx.stockMovement.create({
        data: {
          commodityId: item.commodityId,
          godownId: purchase.godownId,
          movementType: 'ADJUSTMENT_OUT',
          displayQuantity: item.displayQuantity,
          displayUnit: 'QTL',
          baseQuantityKg: new Decimal(item.netWeightKg).negated().toNumber(),
          referenceNo: `CANCEL-${purchase.purchaseNo}`,
          purchaseId: purchase.id,
        },
      });
    }

    // 3. Post reversing entry in PartyLedger (Debit to reduce Farmer Payable)
    const currentPartyLedger = await tx.partyLedger.findFirst({
      where: { partyId: purchase.partyId },
      orderBy: { createdAt: 'desc' },
    });

    const prevBal = new Decimal(currentPartyLedger ? currentPartyLedger.runningBalance : 0);
    const cancelAmt = new Decimal(purchase.netAmount);
    const newBal = prevBal.minus(cancelAmt);

    await tx.partyLedger.create({
      data: {
        partyId: purchase.partyId,
        voucherNo: `CNL-${purchase.purchaseNo}`,
        voucherType: 'PURCHASE_CANCELLED',
        debit: cancelAmt.toNumber(),
        credit: 0.0,
        runningBalance: newBal.toNumber(),
        balanceType: newBal.greaterThanOrEqualTo(0) ? 'PAYABLE' : 'RECEIVABLE',
        narration: `Reversal of Canceled Purchase Voucher ${purchase.purchaseNo}`,
        referenceId: purchase.id,
        status: 'POSTED',
      },
    });

    return { success: true, message: `Purchase ${purchase.purchaseNo} successfully cancelled.` };
  });
}
