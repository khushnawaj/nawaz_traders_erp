import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || 'ALL';
    const status = searchParams.get('status') || 'ALL';

    const whereClause = {};

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { investorCode: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { bankName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category !== 'ALL') {
      whereClause.category = category;
    }

    if (status !== 'ALL') {
      whereClause.status = status;
    }

    const investors = await prisma.investor.findMany({
      where: whereClause,
      include: {
        transactions: {
          orderBy: { date: 'desc' },
          take: 5,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Compute summary stats over all investors
    const allInvestors = await prisma.investor.findMany({
      select: {
        principalAmount: true,
        currentOutstandingBalance: true,
        totalPaidPrincipal: true,
        totalPaidInterest: true,
        profitSharePercentage: true,
        status: true,
        category: true,
      },
    });

    let totalPrincipal = 0;
    let totalOutstanding = 0;
    let totalPaidPrincipal = 0;
    let totalPaidInterest = 0;
    let activeCount = 0;
    let bankCount = 0;
    let investorCount = 0;

    allInvestors.forEach((inv) => {
      const p = parseFloat(inv.principalAmount || 0);
      const out = parseFloat(inv.currentOutstandingBalance || 0);
      const pp = parseFloat(inv.totalPaidPrincipal || 0);
      const pi = parseFloat(inv.totalPaidInterest || 0);

      totalPrincipal += p;
      totalOutstanding += out;
      totalPaidPrincipal += pp;
      totalPaidInterest += pi;

      if (inv.status === 'ACTIVE') activeCount++;
      if (['BANK', 'PRIVATE_FINANCIER'].includes(inv.category)) bankCount++;
      if (inv.category === 'INVESTOR') investorCount++;
    });

    return NextResponse.json({
      success: true,
      data: investors,
      stats: {
        totalPrincipal,
        totalOutstanding,
        totalPaidPrincipal,
        totalPaidInterest,
        totalCount: allInvestors.length,
        activeCount,
        bankCount,
        investorCount,
      },
    });
  } catch (error) {
    console.error('API GET /api/investors Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch investors' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Investor or Lender name is required' },
        { status: 400 }
      );
    }

    // Auto-generate code e.g. INV-0001 or LND-0001
    const count = await prisma.investor.count();
    const prefix = body.category === 'BANK' ? 'BNK' : body.category === 'PRIVATE_FINANCIER' ? 'FIN' : 'INV';
    const codeNumber = (count + 1).toString().padStart(4, '0');
    const investorCode = `${prefix}-${codeNumber}`;

    const principal = parseFloat(body.principalAmount || 0);
    const profitShare = parseFloat(body.profitSharePercentage || 0);
    const interestRate = parseFloat(body.annualInterestRate || 0);
    const emi = parseFloat(body.emiAmount || 0);

    const newInvestor = await prisma.investor.create({
      data: {
        investorCode,
        name: body.name.trim(),
        category: body.category || 'INVESTOR',
        phone: body.phone || null,
        email: body.email || null,
        address: body.address || null,
        city: body.city || null,
        state: body.state || null,
        principalAmount: principal,
        profitSharePercentage: profitShare,
        annualInterestRate: interestRate,
        interestType: body.interestType || 'SIMPLE',
        tenureMonths: body.tenureMonths ? parseInt(body.tenureMonths, 10) : 12,
        emiAmount: emi,
        emiDueDateDay: body.emiDueDateDay ? parseInt(body.emiDueDateDay, 10) : 5,
        promisedDate: body.promisedDate ? new Date(body.promisedDate) : null,
        currentOutstandingBalance: principal,
        totalPaidPrincipal: 0,
        totalPaidInterest: 0,
        status: body.status || 'ACTIVE',
        notes: body.notes || null,
        bankName: body.bankName || null,
        accountNo: body.accountNo || null,
        ifscCode: body.ifscCode || null,
        panNo: body.panNo || null,
        aadhaarNo: body.aadhaarNo || null,
      },
    });

    // If initial principal is provided, log an initial transaction
    if (principal > 0) {
      const vNo = `VOU-${Date.now().toString().slice(-6)}`;
      await prisma.investorTransaction.create({
        data: {
          voucherNo: vNo,
          investorId: newInvestor.id,
          type: 'PRINCIPAL_RECEIVED',
          principalPaid: 0,
          interestPaid: 0,
          totalAmount: principal,
          paymentMode: body.paymentMode || 'BANK_TRANSFER',
          accountName: body.accountName || 'Main Cash Account',
          narration: `Initial Capital/Loan Received for ${newInvestor.name}`,
          runningBalance: principal,
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Investor / Lender created successfully',
        data: newInvestor,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('API POST /api/investors Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create investor' },
      { status: 500 }
    );
  }
}
