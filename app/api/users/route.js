import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { hashPassword, verifySessionToken } from '@/lib/auth/session';
import { registerSchema } from '@/validations/authSchema';

// GET /api/users — List all system users (Owner, Co-Owner, Admin access)
export async function GET(request) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    const session = token ? await verifySessionToken(token) : null;

    if (!session || !['OWNER', 'CO_OWNER', 'ADMIN'].includes(session.role)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Owner or Administrator access required.' },
        { status: 403 }
      );
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        employeeId: true,
        employee: {
          select: {
            id: true,
            fullName: true,
            employeeCode: true,
            role: true,
          },
        },
        partyId: true,
        party: {
          select: {
            id: true,
            name: true,
            partyCode: true,
            roles: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error('Fetch users error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST /api/users — Create new user with role assignment & profile link
export async function POST(request) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    const session = token ? await verifySessionToken(token) : null;

    if (!session || !['OWNER', 'CO_OWNER', 'ADMIN'].includes(session.role)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Owner or Administrator access required.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validated = registerSchema.parse(body);

    // Co-Owners cannot create OWNER or CO_OWNER roles
    if (session.role === 'CO_OWNER' && ['OWNER', 'CO_OWNER'].includes(validated.role)) {
      return NextResponse.json(
        { success: false, error: 'Co-Owners are not authorized to create Owner or Co-Owner accounts.' },
        { status: 403 }
      );
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: { equals: validated.username, mode: 'insensitive' } },
          ...(validated.email ? [{ email: { equals: validated.email, mode: 'insensitive' } }] : []),
        ],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Username or email already exists' },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(validated.password);

    const newUser = await prisma.user.create({
      data: {
        fullName: validated.fullName,
        username: validated.username,
        email: validated.email || null,
        phone: validated.phone || null,
        role: validated.role,
        employeeId: validated.employeeId || null,
        partyId: validated.partyId || null,
        passwordHash,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        employeeId: true,
        partyId: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'User account created successfully',
      user: newUser,
    }, { status: 201 });
  } catch (error) {
    console.error('Create user error:', error);
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Validation Error', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create user' },
      { status: 500 }
    );
  }
}
