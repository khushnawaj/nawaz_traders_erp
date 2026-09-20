import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { hashPassword, verifySessionToken } from '@/lib/auth/session';

// PATCH /api/users/[id] — Update role, status, profile link, or password
export async function PATCH(request, { params }) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    const session = token ? await verifySessionToken(token) : null;

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();

    const isSelfUpdate = session.userId === id;
    const isOwnerOrAdmin = ['OWNER', 'CO_OWNER', 'ADMIN'].includes(session.role);

    if (!isSelfUpdate && !isOwnerOrAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized to edit other user profiles.' },
        { status: 403 }
      );
    }

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Protection: Only OWNER can modify another OWNER or promote to OWNER/CO_OWNER
    if (!isSelfUpdate && session.role !== 'OWNER') {
      if (targetUser.role === 'OWNER' || body.role === 'OWNER' || body.role === 'CO_OWNER') {
        return NextResponse.json(
          { success: false, error: 'Only the System Owner can manage Owner & Co-Owner privileges.' },
          { status: 403 }
        );
      }
    }

    const updateData = {};
    if (body.fullName !== undefined) updateData.fullName = body.fullName;
    if (body.email !== undefined) updateData.email = body.email || null;
    if (body.phone !== undefined) updateData.phone = body.phone || null;
    if (body.avatarUrl !== undefined) updateData.avatarUrl = body.avatarUrl || null;

    // Role & Status can only be changed by Admin/Owner
    if (isOwnerOrAdmin) {
      if (body.role !== undefined) updateData.role = body.role;
      if (body.status !== undefined) updateData.status = body.status;
      if (body.employeeId !== undefined) updateData.employeeId = body.employeeId || null;
      if (body.partyId !== undefined) updateData.partyId = body.partyId || null;

      const effectiveRole = body.role || targetUser.role;
      const effectivePartyId = body.partyId !== undefined ? body.partyId : targetUser.partyId;
      const effectiveEmployeeId = body.employeeId !== undefined ? body.employeeId : targetUser.employeeId;

      // Auto-create Farmer Party if user role is FARMER and partyId is missing
      if (effectiveRole === 'FARMER' && !effectivePartyId) {
        let existingParty = null;
        if (targetUser.phone) {
          existingParty = await prisma.party.findFirst({
            where: { phone: targetUser.phone },
          });
        }
        if (!existingParty && targetUser.fullName) {
          existingParty = await prisma.party.findFirst({
            where: { name: { equals: targetUser.fullName, mode: 'insensitive' } },
          });
        }

        if (!existingParty) {
          const partyCount = await prisma.party.count();
          const partyCode = `FRM-${(partyCount + 1).toString().padStart(4, '0')}`;
          existingParty = await prisma.party.create({
            data: {
              partyCode,
              name: targetUser.fullName || targetUser.username,
              phone: targetUser.phone || null,
              roles: ['FARMER'],
              status: 'ACTIVE',
            },
          });
        }

        updateData.partyId = existingParty.id;
      }

      // Auto-create Employee profile if user role is EMPLOYEE or DRIVER and employeeId is missing
      if (['EMPLOYEE', 'DRIVER'].includes(effectiveRole) && !effectiveEmployeeId) {
        let existingEmp = null;
        if (targetUser.phone) {
          existingEmp = await prisma.employee.findFirst({
            where: { phone: targetUser.phone },
          });
        }
        if (!existingEmp && targetUser.fullName) {
          existingEmp = await prisma.employee.findFirst({
            where: { fullName: { equals: targetUser.fullName, mode: 'insensitive' } },
          });
        }

        if (!existingEmp) {
          const empCount = await prisma.employee.count();
          const employeeCode = `EMP-${(empCount + 1).toString().padStart(3, '0')}`;
          existingEmp = await prisma.employee.create({
            data: {
              employeeCode,
              fullName: targetUser.fullName || targetUser.username,
              phone: targetUser.phone || null,
              role: effectiveRole === 'DRIVER' ? 'DRIVER' : 'LABOUR',
              status: 'ACTIVE',
            },
          });
        }

        updateData.employeeId = existingEmp.id;
      }
    }

    // Password Update
    if (body.password && body.password.trim().length >= 4) {
      updateData.passwordHash = await hashPassword(body.password.trim());
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        phone: true,
        avatarUrl: true,
        role: true,
        status: true,
        employeeId: true,
        partyId: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] — Deactivate user account
export async function DELETE(request, { params }) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    const session = token ? await verifySessionToken(token) : null;

    if (!session || !['OWNER', 'CO_OWNER', 'ADMIN'].includes(session.role)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Owner access required.' },
        { status: 403 }
      );
    }

    const { id } = params;

    // Prevent deleting self
    if (session.userId === id) {
      return NextResponse.json(
        { success: false, error: 'You cannot deactivate your own active account.' },
        { status: 400 }
      );
    }

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    if (targetUser.role === 'OWNER' && session.role !== 'OWNER') {
      return NextResponse.json(
        { success: false, error: 'Only System Owner can deactivate another Owner account.' },
        { status: 403 }
      );
    }

    // Soft delete (set status INACTIVE)
    const deactivatedUser = await prisma.user.update({
      where: { id },
      data: { status: 'INACTIVE' },
    });

    return NextResponse.json({
      success: true,
      message: 'User account deactivated successfully',
      user: deactivatedUser,
    });
  } catch (error) {
    console.error('Deactivate user error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to deactivate user' },
      { status: 500 }
    );
  }
}
