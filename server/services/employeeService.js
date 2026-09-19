import { prisma } from '@/lib/db/prisma';
import Decimal from 'decimal.js';

/**
 * Get summary stats for Employees & Staff
 */
export async function getEmployeeSummaryStats() {
  const employees = await prisma.employee.findMany({
    where: { status: 'ACTIVE' },
    select: { role: true, baseSalary: true, salaryType: true },
  });

  let driverCount = 0;
  let labourCount = 0;
  let managerCount = 0;
  let totalMonthlySalary = new Decimal(0);

  for (const emp of employees) {
    if (emp.role === 'DRIVER') driverCount++;
    if (emp.role === 'LABOUR' || emp.role === 'LOADER' || emp.role === 'HELPER') labourCount++;
    if (emp.role === 'MANAGER' || emp.role === 'ACCOUNTANT' || emp.role === 'MANDI_SUPERVISOR') managerCount++;

    if (emp.salaryType === 'MONTHLY') {
      totalMonthlySalary = totalMonthlySalary.plus(new Decimal(emp.baseSalary || 0));
    }
  }

  return {
    totalEmployees: employees.length,
    driverCount,
    labourCount,
    managerCount,
    totalMonthlySalary: totalMonthlySalary.toString(),
  };
}

/**
 * Get paginated & filtered list of employees
 */
export async function getAllEmployees({ search = '', role = '', status = 'ACTIVE' } = {}) {
  const where = {
    status: status ? status : undefined,
  };

  if (role && role !== 'ALL') {
    where.role = role;
  }

  if (search) {
    where.OR = [
      { fullName: { contains: search, mode: 'insensitive' } },
      { employeeCode: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
    ];
  }

  const employees = await prisma.employee.findMany({
    where,
    include: {
      assignedVehicle: {
        select: { id: true, vehicleNumber: true, vehicleType: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return employees;
}

/**
 * Generate Next Unique Employee Code (EMP-001)
 */
async function generateEmployeeCode() {
  const count = await prisma.employee.count();
  const nextNum = (count + 1).toString().padStart(3, '0');
  return `EMP-${nextNum}`;
}

/**
 * Create a new employee
 */
export async function createEmployee(data) {
  const employeeCode = await generateEmployeeCode();

  const newEmp = await prisma.employee.create({
    data: {
      employeeCode,
      fullName: data.fullName,
      phone: data.phone || null,
      address: data.address || null,
      role: data.role,
      salaryType: data.salaryType || 'MONTHLY',
      baseSalary: new Decimal(data.baseSalary || 0).toNumber(),
      joiningDate: data.joiningDate ? new Date(data.joiningDate) : new Date(),
      assignedVehicleId: data.assignedVehicleId || null,
      status: data.status || 'ACTIVE',
    },
  });

  return newEmp;
}

/**
 * Get comprehensive tabbed Employee Profile by ID
 */
export async function getEmployeeProfileById(id) {
  if (!id || typeof id !== 'string') return null;

  const employee = await prisma.employee.findUnique({
    where: { id },
    include: {
      assignedVehicle: true,
      attendances: {
        orderBy: { date: 'desc' },
        take: 60, // Last 60 days
      },
      employeeLedgers: {
        orderBy: { date: 'desc' },
        take: 100,
      },
      trips: {
        orderBy: { date: 'desc' },
        take: 50,
        include: {
          vehicle: { select: { vehicleNumber: true, vehicleType: true } },
        },
      },
    },
  });

  return employee;
}
