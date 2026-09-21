import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request, { params }) {
  try {
    const { id: investorId } = params;
    const body = await request.json();

    const investor = await prisma.investor.findUnique({
      where: { id: investorId },
    });

    if (!investor) {
      return NextResponse.json(
        { success: false, error: 'Investor or Lender not found' },
        { status: 404 }
      );
    }

    const type = body.type || 'EMI_PAYMENT';
    const principalPaid = parseFloat(body.principalPaid || 0);
    const interestPaid = parseFloat(body.interestPaid || 0);
    const totalAmount = parseFloat(body.totalAmount || (principalPaid + interestPaid));

    if (totalAmount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Transaction amount must be greater than zero' },
        { status: 400 }
      );
    }

    // Calculate updated balances
    let updatedOutstanding = parseFloat(investor.currentOutstandingBalance || 0);
    let updatedPaidPrincipal = parseFloat(investor.totalPaidPrincipal || 0);
    let updatedPaidInterest = parseFloat(investor.totalPaidInterest || 0);
    let updatedPrincipal = parseFloat(investor.principalAmount || 0);

    if (['EMI_PAYMENT', 'PRINCIPAL_REPAYMENT'].includes(type)) {
      updatedPaidPrincipal += principalPaid;
      updatedPaidInterest += interestPaid;
      updatedOutstanding = Math.max(0, updatedOutstanding - principalPaid);
    } else if (['INTEREST_PAYMENT', 'PROFIT_PAYOUT'].includes(type)) {
      updatedPaidInterest += totalAmount;
    } else if (type === 'PRINCIPAL_RECEIVED') {
      updatedPrincipal += totalAmount;
      updatedOutstanding += totalAmount;
    } else if (type === 'CAPITAL_WITHDRAWAL') {
      updatedPrincipal = Math.max(0, updatedPrincipal - totalAmount);
      updatedOutstanding = Math.max(0, updatedOutstanding - totalAmount);
    }

    const vNo = `TXN-${Date.now().toString().slice(-6)}`;

    // Perform transaction and investor update atomically in a Prisma $transaction
    const result = await prisma.$transaction(async (tx) => {
      const transactionRecord = await tx.investorTransaction.create({
        data: {
          voucherNo: vNo,
          investorId,
          type,
          principalPaid,
          interestPaid,
          totalAmount,
          paymentMode: body.paymentMode || 'BANK_TRANSFER',
          accountName: body.accountName || 'Main Cash Account',
          referenceNo: body.referenceNo || null,
          dueDate: body.dueDate ? new Date(body.dueDate) : null,
          narration: body.narration || `${type.replace('_', ' ')} recorded`,
          runningBalance: updatedOutstanding,
        },
      });

      const updatedInvestor = await tx.investor.update({
        where: { id: investorId },
        data: {
          principalAmount: updatedPrincipal,
          currentOutstandingBalance: updatedOutstanding,
          totalPaidPrincipal: updatedPaidPrincipal,
          totalPaidInterest: updatedPaidInterest,
        },
      });

      return { transactionRecord, updatedInvestor };
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Transaction recorded successfully',
        data: result,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('API POST /api/investors/[id]/transactions Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to record transaction' },
      { status: 500 }
    );
  }
}
