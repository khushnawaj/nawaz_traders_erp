import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  try {
    const commodities = await prisma.commodity.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { name: 'asc' },
    });

    const units = await prisma.unit.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { isBaseUnit: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: {
        commodities,
        units,
      },
    });
  } catch (error) {
    console.error('Error fetching commodities:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch commodities' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { name, localName, category } = await request.json();

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Crop name is required' },
        { status: 400 }
      );
    }

    const count = await prisma.commodity.count();
    const code = `CMD-CROP-${(count + 1).toString().padStart(3, '0')}`;

    const newCommodity = await prisma.commodity.create({
      data: {
        code,
        name,
        localName: localName || name,
        category: category || 'Grains',
        status: 'ACTIVE',
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: `New crop "${newCommodity.localName || newCommodity.name}" added successfully!`,
        data: newCommodity,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating commodity:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to add crop' },
      { status: 500 }
    );
  }
}
