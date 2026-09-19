import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import Decimal from 'decimal.js';

export async function POST(request) {
  try {
    const body = await request.json();
    const { partyId, amount, paymentType, paymentMode, accountName, referenceNo, notes, date } = body;

    if (!partyId || !amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Party ID and valid amount are required' },
        { status: 400 }
      );
    }

    const amtDecimal = new Decimal(amount);
    const pmtDate = date ? new Date(date) : new Date();

    // Generate unique payment voucher number PAY-2026-0001
    const pmtCount = await prisma.payment.count();
    const pmtNo = `PAY-2026-${(pmtCount + 1).toString().padStart(4, '0')}`;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Payment record
      const payment = await tx.payment.create({
        data: {
          paymentNo: pmtNo,
          date: pmtDate,
          partyId,
          paymentType: paymentType || 'PAYMENT_MADE',
          paymentMode: paymentMode || 'CASH',
          amount: amtDecimal.toNumber(),
          accountName: accountName || 'Main Cash Account',
          referenceNo: referenceNo || null,
          notes: notes || null,
          status: 'POSTED',
        },
      });

      // 2. Fetch party to calculate running balance
      const party = await tx.party.findUnique({
        where: { id: partyId },
        select: { id: true, partyCode: true, openingBalance: true, balanceType: true },
      });

      const currentBal = new Decimal(party.openingBalance || 0);
      let newBal = currentBal;
      let newBalType = party.balanceType;

      // PAYMENT_MADE / ADVANCE_GIVEN reduces payable (CR) or increases receivable (DR)
      if (party.balanceType === 'PAYABLE') {
        newBal = currentBal.minus(amtDecimal);
        if (newBal.isNegative()) {
          newBal = newBal.abs();
          newBalType = 'RECEIVABLE';
        }
      } else {
        newBal = currentBal.plus(amtDecimal);
      }

      // Update party balance
      await tx.party.update({
        where: { id: partyId },
        data: {
          openingBalance: newBal.toNumber(),
          balanceType: newBalType,
        },
      });

      // 3. Insert PartyLedger entry
      const isDebit = paymentType === 'PAYMENT_MADE' || paymentType === 'ADVANCE_GIVEN';
      await tx.partyLedger.create({
        data: {
          partyId,
          voucherNo: pmtNo,
          voucherType: paymentType,
          debit: isDebit ? amtDecimal.toNumber() : 0.0,
          credit: !isDebit ? amtDecimal.toNumber() : 0.0,
          runningBalance: newBal.toNumber(),
          balanceType: newBalType,
          narration: notes || `Payment voucher ${pmtNo} (${paymentMode})`,
          referenceId: payment.id,
          status: 'POSTED',
        },
      });

      return payment;
    });

    return NextResponse.json({
      success: true,
      message: 'Payment recorded successfully',
      data: result,
    }, { status: 201 });
  } catch (error) {
    console.error('Error recording payment:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to record payment' },
      { status: 500 }
    );
  }
}
