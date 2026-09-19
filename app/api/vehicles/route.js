import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    const vehicles = await prisma.vehicle.findMany({
      where: search
        ? {
            OR: [
              { vehicleNumber: { contains: search, mode: 'insensitive' } },
              { vehicleType: { contains: search, mode: 'insensitive' } },
              { model: { contains: search, mode: 'insensitive' } },
            ],
          }
        : undefined,
      include: {
        employees: {
          select: { id: true, fullName: true, phone: true, role: true },
        },
        fuelExpenses: {
          select: { id: true, quantityLtr: true, totalAmount: true, date: true },
        },
        vehicleExpenses: {
          select: { id: true, totalAmount: true, date: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: vehicles });
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch vehicles' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { vehicleNumber, vehicleType, model, ownership, currentKm, assignedDriverId } = body;

    if (!vehicleNumber || !vehicleType) {
      return NextResponse.json(
        { success: false, error: 'Vehicle number and vehicle type are required' },
        { status: 400 }
      );
    }

    const formattedVehicleNo = vehicleNumber.trim().toUpperCase().replace(/\s+/g, '');

    // Check duplicate vehicle number
    const existing = await prisma.vehicle.findUnique({
      where: { vehicleNumber: formattedVehicleNo },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: `Vehicle with number "${formattedVehicleNo}" already exists!` },
        { status: 400 }
      );
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        vehicleNumber: formattedVehicleNo,
        vehicleType: vehicleType || 'Tractor',
        model: model || null,
        ownership: ownership || 'OWNED',
        currentKm: currentKm ? parseFloat(currentKm) : 0,
      },
    });

    // If driver is assigned, update employee's assignedVehicleId
    if (assignedDriverId) {
      await prisma.employee.update({
        where: { id: assignedDriverId },
        data: { assignedVehicleId: vehicle.id },
      });
    }

    return NextResponse.json(
      { success: true, message: 'Vehicle registered successfully', data: vehicle },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error registering vehicle:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to register vehicle' },
      { status: 500 }
    );
  }
}
