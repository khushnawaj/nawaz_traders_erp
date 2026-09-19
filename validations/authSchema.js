import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
});

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Full Name is required'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  role: z.enum(['ADMIN', 'ACCOUNTANT', 'MANAGER', 'OPERATOR', 'DRIVER']).default('OPERATOR'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
