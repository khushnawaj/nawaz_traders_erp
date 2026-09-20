import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { hashPassword, signSessionToken } from '@/lib/auth/session';
import { registerSchema } from '@/validations/authSchema';

export async function POST(request) {
  try {
    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    // Check if username already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: { equals: validatedData.username, mode: 'insensitive' } },
          ...(validatedData.email ? [{ email: { equals: validatedData.email, mode: 'insensitive' } }] : []),
        ],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Username or email already registered' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(validatedData.password);

    // Create user with INACTIVE status (Pending Owner/Admin activation)
    const newUser = await prisma.user.create({
      data: {
        fullName: validatedData.fullName,
        username: validatedData.username,
        email: validatedData.email || null,
        phone: validatedData.phone || null,
        role: validatedData.role || 'OPERATOR',
        employeeId: validatedData.employeeId || null,
        partyId: validatedData.partyId || null,
        passwordHash,
        status: 'INACTIVE', // Pending approval by Owner/Admin
      },
    });

    return NextResponse.json({
      success: true,
      pendingApproval: true,
      message: 'Registration submitted successfully! Your account is pending activation by Owner/Admin.',
      user: {
        id: newUser.id,
        username: newUser.username,
        fullName: newUser.fullName,
        role: newUser.role,
        status: newUser.status,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Register API error:', error);
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Validation Error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Registration failed' },
      { status: 500 }
    );
  }
}
