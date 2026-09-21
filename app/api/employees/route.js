import { NextResponse } from 'next/server';
import { getAllEmployees, createEmployee, getEmployeeSummaryStats } from '@/server/services/employeeService';
import { employeeSchema } from '@/validations/employeeSchema';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const statsOnly = searchParams.get('statsOnly') === 'true';
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';

    if (statsOnly) {
      const stats = await getEmployeeSummaryStats();
      return NextResponse.json({ success: true, data: stats });
    }

    const { employees, pagination } = await getAllEmployees({ search, role, page, limit });
    const stats = await getEmployeeSummaryStats();

    return NextResponse.json({
      success: true,
      data: employees,
      pagination,
      stats,
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch employees' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const validatedData = employeeSchema.parse(body);

    const employee = await createEmployee(validatedData);

    return NextResponse.json({
      success: true,
      message: 'Employee registered successfully',
      data: employee,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating employee:', error);
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Validation Error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create employee' },
      { status: 500 }
    );
  }
}
