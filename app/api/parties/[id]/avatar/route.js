import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function POST(request, context) {
  try {
    const params = await context?.params;
    const id = params?.id;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Party ID missing' }, { status: 400 });
    }

    const { avatarUrl } = await request.json();

    const updatedParty = await prisma.party.update({
      where: { id },
      data: { avatarUrl: avatarUrl || null },
    });

    return NextResponse.json({
      success: true,
      message: 'Profile picture updated successfully!',
      data: updatedParty,
    });
  } catch (error) {
    console.error('Error updating party avatar:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update avatar' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, context) {
  try {
    const params = await context?.params;
    const id = params?.id;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Party ID missing' }, { status: 400 });
    }

    const updatedParty = await prisma.party.update({
      where: { id },
      data: { avatarUrl: null },
    });

    return NextResponse.json({
      success: true,
      message: 'Profile picture removed',
      data: updatedParty,
    });
  } catch (error) {
    console.error('Error deleting party avatar:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to remove avatar' },
      { status: 500 }
    );
  }
}
