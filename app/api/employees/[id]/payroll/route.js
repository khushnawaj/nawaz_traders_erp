import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifySessionToken } from '@/lib/auth/session';
import Decimal from 'decimal.js';

// POST /api/employees/[id]/payroll — Post Final Salary Payout Voucher to Employee Ledger
export async function POST(request, context) {
  try {
    const params = await context?.params;
    const employeeId = params?.id;

    if (!employeeId) {
      return NextResponse.json({ success: false, error: 'Employee ID is required.' }, { status: 400 });
    }

    const token = request.cookies.get('auth_token')?.value;
    const session = token ? await verifySessionToken(token) : null;

    const isManagement = session && ['OWNER', 'CO_OWNER', 'ADMIN', 'MANAGER', 'ACCOUNTANT'].includes(session.role);
    if (!isManagement) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Management permission required.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      monthLabel, // e.g. "September 2026"
      presentDays = 0,
      absentDays = 0,
      halfDays = 0,
      overtimeHours = 0,
      baseEarnedSalary = 0,
      overtimeEarnings = 0,
      bonusAmount = 0,
      grossSalary = 0,
      advanceDeduction = 0,
      netPayable = 0,
      disbursedMode = 'CASH', // CASH or BANK
      accountName = 'Main Operational Account',
      notes = '',
    } = body;

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      return NextResponse.json({ success: false, error: 'Employee not found.' }, { status: 404 });
    }

    const grossSalaryNum = parseFloat(grossSalary || 0);
    const advanceDeductionNum = parseFloat(advanceDeduction || 0);
    const netPayableNum = parseFloat(netPayable || 0);

    if (grossSalaryNum <= 0 && netPayableNum <= 0) {
      return NextResponse.json(
        { success: false, error: 'Gross salary or net payable amount must be greater than zero.' },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // Fetch latest running balance
      const lastLedger = await tx.employeeLedger.findFirst({
        where: { employeeId },
        orderBy: { createdAt: 'desc' },
      });

      let currentBal = new Decimal(lastLedger?.runningBalance || 0);
      const voucherNo = `SAL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

      // 1. Post SALARY_CREDIT (Gross Salary Earned)
      const creditBal = currentBal.minus(new Decimal(grossSalaryNum));
      const salaryEntry = await tx.employeeLedger.create({
        data: {
          employeeId,
          voucherNo,
          type: 'SALARY_CREDIT',
          debit: 0.0,
          credit: grossSalaryNum,
          runningBalance: creditBal.toNumber(),
          narration: `Monthly Salary Credit (${monthLabel || 'Current Month'}) — ${presentDays} Days Present, ${overtimeHours}h OT`,
        },
      });

      currentBal = creditBal;

      // 2. If Advance Deduction was adjusted
      if (advanceDeductionNum > 0) {
        currentBal = currentBal.minus(new Decimal(advanceDeductionNum));
        await tx.employeeLedger.create({
          data: {
            employeeId,
            voucherNo: `${voucherNo}-ADV`,
            type: 'ADVANCE_ADJUSTED',
            debit: 0.0,
            credit: advanceDeductionNum,
            runningBalance: currentBal.toNumber(),
            narration: `Advance Deduction Adjusted against ${monthLabel || 'Monthly Salary'}`,
          },
        });
      }

      // 3. Post Net Cash/Bank Payout (Debit)
      if (netPayableNum > 0) {
        currentBal = currentBal.plus(new Decimal(netPayableNum));
        await tx.employeeLedger.create({
          data: {
            employeeId,
            voucherNo: `${voucherNo}-PAY`,
            type: 'SALARY_DISBURSED',
            debit: netPayableNum,
            credit: 0.0,
            runningBalance: currentBal.toNumber(),
            narration: `Final Salary Disbursed via ${disbursedMode} (${accountName}) — ${notes || 'Paid in Full'}`,
          },
        });
      }

      return salaryEntry;
    });

    return NextResponse.json({
      success: true,
      message: `🎉 Salary for ${employee.fullName} (${monthLabel || 'Current Month'}) calculated & disbursed successfully!`,
      data: result,
    });
  } catch (error) {
    console.error('Error posting salary payout:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to post salary payout' },
      { status: 500 }
    );
  }
}
