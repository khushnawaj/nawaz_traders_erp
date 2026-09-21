import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const { id } = params;

    const investor = await prisma.investor.findUnique({
      where: { id },
      include: {
        transactions: {
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!investor) {
      return NextResponse.json(
        { success: false, error: 'Investor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: investor,
    });
  } catch (error) {
    console.error('API GET /api/investors/[id] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch investor details' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();

    const existing = await prisma.investor.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Investor not found' },
        { status: 404 }
      );
    }

    const principal = body.principalAmount !== undefined ? parseFloat(body.principalAmount) : existing.principalAmount;
    const profitShare = body.profitSharePercentage !== undefined ? parseFloat(body.profitSharePercentage) : existing.profitSharePercentage;
    const interestRate = body.annualInterestRate !== undefined ? parseFloat(body.annualInterestRate) : existing.annualInterestRate;
    const emi = body.emiAmount !== undefined ? parseFloat(body.emiAmount) : existing.emiAmount;

    const updated = await prisma.investor.update({
      where: { id },
      data: {
        name: body.name ? body.name.trim() : existing.name,
        category: body.category || existing.category,
        phone: body.phone !== undefined ? body.phone : existing.phone,
        email: body.email !== undefined ? body.email : existing.email,
        address: body.address !== undefined ? body.address : existing.address,
        city: body.city !== undefined ? body.city : existing.city,
        state: body.state !== undefined ? body.state : existing.state,
        principalAmount: principal,
        profitSharePercentage: profitShare,
        annualInterestRate: interestRate,
        interestType: body.interestType || existing.interestType,
        tenureMonths: body.tenureMonths !== undefined ? parseInt(body.tenureMonths, 10) : existing.tenureMonths,
        emiAmount: emi,
        emiDueDateDay: body.emiDueDateDay !== undefined ? parseInt(body.emiDueDateDay, 10) : existing.emiDueDateDay,
        promisedDate: body.promisedDate ? new Date(body.promisedDate) : existing.promisedDate,
        status: body.status || existing.status,
        notes: body.notes !== undefined ? body.notes : existing.notes,
        bankName: body.bankName !== undefined ? body.bankName : existing.bankName,
        accountNo: body.accountNo !== undefined ? body.accountNo : existing.accountNo,
        ifscCode: body.ifscCode !== undefined ? body.ifscCode : existing.ifscCode,
        panNo: body.panNo !== undefined ? body.panNo : existing.panNo,
        aadhaarNo: body.aadhaarNo !== undefined ? body.aadhaarNo : existing.aadhaarNo,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Investor updated successfully',
      data: updated,
    });
  } catch (error) {
    console.error('API PUT /api/investors/[id] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update investor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    const existing = await prisma.investor.findUnique({
      where: { id },
      include: { transactions: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Investor not found' },
        { status: 404 }
      );
    }

    // Delete investor record & associated transactions
    await prisma.investor.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Investor record deleted successfully',
    });
  } catch (error) {
    console.error('API DELETE /api/investors/[id] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete investor' },
      { status: 500 }
    );
  }
}
