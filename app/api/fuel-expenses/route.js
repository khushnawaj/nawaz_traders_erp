import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import Decimal from 'decimal.js';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const vehicleId = searchParams.get('vehicleId');

    const expenses = await prisma.fuelExpense.findMany({
      where: vehicleId ? { vehicleId } : undefined,
      include: {
        vehicle: { select: { id: true, vehicleNumber: true, vehicleType: true } },
        driver: { select: { id: true, fullName: true, phone: true } },
        vendor: { select: { id: true, name: true } },
      },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json({ success: true, data: expenses });
  } catch (error) {
    console.error('Error fetching fuel expenses:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch fuel expenses' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      date,
      vehicleId,
      driverId,
      vendorId,
      fuelType,
      quantityLtr,
      ratePerLtr,
      odometerKm,
      receiptNo,
      notes,
    } = body;

    if (!vehicleId || !quantityLtr || parseFloat(quantityLtr) <= 0) {
      return NextResponse.json(
        { success: false, error: 'Vehicle and valid quantity in liters are required' },
        { status: 400 }
      );
    }

    const ltrDecimal = new Decimal(quantityLtr);
    const rateDecimal = new Decimal(ratePerLtr || 0);
    const totalAmtDecimal = ltrDecimal.times(rateDecimal);

    // Generate unique expense number FUL-2026-0001
    const count = await prisma.fuelExpense.count();
    const expNo = `FUL-2026-${(count + 1).toString().padStart(4, '0')}`;

    const expDate = date ? new Date(date) : new Date();

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create FuelExpense record
      const fuelExp = await tx.fuelExpense.create({
        data: {
          expenseNo: expNo,
          date: expDate,
          vehicleId,
          driverId: driverId || null,
          vendorId: vendorId || null,
          fuelType: fuelType || 'DIESEL',
          quantityLtr: ltrDecimal.toNumber(),
          ratePerLtr: rateDecimal.toNumber(),
          totalAmount: totalAmtDecimal.toNumber(),
          odometerKm: odometerKm ? parseFloat(odometerKm) : null,
          receiptNo: receiptNo || null,
          notes: notes || null,
          status: 'POSTED',
        },
      });

      // 2. Update Vehicle odometer currentKm if provided and higher
      if (odometerKm && parseFloat(odometerKm) > 0) {
        await tx.vehicle.update({
          where: { id: vehicleId },
          data: { currentKm: parseFloat(odometerKm) },
        });
      }

      // 3. If vendorId (Diesel Pump Party) is selected and totalAmount > 0, post to Party Ledger (we owe diesel pump)
      if (vendorId && totalAmtDecimal.greaterThan(0)) {
        const vendor = await tx.party.findUnique({
          where: { id: vendorId },
          select: { id: true, openingBalance: true, balanceType: true },
        });

        if (vendor) {
          const currentBal = new Decimal(vendor.openingBalance || 0);
          let newBal = currentBal;
          let newBalType = vendor.balanceType;

          if (vendor.balanceType === 'PAYABLE') {
            newBal = currentBal.plus(totalAmtDecimal);
          } else {
            newBal = currentBal.minus(totalAmtDecimal);
            if (newBal.isNegative()) {
              newBal = newBal.abs();
              newBalType = 'PAYABLE';
            }
          }

          await tx.party.update({
            where: { id: vendorId },
            data: {
              openingBalance: newBal.toNumber(),
              balanceType: newBalType,
            },
          });

          await tx.partyLedger.create({
            data: {
              partyId: vendorId,
              voucherNo: expNo,
              voucherType: 'DIESEL_FILLING',
              debit: 0.0,
              credit: totalAmtDecimal.toNumber(),
              runningBalance: newBal.toNumber(),
              balanceType: newBalType,
              narration: notes || `Diesel Filling ${expNo} (${quantityLtr} Ltr @ ₹${ratePerLtr})`,
              referenceId: fuelExp.id,
              status: 'POSTED',
            },
          });
        }
      }

      return fuelExp;
    });

    return NextResponse.json(
      { success: true, message: 'Diesel filling recorded successfully', data: result },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error recording fuel expense:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to record fuel expense' },
      { status: 500 }
    );
  }
}
