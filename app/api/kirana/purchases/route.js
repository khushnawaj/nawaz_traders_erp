import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(request) {
  try {
    const purchases = await prisma.kiranaPurchase.findMany({
      include: {
        items: {
          include: {
            product: true,
          },
        },
        party: true,
      },
      orderBy: { date: 'desc' },
      take: 100,
    });

    // Group purchases by Mandi Supplier
    const supplierMap = {};
    purchases.forEach((p) => {
      const key = p.supplierName?.toLowerCase().trim() || 'GENERAL_MANDI';
      if (!supplierMap[key]) {
        supplierMap[key] = {
          supplierName: p.supplierName,
          supplierPhone: p.supplierPhone || 'N/A',
          partyId: p.partyId || null,
          totalPurchased: 0,
          totalPaid: 0,
          totalDue: 0,
          purchasesCount: 0,
          lastInwardDate: p.date,
          history: [],
        };
      }

      const supp = supplierMap[key];
      const net = parseFloat(p.netAmount || 0);
      const paid = parseFloat(p.paidAmount || 0);
      const due = parseFloat(p.dueAmount || 0);

      supp.totalPurchased += net;
      supp.totalPaid += paid;
      supp.totalDue += due;
      supp.purchasesCount += 1;
      if (new Date(p.date) > new Date(supp.lastInwardDate)) {
        supp.lastInwardDate = p.date;
      }
      supp.history.push(p);
    });

    const supplierLedgers = Object.values(supplierMap).sort((a, b) => b.totalDue - a.totalDue);

    const totalInwardCost = purchases.reduce((sum, p) => sum + parseFloat(p.netAmount || 0), 0);
    const totalSupplierDue = purchases.reduce((sum, p) => sum + parseFloat(p.dueAmount || 0), 0);

    return NextResponse.json({
      success: true,
      data: purchases,
      supplierLedgers,
      summary: {
        totalInwardCost,
        totalSupplierDue,
        totalReceipts: purchases.length,
        totalSuppliers: supplierLedgers.length,
      },
    });
  } catch (error) {
    console.error('Error fetching Kirana stock purchases:', error);
    return NextResponse.json({ success: false, error: String(error.message || error) }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    // ACTION 1: Record Cash / UPI Payout to Mandi Supplier
    if (body.action === 'RECORD_SUPPLIER_PAYOUT') {
      const { supplierName, supplierPhone, partyId: incomingPartyId, amount, paymentMode, notes } = body;
      const parsedAmount = parseFloat(amount || 0);

      if (!parsedAmount || parsedAmount <= 0) {
        return NextResponse.json({ success: false, error: 'Enter valid payout amount' }, { status: 400 });
      }

      if (!supplierName) {
        return NextResponse.json({ success: false, error: 'Supplier Name is required' }, { status: 400 });
      }

      // Resolve partyId if missing
      let partyId = incomingPartyId;
      if (!partyId && supplierName) {
        const existingParty = await prisma.party.findFirst({
          where: {
            name: { equals: supplierName.trim(), mode: 'insensitive' },
            roles: { hasSome: ['SUPPLIER', 'VENDOR'] },
          },
        });
        if (existingParty) {
          partyId = existingParty.id;
        }
      }

      // Find pending KiranaPurchase records for this supplier
      const whereClause = partyId
        ? { partyId, dueAmount: { gt: 0 } }
        : supplierPhone
        ? { supplierPhone, dueAmount: { gt: 0 } }
        : { supplierName: { equals: supplierName, mode: 'insensitive' }, dueAmount: { gt: 0 } };

      const pendingPurchases = await prisma.kiranaPurchase.findMany({
        where: whereClause,
        orderBy: { date: 'asc' },
      });

      let remainingPayout = parsedAmount;
      for (const pur of pendingPurchases) {
        if (remainingPayout <= 0) break;
        const purDue = parseFloat(pur.dueAmount);
        const applyAmt = Math.min(purDue, remainingPayout);

        const newPaid = parseFloat(pur.paidAmount) + applyAmt;
        const newDue = purDue - applyAmt;

        await prisma.kiranaPurchase.update({
          where: { id: pur.id },
          data: {
            paidAmount: newPaid,
            dueAmount: newDue,
            paymentStatus: newDue <= 0 ? 'PAID' : 'PARTIAL',
          },
        });

        remainingPayout -= applyAmt;
      }

      // If linked to Party, update Party balance & create PartyLedger entry
      let createdTxn = null;
      if (partyId) {
        const party = await prisma.party.findUnique({ where: { id: partyId } });
        if (party) {
          const txnNo = `SUPP-PAY-${Date.now().toString().slice(-6)}`;
          
          const partyBal = party.balanceType === 'PAYABLE'
            ? parseFloat(party.openingBalance || 0)
            : -parseFloat(party.openingBalance || 0);
          const newBal = partyBal - parsedAmount;

          await prisma.party.update({
            where: { id: partyId },
            data: {
              openingBalance: Math.abs(newBal),
              balanceType: newBal >= 0 ? 'PAYABLE' : 'RECEIVABLE',
            },
          });

          await prisma.partyLedger.create({
            data: {
              partyId,
              voucherNo: txnNo,
              voucherType: 'PAYMENT_MADE',
              debit: parsedAmount,
              credit: 0,
              runningBalance: Math.abs(newBal),
              balanceType: newBal >= 0 ? 'PAYABLE' : 'RECEIVABLE',
              narration: notes ? `Mandi Supplier Payout: ${notes}` : `Cash Payout to Mandi Supplier ${supplierName}`,
              referenceId: txnNo,
            },
          });
        }
      }

      return NextResponse.json({
        success: true,
        message: `₹${parsedAmount.toFixed(2)} Payout recorded for Mandi Supplier ${supplierName}!`,
        txn: createdTxn,
      });
    }

    // ACTION 2: Save New Mandi Stock Inward Purchase
    const {
      date,
      supplierName,
      supplierPhone,
      invoiceNo,
      partyId,
      items, // array of { productId, itemName, unit, quantity, purchasePrice }
      taxCharges, // Mandi Shulk, Freight, Palledari, Taxes
      paidAmount,
      paymentMode,
      parchiDocUrl,
      notes,
    } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ success: false, error: 'Inward purchase items list is empty' }, { status: 400 });
    }

    if (!supplierName) {
      return NextResponse.json({ success: false, error: 'Supplier / Mandi Trader name is required' }, { status: 400 });
    }

    let totalItemCost = 0;
    const purchaseItemsData = [];

    // Calculate item costs and prepare items data
    for (const item of items) {
      const qty = parseFloat(item.quantity || 1);
      const price = parseFloat(item.purchasePrice || 0);
      const itemTotal = qty * price;
      totalItemCost += itemTotal;

      purchaseItemsData.push({
        productId: item.productId || null,
        itemName: item.itemName,
        unit: item.unit || 'Kg',
        quantity: qty,
        purchasePrice: price,
        totalAmount: itemTotal,
      });
    }

    const taxes = parseFloat(taxCharges || 0);
    const netAmount = totalItemCost + taxes;
    const paid = parseFloat(paidAmount !== undefined ? paidAmount : (paymentMode === 'CREDIT' ? 0 : netAmount));
    const due = Math.max(0, netAmount - paid);
    const paymentStatus = due === 0 ? 'PAID' : paid === 0 ? 'UNPAID' : 'PARTIAL';

    const count = await prisma.kiranaPurchase.count();
    const purchaseNo = `KRN-INW-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Resolve or auto-create Party for Mandi Supplier with SUPPLIER role
      let resolvedPartyId = partyId || null;

      if (!resolvedPartyId && supplierName) {
        const existingParty = await tx.party.findFirst({
          where: {
            name: { equals: supplierName.trim(), mode: 'insensitive' },
            roles: { hasSome: ['SUPPLIER', 'VENDOR'] },
          },
        });

        if (existingParty) {
          resolvedPartyId = existingParty.id;
        } else {
          const partyCount = await tx.party.count();
          const partyCode = `PRT-SUP-${String(partyCount + 1).padStart(4, '0')}`;
          const newParty = await tx.party.create({
            data: {
              partyCode,
              name: supplierName.trim(),
              phone: supplierPhone ? supplierPhone.trim() : null,
              roles: ['SUPPLIER'],
              balanceType: 'PAYABLE',
              openingBalance: 0,
              status: 'ACTIVE',
              notes: 'Auto-created Mandi Supplier from Kirana Stock Inward',
            },
          });
          resolvedPartyId = newParty.id;
        }
      }

      // 2. Create Kirana Inward Purchase Record
      const purchaseRecord = await tx.kiranaPurchase.create({
        data: {
          purchaseNo,
          date: date ? new Date(date) : new Date(),
          supplierName: supplierName.trim(),
          supplierPhone: supplierPhone || null,
          invoiceNo: invoiceNo || null,
          partyId: resolvedPartyId,
          totalItemCost,
          taxCharges: taxes,
          netAmount,
          paidAmount: paid,
          dueAmount: due,
          paymentMode,
          paymentStatus,
          parchiDocUrl: parchiDocUrl || null,
          notes: notes || null,
          items: {
            create: purchaseItemsData,
          },
        },
        include: {
          items: { include: { product: true } },
          party: true,
        },
      });

      // 3. Automatically Increase Product Inventory Stock & Update Purchase/Selling Rates & MRP
      for (const item of items) {
        if (item.productId) {
          await tx.kiranaProduct.update({
            where: { id: item.productId },
            data: {
              currentStock: {
                increment: parseFloat(item.quantity || 0),
              },
              purchasePrice: parseFloat(item.purchasePrice || 0),
              sellingPrice: item.sellingPrice ? parseFloat(item.sellingPrice) : undefined,
              mrp: item.mrp ? parseFloat(item.mrp) : undefined,
              unit: item.unit || undefined,
            },
          });
        }
      }

      // 4. If Supplier is linked to a Party and there's a due amount, update Party Ledger
      if (resolvedPartyId && due > 0) {
        const party = await tx.party.findUnique({ where: { id: resolvedPartyId } });
        if (party) {
          const newBalance = party.balanceType === 'PAYABLE'
            ? parseFloat(party.openingBalance) + due
            : parseFloat(party.openingBalance) - due;

          await tx.party.update({
            where: { id: resolvedPartyId },
            data: {
              openingBalance: Math.abs(newBalance),
              balanceType: newBalance >= 0 ? 'PAYABLE' : 'RECEIVABLE',
            },
          });

          await tx.partyLedger.create({
            data: {
              partyId: resolvedPartyId,
              voucherNo: purchaseNo,
              voucherType: 'KIRANA_STOCK_INWARD',
              debit: 0,
              credit: due,
              runningBalance: Math.abs(newBalance),
              balanceType: newBalance >= 0 ? 'PAYABLE' : 'RECEIVABLE',
              narration: `Kirana Stock Inward Bill #${purchaseNo} from ${supplierName}`,
              referenceId: purchaseRecord.id,
            },
          });
        }
      }

      return purchaseRecord;
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error creating Kirana purchase:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
