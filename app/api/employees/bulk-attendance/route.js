import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function POST(request) {
  try {
    const body = await request.json();
    const { date, attendances } = body;

    if (!date || !Array.isArray(attendances) || attendances.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Valid date and attendances array are required' },
        { status: 400 }
      );
    }

    const targetDate = new Date(date);
    targetDate.setUTCHours(0, 0, 0, 0);

    const results = await prisma.$transaction(
      attendances.map((item) => {
        return prisma.attendance.upsert({
          where: {
            employeeId_date: {
              employeeId: item.employeeId,
              date: targetDate,
            },
          },
          update: {
            status: item.status || 'PRESENT',
            overtimeHours: parseFloat(item.overtimeHours || 0),
            remarks: item.remarks || null,
          },
          create: {
            employeeId: item.employeeId,
            date: targetDate,
            status: item.status || 'PRESENT',
            overtimeHours: parseFloat(item.overtimeHours || 0),
            remarks: item.remarks || null,
          },
        });
      })
    );

    return NextResponse.json({
      success: true,
      message: `Bulk attendance marked successfully for ${results.length} staff members!`,
      count: results.length,
    });
  } catch (error) {
    console.error('Error in bulk attendance:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to post bulk attendance' },
      { status: 500 }
    );
  }
}
