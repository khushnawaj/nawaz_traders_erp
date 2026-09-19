import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function POST(request, context) {
  try {
    const params = await context?.params;
    const id = params?.id;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Employee ID missing' }, { status: 400 });
    }

    const { avatarUrl } = await request.json();

    const updatedEmployee = await prisma.employee.update({
      where: { id },
      data: { avatarUrl: avatarUrl || null },
    });

    return NextResponse.json({
      success: true,
      message: 'Employee profile picture updated!',
      data: updatedEmployee,
    });
  } catch (error) {
    console.error('Error updating employee avatar:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update avatar' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, context) {
  try {
    const params = await context?.params;
    const id = params?.id;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Employee ID missing' }, { status: 400 });
    }

    const updatedEmployee = await prisma.employee.update({
      where: { id },
      data: { avatarUrl: null },
    });

    return NextResponse.json({
      success: true,
      message: 'Employee profile picture removed',
      data: updatedEmployee,
    });
  } catch (error) {
    console.error('Error deleting employee avatar:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to remove avatar' },
      { status: 500 }
    );
  }
}
