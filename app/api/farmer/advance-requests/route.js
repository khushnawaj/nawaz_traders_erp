import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifySessionToken } from '@/lib/auth/session';
import { createNotification } from '@/server/services/notificationService';
import Decimal from 'decimal.js';

// GET /api/farmer/advance-requests — Fetch advance requests for farmer or management
export async function GET(request) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    const session = token ? await verifySessionToken(token) : null;

    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    let partyId = searchParams.get('partyId') || '';

    // If logged in user is a FARMER, force filter by their linked partyId
    if (session.role === 'FARMER' || (!partyId && session.partyId)) {
      partyId = session.partyId;
      if (!partyId && session.userId) {
        const user = await prisma.user.findUnique({ where: { id: session.userId } });
        partyId = user?.partyId;
      }
    }

    const where = {
      requestType: 'FARMER',
    };

    if (status) where.status = status;
    if (partyId) where.partyId = partyId;

    const advances = await prisma.advanceRequest.findMany({
      where,
      include: {
        party: {
          select: { id: true, name: true, partyCode: true, phone: true, city: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: advances,
    });
  } catch (error) {
    console.error('Error fetching farmer advance requests:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch farmer advance requests' },
      { status: 500 }
    );
  }
}

// POST /api/farmer/advance-requests — Submit new Farmer Khet Advance Request
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
        { success: false, error: 'Please enter a valid advance amount requested.' },
        { status: 400 }
      );
    }

    let targetPartyId = body.partyId || session.partyId;

    if (!targetPartyId && session.userId) {
      const user = await prisma.user.findUnique({ where: { id: session.userId } });
      targetPartyId = user?.partyId;
    }

    if (!targetPartyId) {
      // Search party by phone or full name if not directly linked
      const searchVal = session.phone || session.fullName || session.username;
      const matchedParty = await prisma.party.findFirst({
        where: {
          OR: [
            { phone: searchVal },
            { name: { contains: searchVal, mode: 'insensitive' } },
          ],
        },
      });
      if (matchedParty) {
        targetPartyId = matchedParty.id;
      }
    }

    if (!targetPartyId) {
      return NextResponse.json(
        { success: false, error: 'No farmer profile linked to your account. Please contact mandi admin.' },
        { status: 400 }
      );
    }

    const partyObj = await prisma.party.findUnique({ where: { id: targetPartyId } });
    if (!partyObj) {
      return NextResponse.json({ success: false, error: 'Farmer profile not found.' }, { status: 404 });
    }

    const count = await prisma.advanceRequest.count({ where: { requestType: 'FARMER' } });
    const requestNo = `REQ-FAR-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;

    const newAdvanceRequest = await prisma.advanceRequest.create({
      data: {
        requestNo,
        requestType: 'FARMER',
        partyId: targetPartyId,
        amount,
        reason: body.reason || 'Farmer Khet / Crop Purchase Advance',
        status: 'PENDING',
        notes: body.notes || null,
      },
      include: {
        party: { select: { id: true, name: true, partyCode: true, phone: true } },
      },
    });

    // Send Real-Time Role-Based Notification to Accountant / Management
    const formattedAmount = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
    await createNotification({
      targetRole: 'ACCOUNTANT',
      type: 'ADVANCE',
      title: '🌾 New Farmer Advance Request',
      message: `Farmer ${partyObj.name} (${partyObj.partyCode}) requested an advance of ${formattedAmount}. Reason: ${body.reason || 'Khet Advance'}`,
      link: '/portal/farmer',
    });

    // Notify Farmer confirmation
    await createNotification({
      userId: session.userId,
      targetRole: 'FARMER',
      type: 'ADVANCE',
      title: '✅ Advance Request Submitted',
      message: `Your advance request #${requestNo} for ${formattedAmount} has been sent for accountant approval.`,
      link: '/portal/farmer',
    });

    return NextResponse.json(
      {
        success: true,
        message: '🎉 Khet advance request submitted successfully! Accountant has been notified.',
        data: newAdvanceRequest,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating farmer advance request:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to submit farmer advance request' },
      { status: 500 }
    );
  }
}

// PATCH /api/farmer/advance-requests — Approve or Reject Farmer Advance Request
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
    const { requestId, action, disbursedMode, accountName, notes } = body;

    if (!requestId || !action) {
      return NextResponse.json(
        { success: false, error: 'Request ID and action (APPROVE/REJECT) are required.' },
        { status: 400 }
      );
    }

    const advanceReq = await prisma.advanceRequest.findUnique({
      where: { id: requestId },
      include: { party: true },
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

    const formattedAmount = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(advanceReq.amount);

    if (action === 'REJECT') {
      const updatedReq = await prisma.advanceRequest.update({
        where: { id: requestId },
        data: {
          status: 'REJECTED',
          approvedById: session.userId,
          notes: notes || 'Rejected by Accountant / Management',
        },
      });

      // Send rejection notification to Farmer
      await createNotification({
        targetRole: 'FARMER',
        type: 'ADVANCE',
        title: '❌ Advance Request Rejected',
        message: `Your advance request #${advanceReq.requestNo} for ${formattedAmount} was rejected. Reason: ${notes || 'Contact Mandi Office'}`,
        link: '/portal/farmer',
      });

      return NextResponse.json({
        success: true,
        message: 'Farmer advance request rejected.',
        data: updatedReq,
      });
    }

    // APPROVE & DISBURSE ADVANCE TO FARMER
    const advanceAmount = new Decimal(advanceReq.amount);

    const updatedResult = await prisma.$transaction(async (tx) => {
      // 1. Update Advance Request
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

      // 2. Create Payment record for party ledger tracking
      const payCount = await tx.payment.count();
      const paymentNo = `PAY-ADV-${new Date().getFullYear()}-${(payCount + 1).toString().padStart(4, '0')}`;

      await tx.payment.create({
        data: {
          paymentNo,
          partyId: advanceReq.partyId,
          paymentType: 'PAYMENT_MADE',
          paymentMode: disbursedMode || 'CASH',
          amount: advanceAmount.toNumber(),
          accountName: accountName || 'Main Cash Account',
          referenceNo: advanceReq.requestNo,
          notes: `Farmer Khet Advance Disbursed — ${advanceReq.reason}`,
        },
      });

      // 3. Fetch last party ledger entry for running balance
      const lastLedger = await tx.partyLedger.findFirst({
        where: { partyId: advanceReq.partyId },
        orderBy: { createdAt: 'desc' },
      });

      const prevBal = new Decimal(lastLedger?.runningBalance || 0);
      const newRunningBal = prevBal.plus(advanceAmount);

      // 4. Record entry in Party Ledger
      await tx.partyLedger.create({
        data: {
          partyId: advanceReq.partyId,
          voucherNo: paymentNo,
          voucherType: 'PAYMENT_MADE',
          debit: advanceAmount.toNumber(),
          credit: 0.0,
          runningBalance: newRunningBal.toNumber(),
          balanceType: newRunningBal.gte(0) ? 'RECEIVABLE' : 'PAYABLE',
          narration: `Khet Advance Cash/Bank Disbursed (#${advanceReq.requestNo}) — ${advanceReq.reason}`,
        },
      });

      return req;
    });

    // Notify Farmer of approval and disbursement
    await createNotification({
      targetRole: 'FARMER',
      type: 'ADVANCE',
      title: '🎉 Advance Disbursed Successfully!',
      message: `Your advance request #${advanceReq.requestNo} for ${formattedAmount} has been approved and paid via ${disbursedMode || 'CASH'}. Check your Khaata ledger.`,
      link: '/portal/farmer',
    });

    return NextResponse.json({
      success: true,
      message: '🎉 Farmer advance request approved & disbursed! Ledger updated.',
      data: updatedResult,
    });
  } catch (error) {
    console.error('Error approving farmer advance request:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to disburse advance' },
      { status: 500 }
    );
  }
}
