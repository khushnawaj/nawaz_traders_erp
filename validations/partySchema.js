import { z } from 'zod';

export const partyRolesEnum = z.enum([
  'FARMER',
  'CUSTOMER',
  'RICE_MILL',
  'SUPPLIER',
  'VENDOR',
  'OTHER',
]);

export const partySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional().nullable(),
  alternatePhone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  roles: z.array(partyRolesEnum).min(1, 'At least one role must be selected'),
  openingBalance: z.number().or(z.string()).transform((val) => parseFloat(val.toString()) || 0),
  balanceType: z.enum(['RECEIVABLE', 'PAYABLE']).default('RECEIVABLE'),
  notes: z.string().optional().nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']).default('ACTIVE'),
  avatarUrl: z.string().optional().nullable(),
  aadhaarNo: z.string().optional().nullable(),
  aadhaarDocUrl: z.string().optional().nullable(),
  bankName: z.string().optional().nullable(),
  accountNo: z.string().optional().nullable(),
  ifscCode: z.string().optional().nullable(),
  bankDocUrl: z.string().optional().nullable(),
  khatauniDocUrl: z.string().optional().nullable(),
});
