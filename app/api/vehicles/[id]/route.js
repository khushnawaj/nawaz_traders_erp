import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(request, { params }) {
  try {
    const { id } = params;

    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        employees: {
          select: { id: true, fullName: true, phone: true, role: true, avatarUrl: true },
        },
        fuelExpenses: {
          include: {
            driver: { select: { id: true, fullName: true } },
            vendor: { select: { id: true, name: true } },
          },
          orderBy: { date: 'desc' },
        },
        vehicleExpenses: {
          include: {
            vendor: { select: { id: true, name: true } },
          },
          orderBy: { date: 'desc' },
        },
        trips: {
          include: {
            driver: { select: { id: true, fullName: true } },
          },
          orderBy: { date: 'desc' },
          take: 10,
        },
      },
    });

    if (!vehicle) {
      return NextResponse.json(
        { success: false, error: 'Vehicle not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: vehicle });
  } catch (error) {
    console.error('Error fetching vehicle details:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch vehicle details' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    await prisma.vehicle.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Vehicle deleted successfully' });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete vehicle' },
      { status: 500 }
    );
  }
}
