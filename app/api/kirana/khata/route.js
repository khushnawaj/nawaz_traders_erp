import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(request) {
  try {
    // 1. Fetch all Parties (Farmers, Customers)
    const parties = await prisma.party.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { name: 'asc' },
    });

    // 2. Fetch all Kirana sales
    const storeSales = await prisma.kiranaSale.findMany({
      include: {
        party: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // 3. Fetch all Payment Transactions linked to Party / Kirana Khata
    const paymentTxns = await prisma.paymentTransaction.findMany({
      where: {
        OR: [
          { paymentType: 'KIRANA_JAMA' },
          { remarks: { contains: 'Kirana', mode: 'insensitive' } },
          { remarks: { contains: 'Store Jama', mode: 'insensitive' } },
        ],
      },
      include: {
        party: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // 4. Group and construct per-customer passbook registers
    const khataMap = {};

    // Seed khataMap with registered Parties first
    parties.forEach((party) => {
      const initBal = party.balanceType === 'RECEIVABLE'
        ? parseFloat(party.openingBalance || 0)
        : -parseFloat(party.openingBalance || 0);

      khataMap[party.id] = {
        id: party.id,
        partyId: party.id,
        partyCode: party.partyCode,
        name: party.name,
        phone: party.phone || 'N/A',
        city: party.city || 'Robertsganj, Sonebhadra',
        totalUdhaarTaken: initBal > 0 ? initBal : 0,
        totalJamaPaid: 0,
        currentBalance: initBal,
        firstTransactionDate: party.createdAt,
        lastTransactionDate: party.createdAt,
        ledger: initBal > 0 ? [{
          id: `INIT-${party.id}`,
          date: party.createdAt,
          type: 'OPENING_BALANCE',
          billNo: 'OPENING-BAL',
          particulars: 'Previous Left Due Opening Balance',
          debitAmount: initBal,
          creditAmount: 0,
          dueAdded: initBal,
          runningBalance: initBal,
          paymentMode: 'OPENING_DUE',
        }] : [],
      };
    });

    storeSales.forEach((sale) => {
      const key = sale.partyId || sale.customerPhone || sale.customerName || 'WALK-IN';
      if (!khataMap[key]) {
        khataMap[key] = {
          id: key,
          partyId: sale.partyId || null,
          partyCode: sale.party?.partyCode || 'STORE-CUST',
          name: sale.customerName || sale.party?.name || 'Counter Customer',
          phone: sale.customerPhone || sale.party?.phone || 'N/A',
          city: sale.party?.city || 'Robertsganj, Sonebhadra',
          totalUdhaarTaken: 0,
          totalJamaPaid: 0,
          currentBalance: 0,
          firstTransactionDate: sale.createdAt,
          lastTransactionDate: sale.createdAt,
          ledger: [],
        };
      }

      const cust = khataMap[key];
      const saleAmount = parseFloat(sale.netAmount || 0);
      const paidAtTimeOfSale = parseFloat(sale.paidAmount || 0);
      const netUdhaarAdded = parseFloat(sale.dueAmount || 0);

      cust.totalUdhaarTaken += saleAmount;
      cust.totalJamaPaid += paidAtTimeOfSale;
      cust.currentBalance += netUdhaarAdded;
      cust.lastTransactionDate = sale.createdAt;

      // Add Credit Bill entry to customer's passbook
      cust.ledger.push({
        id: sale.id,
        date: sale.createdAt,
        type: sale.paymentMode === 'CREDIT' ? 'UDHAAR_SALE' : 'CASH_SALE',
        billNo: sale.billNo,
        particulars: sale.items?.map((i) => `${i.name || i.product?.name} (${i.quantity} ${i.unit})`).join(', ') || 'Grocery Sale',
        debitAmount: saleAmount, // Udhaar Taken
        creditAmount: paidAtTimeOfSale, // Paid
        dueAdded: netUdhaarAdded,
        runningBalance: cust.currentBalance,
        paymentMode: sale.paymentMode,
        items: sale.items,
      });
    });

    // Integrate standalone Jama Payment transactions
    paymentTxns.forEach((tx) => {
      const key = tx.partyId || 'WALK-IN';
      if (khataMap[key]) {
        const cust = khataMap[key];
        const jamaAmt = parseFloat(tx.amount || 0);

        cust.totalJamaPaid += jamaAmt;
        cust.currentBalance = Math.max(0, cust.currentBalance - jamaAmt);
        cust.lastTransactionDate = tx.createdAt;

        cust.ledger.push({
          id: tx.id,
          date: tx.createdAt,
          type: 'JAMA_PAYMENT',
          billNo: tx.txnNo || `JAMA-${tx.id.substring(0, 6)}`,
          particulars: tx.remarks || `Udhaar Recovery Payment via ${tx.paymentMode}`,
          debitAmount: 0,
          creditAmount: jamaAmt,
          dueAdded: -jamaAmt,
          runningBalance: cust.currentBalance,
          paymentMode: tx.paymentMode,
        });
      }
    });

    // Sort customer passbooks by most recent activity
    const khataParties = Object.values(khataMap).map((cust) => {
      cust.ledger.sort((a, b) => new Date(b.date) - new Date(a.date));
      return cust;
    });

    khataParties.sort((a, b) => new Date(b.lastTransactionDate) - new Date(a.lastTransactionDate));

    // Calculate total active store udhaar
    const totalStoreUdhaar = khataParties.reduce((sum, p) => sum + Math.max(0, p.currentBalance), 0);

    // Fetch Store Employees
    const storeEmployees = await prisma.employee.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: {
        khataParties,
        storeSales: storeSales.reverse(),
        employees: storeEmployees,
        totalStoreUdhaar,
      },
    });
  } catch (error) {
    console.error('Error fetching Kirana Khata Daily Register:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { partyId, customerName, customerPhone, amount, paymentMode, notes } = body;

    const parsedAmount = parseFloat(amount || 0);
    if (!parsedAmount || parsedAmount <= 0) {
      return NextResponse.json({ success: false, error: 'Enter valid Jama amount' }, { status: 400 });
    }

    // 1. If linked to a Party (e.g. Farmer), create a PaymentTransaction and update Party balance
    let createdTxn = null;
    if (partyId) {
      const party = await prisma.party.findUnique({ where: { id: partyId } });
      if (party) {
        const txnNo = `JAMA-${Date.now().toString().slice(-6)}`;
        createdTxn = await prisma.paymentTransaction.create({
          data: {
            txnNo,
            partyId,
            amount: parsedAmount,
            type: 'PAYMENT_RECEIVED',
            paymentMode: paymentMode || 'CASH',
            paymentType: 'KIRANA_JAMA',
            remarks: notes ? `Kirana Store Udhaar Jama: ${notes}` : 'Kirana Store Udhaar Recovery Jama Payment',
            status: 'POSTED',
          },
        });

        // Deduct balance from party ledger
        const partyBal = party.balanceType === 'RECEIVABLE'
          ? parseFloat(party.openingBalance || 0)
          : -parseFloat(party.openingBalance || 0);
        const newBal = partyBal - parsedAmount;

        await prisma.party.update({
          where: { id: partyId },
          data: {
            openingBalance: Math.abs(newBal),
            balanceType: newBal >= 0 ? 'RECEIVABLE' : 'PAYABLE',
          },
        });
      }
    }

    // 2. Reduce dueAmount on pending KiranaSales for this customer/party
    const whereClause = partyId
      ? { partyId, dueAmount: { gt: 0 } }
      : customerPhone
      ? { customerPhone, dueAmount: { gt: 0 } }
      : { customerName, dueAmount: { gt: 0 } };

    const pendingSales = await prisma.kiranaSale.findMany({
      where: whereClause,
      orderBy: { createdAt: 'asc' },
    });

    let remainingJama = parsedAmount;
    for (const sale of pendingSales) {
      if (remainingJama <= 0) break;

      const saleDue = parseFloat(sale.dueAmount);
      const applyAmt = Math.min(saleDue, remainingJama);

      const newPaid = parseFloat(sale.paidAmount) + applyAmt;
      const newDue = saleDue - applyAmt;

      await prisma.kiranaSale.update({
        where: { id: sale.id },
        data: {
          paidAmount: newPaid,
          dueAmount: newDue,
          paymentStatus: newDue <= 0 ? 'PAID' : 'PARTIAL',
        },
      });

      remainingJama -= applyAmt;
    }

    return NextResponse.json({
      success: true,
      message: `₹${parsedAmount.toFixed(2)} Store Udhaar Jama recorded successfully!`,
      txn: createdTxn,
    });
  } catch (error) {
    console.error('Error saving Kirana Jama payment:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
