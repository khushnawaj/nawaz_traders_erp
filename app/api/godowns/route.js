import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  try {
    const godowns = await prisma.godown.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { name: 'asc' },
      include: {
        stockMovements: {
          include: {
            commodity: { select: { id: true, name: true, localName: true } },
          },
        },
      },
    });

    // Calculate live stock summary per godown
    const formattedGodowns = godowns.map((g) => {
      // Group stock movements by commodity
      const stockByCommodity = {};
      let totalStockKg = 0;

      (g.stockMovements || []).forEach((m) => {
        const cmdName = m.commodity?.localName || m.commodity?.name || 'Unknown Grain';
        const kg = parseFloat(m.baseQuantityKg) || 0;

        if (!stockByCommodity[cmdName]) {
          stockByCommodity[cmdName] = 0;
        }
        stockByCommodity[cmdName] += kg;
        totalStockKg += kg;
      });

      // Convert KG to Quintal
      const totalStockQtl = totalStockKg / 100;
      const totalStockMT = totalStockKg / 1000;

      const formattedStock = Object.entries(stockByCommodity).map(([name, kg]) => ({
        commodityName: name,
        stockKg: kg,
        stockQtl: kg / 100,
        stockMT: kg / 1000,
      }));

      return {
        id: g.id,
        code: g.code,
        name: g.name,
        location: g.location,
        capacity: g.capacity ? parseFloat(g.capacity) : 0,
        supervisor: g.supervisor,
        status: g.status,
        totalStockKg,
        totalStockQtl,
        totalStockMT,
        stockBreakdown: formattedStock,
        totalMovements: g.stockMovements?.length || 0,
      };
    });

    return NextResponse.json({
      success: true,
      data: formattedGodowns,
    });
  } catch (error) {
    console.error('Error fetching godowns:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch godowns' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    if (!body.name) {
      return NextResponse.json(
        { success: false, error: 'Godown name is required' },
        { status: 400 }
      );
    }

    // Auto-generate Godown Code if missing
    let code = body.code;
    if (!code) {
      const count = await prisma.godown.count();
      code = `GDN-${(count + 1).toString().padStart(2, '0')}`;
    }

    const godown = await prisma.godown.create({
      data: {
        code,
        name: body.name,
        location: body.location || '',
        capacity: body.capacity ? parseFloat(body.capacity) : 0,
        supervisor: body.supervisor || '',
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Godown created successfully!',
        data: godown,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating godown:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create godown' },
      { status: 500 }
    );
  }
}
