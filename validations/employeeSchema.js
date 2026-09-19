import { z } from 'zod';

export const employeeRoleEnum = z.enum([
  'DRIVER',
  'LOADER',
  'HELPER',
  'ACCOUNTANT',
  'MANAGER',
  'MANDI_SUPERVISOR',
  'LABOUR',
]);

export const employeeSchema = z.object({
  fullName: z.string().min(2, 'Full Name is required'),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  role: employeeRoleEnum.default('LABOUR'),
  salaryType: z.enum(['MONTHLY', 'DAILY', 'PER_TRIP']).default('MONTHLY'),
  baseSalary: z.number().or(z.string()).transform((val) => parseFloat(val.toString()) || 0),
  joiningDate: z.string().optional().nullable(),
  assignedVehicleId: z.string().optional().nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']).default('ACTIVE'),
});
