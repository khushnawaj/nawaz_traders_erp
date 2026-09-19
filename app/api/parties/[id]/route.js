import { NextResponse } from 'next/server';
import { getPartyProfileById } from '@/server/services/partyService';
import { prisma } from '@/lib/db/prisma';

export async function GET(request, context) {
  try {
    const params = await context?.params;
    const id = params?.id;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Party ID is missing' },
        { status: 400 }
      );
    }

    const party = await getPartyProfileById(id);

    if (!party) {
      return NextResponse.json(
        { success: false, error: 'Party not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: party,
    });
  } catch (error) {
    console.error('Error fetching party profile:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch party profile' },
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
        { success: false, error: 'Party ID is missing' },
        { status: 400 }
      );
    }

    const updatedParty = await prisma.party.update({
      where: { id },
      data: {
        name: body.name,
        phone: body.phone,
        alternatePhone: body.alternatePhone,
        address: body.address,
        city: body.city,
        state: body.state,
        notes: body.notes,
        avatarUrl: body.avatarUrl,
        aadhaarNo: body.aadhaarNo,
        aadhaarDocUrl: body.aadhaarDocUrl,
        bankName: body.bankName,
        accountNo: body.accountNo,
        ifscCode: body.ifscCode,
        bankDocUrl: body.bankDocUrl,
        khatauniDocUrl: body.khatauniDocUrl,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Party updated successfully!',
      data: updatedParty,
    });
  } catch (error) {
    console.error('Error updating party:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update party' },
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
        { success: false, error: 'Party ID is missing' },
        { status: 400 }
      );
    }

    await prisma.party.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: 'Party deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting party:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete party' },
      { status: 500 }
    );
  }
}
