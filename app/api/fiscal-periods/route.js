import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getFiscalPeriods, closeFiscalPeriod, openFiscalPeriod } from '@/server/services/fiscalService';

export async function GET() {
  try {
    const periods = await getFiscalPeriods();
    return NextResponse.json({ success: true, data: periods });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, startDate, endDate, notes } = body;

    if (!name || !startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: 'Name, Start Date, and End Date are required' },
        { status: 400 }
      );
    }

    const period = await prisma.fiscalPeriod.create({
      data: {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        notes: notes || null,
      },
    });

    return NextResponse.json({ success: true, data: period }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { periodId, action, username } = body;

    if (!periodId || !action) {
      return NextResponse.json(
        { success: false, error: 'periodId and action (CLOSE/OPEN) are required' },
        { status: 400 }
      );
    }

    let updatedPeriod;
    if (action === 'CLOSE') {
      updatedPeriod = await closeFiscalPeriod(periodId, username || 'Admin');
    } else if (action === 'OPEN') {
      updatedPeriod = await openFiscalPeriod(periodId);
    } else {
      return NextResponse.json({ success: false, error: 'Invalid action. Use CLOSE or OPEN' }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: updatedPeriod });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
