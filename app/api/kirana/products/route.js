import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const where = { status: 'ACTIVE' };

    if (category && category !== 'ALL') {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { localName: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { barcode: { contains: search, mode: 'insensitive' } },
      ];
    }

    const products = await prisma.kiranaProduct.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    console.error('Error fetching Kirana products:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    // 1. Bulk Batch Product & Stock Import
    if (body.bulkItems && Array.isArray(body.bulkItems)) {
      const results = [];
      for (const item of body.bulkItems) {
        if (!item.name) continue;

        // Check if product already exists by name or SKU
        const existing = await prisma.kiranaProduct.findFirst({
          where: {
            OR: [
              { name: { equals: item.name, mode: 'insensitive' } },
              item.barcode ? { barcode: item.barcode } : undefined,
            ].filter(Boolean),
          },
        });

        if (existing) {
          // Increment existing stock
          const updated = await prisma.kiranaProduct.update({
            where: { id: existing.id },
            data: {
              currentStock: {
                increment: parseFloat(item.currentStock || item.quantity || 0),
              },
              sellingPrice: item.sellingPrice ? parseFloat(item.sellingPrice) : existing.sellingPrice,
              mrp: item.mrp ? parseFloat(item.mrp) : existing.mrp,
              purchasePrice: item.purchasePrice ? parseFloat(item.purchasePrice) : existing.purchasePrice,
              unit: item.unit || existing.unit,
            },
          });
          results.push(updated);
        } else {
          // Create new product
          const count = await prisma.kiranaProduct.count();
          const sku = `KRN-PRD-${String(count + 1).padStart(3, '0')}`;

          const created = await prisma.kiranaProduct.create({
            data: {
              sku,
              barcode: item.barcode || null,
              name: item.name,
              localName: item.localName || null,
              category: item.category || 'Groceries & Spices',
              mrp: parseFloat(item.mrp || item.sellingPrice || 10),
              purchasePrice: parseFloat(item.purchasePrice || 0),
              sellingPrice: parseFloat(item.sellingPrice || item.mrp || 10),
              unit: item.unit || 'Kg',
              currentStock: parseFloat(item.currentStock || item.quantity || 0),
              minStockLevel: parseFloat(item.minStockLevel || 5),
            },
          });
          results.push(created);
        }
      }

      return NextResponse.json({
        success: true,
        message: `Successfully processed ${results.length} inventory items!`,
        data: results,
      });
    }

    // 2. Quick Stock Adjustment on Single Product
    if (body.action === 'QUICK_STOCK_ADJUST' && body.productId) {
      const adjustment = parseFloat(body.stockChange || 0);
      const updated = await prisma.kiranaProduct.update({
        where: { id: body.productId },
        data: {
          currentStock: {
            increment: adjustment,
          },
        },
      });
      return NextResponse.json({ success: true, data: updated });
    }

    // 3. Single Product Creation
    const { name, localName, category, mrp, purchasePrice, sellingPrice, unit, currentStock, minStockLevel, barcode } = body;

    const count = await prisma.kiranaProduct.count();
    const sku = `KRN-PRD-${String(count + 1).padStart(3, '0')}`;

    const product = await prisma.kiranaProduct.create({
      data: {
        sku,
        barcode: barcode || null,
        name,
        localName: localName || null,
        category: category || 'Groceries & Spices',
        mrp: parseFloat(mrp || sellingPrice),
        purchasePrice: parseFloat(purchasePrice || 0),
        sellingPrice: parseFloat(sellingPrice || mrp),
        unit: unit || 'Kg',
        currentStock: parseFloat(currentStock || 0),
        minStockLevel: parseFloat(minStockLevel || 5),
      },
    });

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error('Error creating Kirana product:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, name, localName, category, mrp, purchasePrice, sellingPrice, unit, currentStock, minStockLevel, barcode } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID is required' }, { status: 400 });
    }

    const updated = await prisma.kiranaProduct.update({
      where: { id },
      data: {
        name,
        localName: localName || null,
        category,
        mrp: mrp !== undefined ? parseFloat(mrp) : undefined,
        purchasePrice: purchasePrice !== undefined ? parseFloat(purchasePrice) : undefined,
        sellingPrice: sellingPrice !== undefined ? parseFloat(sellingPrice) : undefined,
        unit,
        currentStock: currentStock !== undefined ? parseFloat(currentStock) : undefined,
        minStockLevel: minStockLevel !== undefined ? parseFloat(minStockLevel) : undefined,
        barcode: barcode || null,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating Kirana product:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
