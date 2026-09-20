import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.date = {};
      if (startDate) dateFilter.date.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateFilter.date.lte = end;
      }
    }

    // 1. Fetch Sales Revenue
    const sales = await prisma.sale.findMany({
      where: {
        status: 'POSTED',
        ...dateFilter,
      },
      select: {
        grossAmount: true,
        totalDeductions: true,
        netAmount: true,
        receivedAmount: true,
      },
    });

    const totalSalesRevenue = sales.reduce((acc, s) => acc + (parseFloat(s.netAmount) || 0), 0);
    const totalSalesReceived = sales.reduce((acc, s) => acc + (parseFloat(s.receivedAmount) || 0), 0);

    // 2. Fetch Grain Procurement Costs
    const purchases = await prisma.purchase.findMany({
      where: {
        status: 'POSTED',
        ...dateFilter,
      },
      select: {
        grossAmount: true,
        labourCharges: true,
        gstAmount: true,
        otherExpenses: true,
        totalDeductions: true,
        netAmount: true,
        paidAmount: true,
      },
    });

    const totalProcurementCost = purchases.reduce((acc, p) => acc + (parseFloat(p.grossAmount) || 0), 0);
    const totalPurchaseLabour = purchases.reduce((acc, p) => acc + (parseFloat(p.labourCharges) || 0), 0);
    const totalPurchaseMandiTax = purchases.reduce((acc, p) => acc + (parseFloat(p.gstAmount) || 0), 0);
    const totalPurchaseFreight = purchases.reduce((acc, p) => acc + (parseFloat(p.otherExpenses) || 0), 0);
    const totalPurchaseDeductions = purchases.reduce((acc, p) => acc + (parseFloat(p.totalDeductions) || 0), 0);
    const totalNetPurchasePaid = purchases.reduce((acc, p) => acc + (parseFloat(p.paidAmount) || 0), 0);

    // 3. Fetch Vehicle Fuel Expenses (Diesel, Petrol for Trucks, Tractors, Pickups, Bikes)
    const fuelExpenses = await prisma.fuelExpense.findMany({
      where: {
        status: 'POSTED',
        ...dateFilter,
      },
      include: {
        vehicle: true,
      },
    });

    const totalFuelCost = fuelExpenses.reduce((acc, f) => acc + (parseFloat(f.totalAmount) || 0), 0);
    const bikeFuelCost = fuelExpenses
      .filter((f) => f.vehicle?.vehicleType === 'Bike')
      .reduce((acc, f) => acc + (parseFloat(f.totalAmount) || 0), 0);

    // 4. Fetch Vehicle Repair & Maintenance Expenses
    const vehicleExpenses = await prisma.vehicleExpense.findMany({
      where: {
        status: 'POSTED',
        ...dateFilter,
      },
    });

    const totalVehicleMaintenance = vehicleExpenses
      .filter((v) => ['REPAIR', 'MAINTENANCE', 'TYRE'].includes(v.category))
      .reduce((acc, v) => acc + (parseFloat(v.totalAmount) || 0), 0);

    const totalVehicleTaxInsurance = vehicleExpenses
      .filter((v) => ['ROAD_TAX', 'INSURANCE', 'PERMIT'].includes(v.category))
      .reduce((acc, v) => acc + (parseFloat(v.totalAmount) || 0), 0);

    // 5. Fetch Employee Salaries & Overtime / Advances Paid
    const employeeLedgers = await prisma.employeeLedger.findMany({
      where: {
        status: 'POSTED',
        ...dateFilter,
      },
    });

    const totalEmployeeSalaries = employeeLedgers
      .filter((e) => ['SALARY_CREDIT', 'BONUS'].includes(e.type))
      .reduce((acc, e) => acc + (parseFloat(e.credit) || 0), 0);

    const totalEmployeeAdvancesGiven = employeeLedgers
      .filter((e) => e.type === 'ADVANCE_GIVEN')
      .reduce((acc, e) => acc + (parseFloat(e.debit) || 0), 0);

    // Summary Aggregates
    const totalDirectExpenses = totalProcurementCost;
    const totalOperatingExpenses =
      totalPurchaseLabour +
      totalPurchaseFreight +
      totalPurchaseMandiTax +
      totalFuelCost +
      totalVehicleMaintenance +
      totalVehicleTaxInsurance +
      totalEmployeeSalaries;

    const totalAllExpenses = totalDirectExpenses + totalOperatingExpenses;
    const netProfitOrLoss = totalSalesRevenue - totalAllExpenses;
    const profitMargin = totalSalesRevenue > 0 ? (netProfitOrLoss / totalSalesRevenue) * 100 : 0;

    return NextResponse.json({
      success: true,
      data: {
        revenue: {
          totalSalesRevenue,
          totalSalesReceived,
          salesCount: sales.length,
        },
        cogs: {
          totalProcurementCost,
          totalPurchaseDeductions,
          purchasesCount: purchases.length,
        },
        expenses: {
          labourCharges: totalPurchaseLabour,
          freightCharges: totalPurchaseFreight,
          mandiTaxGst: totalPurchaseMandiTax,
          fuelCost: totalFuelCost,
          bikeFuelCost,
          vehicleMaintenance: totalVehicleMaintenance,
          vehicleTaxInsurance: totalVehicleTaxInsurance,
          employeeSalaries: totalEmployeeSalaries,
          employeeAdvancesGiven: totalEmployeeAdvancesGiven,
          totalOperatingExpenses,
        },
        summary: {
          totalSalesRevenue,
          totalAllExpenses,
          netProfitOrLoss,
          isProfit: netProfitOrLoss >= 0,
          profitMarginPercent: Math.round(profitMargin * 100) / 100,
        },
      },
    });
  } catch (error) {
    console.error('Error generating Profit & Loss report:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
