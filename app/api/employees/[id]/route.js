import { NextResponse } from 'next/server';
import { getEmployeeProfileById } from '@/server/services/employeeService';
import { prisma } from '@/lib/db/prisma';

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

export async function PUT(request, context) {
  try {
    const params = await context?.params;
    const id = params?.id;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Employee ID is missing' },
        { status: 400 }
      );
    }

    const updatedEmployee = await prisma.employee.update({
      where: { id },
      data: {
        fullName: body.fullName,
        phone: body.phone,
        address: body.address,
        role: body.role,
        salaryType: body.salaryType,
        baseSalary: body.baseSalary ? parseFloat(body.baseSalary) : undefined,
        assignedVehicleId: body.assignedVehicleId,
        avatarUrl: body.avatarUrl,
        aadhaarNo: body.aadhaarNo,
        aadhaarDocUrl: body.aadhaarDocUrl,
        panNo: body.panNo,
        panDocUrl: body.panDocUrl,
        drivingLicenseNo: body.drivingLicenseNo,
        drivingLicenseDocUrl: body.drivingLicenseDocUrl,
        bankName: body.bankName,
        accountNo: body.accountNo,
        ifscCode: body.ifscCode,
        bankDocUrl: body.bankDocUrl,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Employee updated successfully!',
      data: updatedEmployee,
    });
  } catch (error) {
    console.error('Error updating employee:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update employee' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, context) {
  try {
    const params = await context?.params;
    const id = params?.id;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Employee ID is missing' },
        { status: 400 }
      );
    }

    await prisma.employee.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: 'Employee deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting employee:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete employee' },
      { status: 500 }
    );
  }
}
