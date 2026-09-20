import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

/**
 * GET /api/employees/[id]/attendance
 * Query Params: ?year=2026&month=9
 */
export async function GET(request, context) {
  try {
    const params = await context?.params;
    const employeeId = params?.id;

    if (!employeeId) {
      return NextResponse.json({ success: false, error: 'Employee ID is required' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get('year');
    const monthParam = searchParams.get('month');

    let whereClause = { employeeId };

    if (yearParam && monthParam) {
      const year = parseInt(yearParam, 10);
      const month = parseInt(monthParam, 10); // 1-indexed (1 = Jan, 9 = Sep)

      // Start of month (inclusive) and End of month (inclusive)
      const startDate = new Date(Date.UTC(year, month - 1, 1));
      const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59));

      whereClause.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    const attendances = await prisma.attendance.findMany({
      where: whereClause,
      orderBy: { date: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: attendances,
    });
  } catch (error) {
    console.error('Error fetching employee attendances:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch attendance records' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/employees/[id]/attendance
 * Body: { date: "YYYY-MM-DD", status: "PRESENT" | "ABSENT" | "HALF_DAY" | "LEAVE" | null, overtimeHr?: number, notes?: string, action?: string, dates?: string[] }
 */
export async function POST(request, context) {
  try {
    const params = await context?.params;
    const employeeId = params?.id;

    if (!employeeId) {
      return NextResponse.json({ success: false, error: 'Employee ID is required' }, { status: 400 });
    }

    const body = await request.json();

    // Handle Bulk Action (e.g. mark all month weekdays PRESENT or CLEAR month)
    if (body.action === 'BULK_MARK_PRESENT' && Array.isArray(body.dates)) {
      const ops = body.dates.map((dateStr) => {
        const dateObj = new Date(`${dateStr}T00:00:00.000Z`);
        return prisma.attendance.upsert({
          where: {
            employeeId_date: {
              employeeId,
              date: dateObj,
            },
          },
          update: { status: 'PRESENT' },
          create: {
            employeeId,
            date: dateObj,
            status: 'PRESENT',
          },
        });
      });

      await prisma.$transaction(ops);

      return NextResponse.json({
        success: true,
        message: `Successfully marked ${body.dates.length} days as PRESENT`,
      });
    }

    if (body.action === 'BULK_CLEAR' && Array.isArray(body.dates)) {
      const dateObjs = body.dates.map((d) => new Date(`${d}T00:00:00.000Z`));
      await prisma.attendance.deleteMany({
        where: {
          employeeId,
          date: { in: dateObjs },
        },
      });

      return NextResponse.json({
        success: true,
        message: `Cleared attendance for ${body.dates.length} days`,
      });
    }

    // Single Date Toggle/Update
    const { date, status, overtimeHr = 0, notes = '' } = body;

    if (!date) {
      return NextResponse.json({ success: false, error: 'Date string (YYYY-MM-DD) is required' }, { status: 400 });
    }

    const dateObj = new Date(`${date}T00:00:00.000Z`);

    // If status is null or UNMARKED, remove the record
    if (!status || status === 'UNMARKED') {
      await prisma.attendance.deleteMany({
        where: {
          employeeId,
          date: dateObj,
        },
      });

      return NextResponse.json({
        success: true,
        action: 'DELETED',
        date,
        status: null,
        message: `Cleared attendance for ${date}`,
      });
    }

    // Upsert status
    const record = await prisma.attendance.upsert({
      where: {
        employeeId_date: {
          employeeId,
          date: dateObj,
        },
      },
      update: {
        status,
        overtimeHr: parseFloat(overtimeHr) || 0,
        notes: notes || null,
      },
      create: {
        employeeId,
        date: dateObj,
        status,
        overtimeHr: parseFloat(overtimeHr) || 0,
        notes: notes || null,
      },
    });

    return NextResponse.json({
      success: true,
      action: 'UPSERTED',
      data: record,
      message: `Marked ${date} as ${status}`,
    });
  } catch (error) {
    console.error('Error saving attendance:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save attendance record' },
      { status: 500 }
    );
  }
}
