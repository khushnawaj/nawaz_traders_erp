import { NextResponse } from 'next/server';
import { getEmployeeProfileById } from '@/server/services/employeeService';

export async function GET(request, context) {
  try {
    const params = await context?.params;
    const id = params?.id;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Employee ID is missing' },
        { status: 400 }
      );
    }

    const employee = await getEmployeeProfileById(id);

    if (!employee) {
      return NextResponse.json(
        { success: false, error: 'Employee not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: employee,
    });
  } catch (error) {
    console.error('Error fetching employee profile:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch employee profile' },
      { status: 500 }
    );
  }
}
