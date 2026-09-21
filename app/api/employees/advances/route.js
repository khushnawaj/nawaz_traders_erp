import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifySessionToken } from '@/lib/auth/session';
import Decimal from 'decimal.js';

// GET /api/employees/advances — Fetch advance requests
export async function GET(request) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    const session = token ? await verifySessionToken(token) : null;

    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const employeeId = searchParams.get('employeeId') || '';

    const where = {};
    if (status) where.status = status;
    if (employeeId) {
      where.employeeId = employeeId;
    } else if (['EMPLOYEE', 'DRIVER'].includes(session.role) && session.employeeId) {
      where.employeeId = session.employeeId;
    }

    const advances = await prisma.advanceRequest.findMany({
      where,
      include: {
        employee: {
          select: { id: true, fullName: true, employeeCode: true, role: true, phone: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: advances,
    });
  } catch (error) {
    console.error('Error fetching advance requests:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch advance requests' },
      { status: 500 }
    );
  }
}

// POST /api/employees/advances — Submit new salary advance request (Staff/Driver)
export async function POST(request) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    const session = token ? await verifySessionToken(token) : null;

    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const amount = parseFloat(body.amount || 0);

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid requested advance amount.' },
        { status: 400 }
      );
    }

    let targetEmployeeId = body.employeeId || session.employeeId;

    if (!targetEmployeeId && session.userId) {
      const user = await prisma.user.findUnique({ where: { id: session.userId } });
      targetEmployeeId = user?.employeeId;
    }

    if (!targetEmployeeId) {
      return NextResponse.json(
        { success: false, error: 'No active employee profile linked to this account.' },
        { status: 400 }
      );
    }

    const reqCount = await prisma.advanceRequest.count();
    const requestNo = `REQ-${new Date().getFullYear()}-${(reqCount + 1).toString().padStart(4, '0')}`;

    const newAdvanceRequest = await prisma.advanceRequest.create({
      data: {
        requestNo,
        employeeId: targetEmployeeId,
        amount,
        reason: body.reason || 'Personal / Salary Advance Request',
        status: 'PENDING',
        notes: body.notes || null,
      },
      include: {
        employee: { select: { fullName: true, employeeCode: true } },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: '🎉 Salary advance request submitted successfully!',
        data: newAdvanceRequest,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error submitting advance request:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to submit advance request' },
      { status: 500 }
    );
  }
}

// PATCH /api/employees/advances — Approve or Reject & Disburse Advance
export async function PATCH(request) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    const session = token ? await verifySessionToken(token) : null;

    const isManagement = session && ['OWNER', 'CO_OWNER', 'ADMIN', 'MANAGER', 'ACCOUNTANT'].includes(session.role);
    if (!isManagement) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Management approval required.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { requestId, disbursedMode, accountName, notes } = body;
    const action = body.action || (body.status === 'APPROVED' ? 'APPROVE' : body.status === 'REJECTED' ? 'REJECT' : null);

    if (!requestId || !action) {
      return NextResponse.json(
        { success: false, error: 'Request ID and action (APPROVE/REJECT) are required.' },
        { status: 400 }
      );
    }

    const advanceReq = await prisma.advanceRequest.findUnique({
      where: { id: requestId },
      include: { employee: true },
    });

    if (!advanceReq) {
      return NextResponse.json({ success: false, error: 'Advance request not found' }, { status: 404 });
    }

    if (advanceReq.status !== 'PENDING') {
      return NextResponse.json(
        { success: false, error: `Request is already ${advanceReq.status}.` },
        { status: 400 }
      );
    }

    if (action === 'REJECT') {
      const updatedReq = await prisma.advanceRequest.update({
        where: { id: requestId },
        data: {
          status: 'REJECTED',
          approvedById: session.userId,
          notes: notes || 'Rejected by management',
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Salary advance request rejected.',
        data: updatedReq,
      });
    }

    // APPROVE & DISBURSE ADVANCE
    const disbursedAmount = new Decimal(advanceReq.amount);

    const updatedResult = await prisma.$transaction(async (tx) => {
      // 1. Update AdvanceRequest status
      const req = await tx.advanceRequest.update({
        where: { id: requestId },
        data: {
          status: 'APPROVED',
          approvedById: session.userId,
          disbursedMode: disbursedMode || 'CASH',
          accountName: accountName || 'Main Cash Account',
          notes: notes || null,
        },
      });

      // 2. Fetch last employee ledger entry for running balance
      const lastLedger = await tx.employeeLedger.findFirst({
        where: { employeeId: advanceReq.employeeId },
        orderBy: { createdAt: 'desc' },
      });

      const prevBal = new Decimal(lastLedger?.runningBalance || 0);
      const newRunningBal = prevBal.plus(disbursedAmount);

      const voucherNo = `ADV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

      // 3. Post to EmployeeLedger
      await tx.employeeLedger.create({
        data: {
          employeeId: advanceReq.employeeId,
          voucherNo,
          type: 'ADVANCE_GIVEN',
          debit: disbursedAmount.toNumber(),
          credit: 0.0,
          runningBalance: newRunningBal.toNumber(),
          narration: `Salary Advance Disbursed (${disbursedMode || 'CASH'}) — ${advanceReq.reason}`,
        },
      });

      return req;
    });

    return NextResponse.json({
      success: true,
      message: '🎉 Salary advance approved & disbursed! Ledger updated.',
      data: updatedResult,
    });
  } catch (error) {
    console.error('Error approving advance request:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to disburse advance' },
      { status: 500 }
    );
  }
}
