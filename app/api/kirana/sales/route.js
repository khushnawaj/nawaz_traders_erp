import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const paymentMode = searchParams.get('paymentMode');

    const where = {};

    if (paymentMode && paymentMode !== 'ALL') {
      where.paymentMode = paymentMode;
    }

    if (search) {
      where.OR = [
        { billNo: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerPhone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const sales = await prisma.kiranaSale.findMany({
      where,
      include: {
        items: {
          include: {
            product: true,
          },
        },
        party: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ success: true, data: sales });
  } catch (error) {
    console.error('Error fetching Kirana sales:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { partyId, customerName, customerPhone, items, discountAmount, paymentMode, paidAmount } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ success: false, error: 'Cart is empty' }, { status: 400 });
    }

    let totalAmount = 0;
    const saleItemsData = items.map((item) => {
      const itemTotal = parseFloat(item.sellingPrice) * parseFloat(item.quantity);
      totalAmount += itemTotal;
      return {
        productId: item.productId,
        unit: item.unit || 'Pcs',
        quantity: parseFloat(item.quantity),
        sellingPrice: parseFloat(item.sellingPrice),
        totalAmount: itemTotal,
      };
    });

    const discount = parseFloat(discountAmount || 0);
    const netAmount = Math.max(0, totalAmount - discount);
    const paid = parseFloat(paidAmount !== undefined ? paidAmount : (paymentMode === 'CREDIT' ? 0 : netAmount));
    const due = Math.max(0, netAmount - paid);

    const paymentStatus = due === 0 ? 'PAID' : paid === 0 ? 'UNPAID' : 'PARTIAL';

    const count = await prisma.kiranaSale.count();
    const billNo = `KRN-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    // Auto-match Farmer Party if phone or name matches existing Party record
    let resolvedPartyId = partyId || null;
    if (!resolvedPartyId && (customerPhone || customerName)) {
      const match = await prisma.party.findFirst({
        where: {
          OR: [
            customerPhone ? { phone: customerPhone } : undefined,
            customerName ? { name: { equals: customerName, mode: 'insensitive' } } : undefined,
          ].filter(Boolean),
        },
      });
      if (match) resolvedPartyId = match.id;
    }

    const result = await prisma.$transaction(async (tx) => {
      const sale = await tx.kiranaSale.create({
        data: {
          billNo,
          partyId: resolvedPartyId,
          customerName: customerName || 'Counter Customer',
          customerPhone: customerPhone || null,
          totalAmount,
          discountAmount: discount,
          netAmount,
          paidAmount: paid,
          dueAmount: due,
          paymentMode,
          paymentStatus,
          items: {
            create: saleItemsData,
          },
        },
        include: {
          items: { include: { product: true } },
          party: true,
        },
      });

      for (const item of items) {
        await tx.kiranaProduct.update({
          where: { id: item.productId },
          data: {
            currentStock: {
              decrement: parseFloat(item.quantity),
            },
          },
        });
      }

      if (resolvedPartyId && due > 0) {
        const party = await tx.party.findUnique({ where: { id: resolvedPartyId } });
        if (party) {
          const newBalance = party.balanceType === 'RECEIVABLE'
            ? parseFloat(party.openingBalance) + due
            : parseFloat(party.openingBalance) - due;

          // 1. Update Party Opening Balance
          await tx.party.update({
            where: { id: resolvedPartyId },
            data: {
              openingBalance: Math.abs(newBalance),
              balanceType: newBalance >= 0 ? 'RECEIVABLE' : 'PAYABLE',
            },
          });

          // 2. Add Party Ledger Entry for Farmer Profile
          await tx.partyLedger.create({
            data: {
              partyId: resolvedPartyId,
              voucherNo: billNo,
              voucherType: 'KIRANA_CREDIT_SALE',
              debit: due,
              credit: 0,
              runningBalance: Math.abs(newBalance),
              balanceType: newBalance >= 0 ? 'RECEIVABLE' : 'PAYABLE',
              narration: `Kirana Store Udhaar Purchase (Advance) #${billNo} (${customerName})`,
              referenceId: sale.id,
            },
          });

          // 3. Post to AdvanceRequest as APPROVED Farmer Advance
          const advCount = await tx.advanceRequest.count();
          const reqNo = `KRN-ADV-${String(advCount + 1).padStart(4, '0')}`;

          await tx.advanceRequest.create({
            data: {
              requestNo: reqNo,
              requestType: 'FARMER',
              partyId: resolvedPartyId,
              amount: due,
              reason: `Kirana Shop Udhaar Purchase Bill #${billNo}`,
              status: 'APPROVED',
              disbursedMode: 'KIRANA_STORE_CREDIT',
              accountName: 'Kirana Store Udhaar Counter',
              notes: `Items purchased on credit from Kirana Store. Bill #${billNo}. Deductible from grain settlement.`,
            },
          });
        }
      }

      return sale;
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error creating Kirana sale:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
