import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

// Helper to format currency in INR
function formatINR(amount) {
  const num = Number(amount || 0);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(num);
}

// Fetch ERP real-time context from database safely
async function getErpLiveContext() {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const context = {
    today: { salesCount: 0, salesTotal: 0, purchasesCount: 0, purchasesTotal: 0, kiranaSalesCount: 0, kiranaSalesTotal: 0 },
    month: { salesCount: 0, salesTotal: 0, purchasesCount: 0, purchasesTotal: 0 },
    parties: { total: 0, topReceivables: [], topPayables: [] },
    stock: [],
    kirana: { lowStockItems: [] },
    attendance: [],
    pendingAdvances: [],
    vehicles: { total: 0, list: [] },
    investors: { total: 0, totalPrincipal: 0, totalOutstanding: 0 },
    licenses: { total: 0, expiring: [] },
  };

  try {
    // 1. Today Sales
    try {
      const todaySales = await prisma.sale.aggregate({
        where: { createdAt: { gte: startOfDay } },
        _sum: { netAmount: true },
        _count: true,
      });
      context.today.salesCount = todaySales._count || 0;
      context.today.salesTotal = Number(todaySales._sum?.netAmount || 0);
    } catch (e) {
      console.error('Error fetching today sales:', e.message);
    }

    // 2. Today Purchases
    try {
      const todayPurchases = await prisma.purchase.aggregate({
        where: { createdAt: { gte: startOfDay } },
        _sum: { netAmount: true },
        _count: true,
      });
      context.today.purchasesCount = todayPurchases._count || 0;
      context.today.purchasesTotal = Number(todayPurchases._sum?.netAmount || 0);
    } catch (e) {
      console.error('Error fetching today purchases:', e.message);
    }

    // 3. Today Kirana Sales
    try {
      const todayKirana = await prisma.kiranaSale.aggregate({
        where: { createdAt: { gte: startOfDay } },
        _sum: { netAmount: true },
        _count: true,
      });
      context.today.kiranaSalesCount = todayKirana._count || 0;
      context.today.kiranaSalesTotal = Number(todayKirana._sum?.netAmount || 0);
    } catch (e) {
      console.error('Error fetching today kirana sales:', e.message);
    }

    // 4. Month Sales & Purchases
    try {
      const [monthSales, monthPurchases] = await Promise.all([
        prisma.sale.aggregate({
          where: { createdAt: { gte: startOfMonth } },
          _sum: { netAmount: true },
          _count: true,
        }),
        prisma.purchase.aggregate({
          where: { createdAt: { gte: startOfMonth } },
          _sum: { netAmount: true },
          _count: true,
        }),
      ]);
      context.month.salesCount = monthSales._count || 0;
      context.month.salesTotal = Number(monthSales._sum?.netAmount || 0);
      context.month.purchasesCount = monthPurchases._count || 0;
      context.month.purchasesTotal = Number(monthPurchases._sum?.netAmount || 0);
    } catch (e) {
      console.error('Error fetching monthly aggregates:', e.message);
    }

    // 5. Parties & Receivables
    try {
      const [totalCount, topReceivables, topPayables] = await Promise.all([
        prisma.party.count({ where: { status: 'ACTIVE' } }),
        prisma.party.findMany({
          where: { status: 'ACTIVE' },
          select: { id: true, partyCode: true, name: true, openingBalance: true, balanceType: true, phone: true },
          take: 5,
          orderBy: { openingBalance: 'desc' },
        }),
        prisma.party.findMany({
          where: { status: 'ACTIVE', balanceType: 'PAYABLE' },
          select: { id: true, partyCode: true, name: true, openingBalance: true, phone: true },
          take: 5,
          orderBy: { openingBalance: 'desc' },
        }),
      ]);
      context.parties.total = totalCount || 0;
      context.parties.topReceivables = topReceivables || [];
      context.parties.topPayables = topPayables || [];
    } catch (e) {
      console.error('Error fetching party data:', e.message);
    }

    // 6. Commodities & Stock
    try {
      const commodities = await prisma.commodity.findMany({
        where: { status: 'ACTIVE' },
        select: { id: true, name: true, localName: true },
      });

      const stockMovementsGroup = await prisma.stockMovement.groupBy({
        by: ['commodityId'],
        _sum: { baseQuantityKg: true },
      });

      context.stock = commodities.map((c) => {
        const group = stockMovementsGroup.find((g) => g.commodityId === c.id);
        const kg = Number(group?._sum?.baseQuantityKg || 0);
        return {
          name: c.name,
          localName: c.localName || '',
          stockKg: kg,
          stockQuintal: (kg / 100).toFixed(2),
        };
      });
    } catch (e) {
      console.error('Error fetching stock data:', e.message);
    }

    // 7. Kirana Low Stock Items
    try {
      const lowStock = await prisma.kiranaProduct.findMany({
        where: { status: 'ACTIVE' },
        select: { id: true, name: true, currentStock: true, minStockLevel: true, unit: true },
        take: 10,
      });
      context.kirana.lowStockItems = lowStock.filter(
        (item) => Number(item.currentStock) <= Number(item.minStockLevel)
      );
    } catch (e) {
      console.error('Error fetching Kirana low stock:', e.message);
    }

    // 8. Pending Advance Requests
    try {
      const pendingAdv = await prisma.advanceRequest.findMany({
        where: { status: 'PENDING' },
        select: { id: true, requestNo: true, amount: true, reason: true, requestType: true },
        take: 5,
      });
      context.pendingAdvances = pendingAdv || [];
    } catch (e) {
      console.error('Error fetching pending advances:', e.message);
    }

    // 9. Vehicles
    try {
      const vehiclesList = await prisma.vehicle.findMany({
        where: { status: 'ACTIVE' },
        select: { id: true, vehicleNumber: true, vehicleType: true, ownership: true },
        take: 5,
      });
      context.vehicles.total = vehiclesList.length;
      context.vehicles.list = vehiclesList;
    } catch (e) {
      console.error('Error fetching vehicle data:', e.message);
    }

    // 10. Investor Loans
    try {
      const invAgg = await prisma.investor.aggregate({
        where: { status: 'ACTIVE' },
        _sum: { principalAmount: true, currentOutstandingBalance: true },
        _count: true,
      });
      context.investors.total = invAgg._count || 0;
      context.investors.totalPrincipal = Number(invAgg._sum?.principalAmount || 0);
      context.investors.totalOutstanding = Number(invAgg._sum?.currentOutstandingBalance || 0);
    } catch (e) {
      console.error('Error fetching investor aggregates:', e.message);
    }

    return context;
  } catch (err) {
    console.error('Critical Error fetching ERP context:', err);
    return context;
  }
}

// Built-in smart response generator (Option 1: 100% Free Local Engine)
async function generateLocalErpResponse(userMessage, context) {
  const query = userMessage.toLowerCase().trim();

  // 1. Dashboard / Today's Summary
  if (
    query.includes('today') ||
    query.includes('summary') ||
    query.includes('overview') ||
    query.includes('dashboard') ||
    query.includes('status') ||
    query.includes('report')
  ) {
    const { today, month } = context;
    return `### 📊 **Nawaz Traders Business Summary**

* **Grain Procurement (Purchases):**
  * Entries Today: **${today.purchasesCount}**
  * Today's Net Procurement: **${formatINR(today.purchasesTotal)}**
* **Grain Wholesale Sales:**
  * Invoices Today: **${today.salesCount}**
  * Wholesale Revenue: **${formatINR(today.salesTotal)}**
* **Kirana Retail Store Sales:**
  * Retail Bills Today: **${today.kiranaSalesCount}**
  * Retail Revenue: **${formatINR(today.kiranaSalesTotal)}**

---

#### 🗓️ **This Month's Aggregates**
* **Monthly Purchases:** ${formatINR(month.purchasesTotal)} (${month.purchasesCount} vouchers)
* **Monthly Sales:** ${formatINR(month.salesTotal)} (${month.salesCount} invoices)

🔗 [View Full Analytics Dashboard](/dashboard) | [View Reports](/reports)`;
  }

  // 2. Commodity Stock / Godown Inventory
  if (
    query.includes('stock') ||
    query.includes('inventory') ||
    query.includes('paddy') ||
    query.includes('dhan') ||
    query.includes('wheat') ||
    query.includes('gehu') ||
    query.includes('godown') ||
    query.includes('grain')
  ) {
    if (!context || !context.stock || context.stock.length === 0) {
      return `### 🌾 **Grain Stock Balances**\n\nNo stock movements recorded yet. You can view or add stock in the Godowns section.\n\n🔗 [Manage Godowns & Stock](/godowns)`;
    }

    let stockTable = context.stock
      .map(
        (s) =>
          `| **${s.name}** ${s.localName ? `(${s.localName})` : ''} | **${s.stockQuintal} Quintals** | ${(s.stockKg / 1000).toFixed(2)} MT |`
      )
      .join('\n');

    return `### 🌾 **Current Grain Stock Balances**

| Commodity | Available Stock (Quintals) | Stock (Metric Tonnes) |
| :--- | :--- | :--- |
${stockTable}

---
💡 *Stock updates automatically when Purchase Parchi or Sales Invoices are posted.*

🔗 [View Stock Movements](/godowns) | [Create Purchase Parchi](/purchases/new)`;
  }

  // 3. Specific Party Search or General Party Dues
  if (
    query.includes('party') ||
    query.includes('farmer') ||
    query.includes('customer') ||
    query.includes('due') ||
    query.includes('receivable') ||
    query.includes('payable') ||
    query.includes('balance') ||
    query.includes('pending payment') ||
    query.includes('owe')
  ) {
    // Attempt party search if query has words other than standard keywords
    const searchTerms = query
      .replace(/party|farmer|customer|due|receivable|payable|balance|pending|payment|owe|show|get|search|check/g, '')
      .trim();

    if (searchTerms.length >= 2) {
      try {
        const foundParties = await prisma.party.findMany({
          where: {
            status: 'ACTIVE',
            OR: [
              { name: { contains: searchTerms, mode: 'insensitive' } },
              { partyCode: { contains: searchTerms, mode: 'insensitive' } },
              { phone: { contains: searchTerms } },
            ],
          },
          select: { id: true, partyCode: true, name: true, phone: true, openingBalance: true, balanceType: true },
          take: 5,
        });

        if (foundParties.length > 0) {
          const partyList = foundParties
            .map(
              (p) =>
                `* **${p.name}** (${p.partyCode}) — Balance: **${formatINR(p.openingBalance)}** [${p.balanceType}]\n  📞 ${p.phone || 'N/A'} | [View Ledger](/parties/${p.id})`
            )
            .join('\n\n');

          return `### 🔍 **Party Search Results for "${searchTerms}"**\n\n${partyList}\n\n--- \n🔗 [View All Parties](/parties)`;
        }
      } catch (err) {
        console.error('Error searching party for chatbot:', err);
      }
    }

    const { parties } = context;
    let recList = parties.topReceivables
      .slice(0, 5)
      .map(
        (p) =>
          `* **[${p.name}](/parties/${p.id})** (${p.partyCode}): **${formatINR(p.openingBalance)}** [${p.balanceType}]`
      )
      .join('\n');

    return `### 👤 **Parties & Financial Balances**

Total Registered Active Parties: **${parties.total}**

#### 🟢 **Top Pending Receivables (Parties owing us money)**:
${recList || '* No pending receivables logged.'}

---
🔗 [View All Parties](/parties) | [Record Payment](/payments/new) | [View Ledgers](/parties)`;
  }

  // 4. Kirana Store / Products / Retail
  if (
    query.includes('kirana') ||
    query.includes('store') ||
    query.includes('retail') ||
    query.includes('product') ||
    query.includes('pos') ||
    query.includes('low stock')
  ) {
    const { kirana, today } = context;
    let lowStockText = '';
    if (kirana.lowStockItems.length > 0) {
      lowStockText = kirana.lowStockItems
        .map((i) => `* ⚠️ **${i.name}**: Stock = **${i.currentStock} ${i.unit}** (Min: ${i.minStockLevel})`)
        .join('\n');
    } else {
      lowStockText = '✅ All Kirana items are currently well stocked!';
    }

    return `### 🛒 **Kirana Store & POS Overview**

* **Today's Retail Collection:** **${formatINR(today.kiranaSalesTotal)}** (${today.kiranaSalesCount} POS bills)

#### 📦 **Low Stock Alerts**:
${lowStockText}

---
🔗 [Open Kirana POS Billing](/kirana/pos) | [Manage Kirana Products](/kirana/products)`;
  }

  // 5. Fleet / Vehicles / Fuel
  if (
    query.includes('vehicle') ||
    query.includes('truck') ||
    query.includes('tractor') ||
    query.includes('fleet') ||
    query.includes('driver') ||
    query.includes('fuel')
  ) {
    const { vehicles } = context;
    let vList = vehicles.list
      .map((v) => `* **${v.vehicleNumber}** (${v.vehicleType}) - *${v.ownership}*`)
      .join('\n');

    return `### 🚚 **Vehicle Fleet & Transport Operations**

Active Fleet Vehicles: **${vehicles.total}**

${vList || '* No registered vehicles found.'}

---
🔗 [View Vehicle Directory](/vehicles) | [Log Fuel Expense](/vehicles/fuel) | [Vehicle Expenses](/vehicles/expenses)`;
  }

  // 6. Investor & Loans
  if (query.includes('investor') || query.includes('loan') || query.includes('emi') || query.includes('lender')) {
    const { investors } = context;
    return `### 🏦 **Investors & Active Loans**

* Active Investors / Lenders: **${investors.total}**
* Total Principal Borrowed: **${formatINR(investors.totalPrincipal)}**
* Current Outstanding Balance: **${formatINR(investors.totalOutstanding)}**

---
🔗 [Manage Investors & Loans](/investors) | [Record EMI Payment](/investors)`;
  }

  // 7. Employee / Advance / Attendance
  if (
    query.includes('employee') ||
    query.includes('staff') ||
    query.includes('advance') ||
    query.includes('salary') ||
    query.includes('attendance') ||
    query.includes('labour')
  ) {
    let advancesList = '';
    if (context.pendingAdvances && context.pendingAdvances.length > 0) {
      advancesList = context.pendingAdvances
        .map((a) => `* **${a.requestNo}** (${a.requestType}): **${formatINR(a.amount)}** - *${a.reason}*`)
        .join('\n');
    } else {
      advancesList = '✅ No pending advance requests requiring approval.';
    }

    return `### 👨‍🌾 **Staff & Employee Management**

#### ⏳ **Pending Advance Requests**:
${advancesList}

---
🔗 [Employee Directory](/employees) | [Mark Attendance](/employees/attendance) | [Advance Requests](/employees/advances)`;
  }

  // 8. Navigation / Help / Greetings
  if (
    query.includes('hi') ||
    query.includes('hello') ||
    query.includes('help') ||
    query.includes('who are you') ||
    query.includes('what can you do')
  ) {
    return `### 👋 **Namaste & Welcome to Nawaz Traders ERP Assistant!**

I am your **Option-1 100% Free ERP Database Assistant**. I can help you instantly track and manage:

* 📊 **Financial & Sales Summaries**: Ask *"Show today's summary"*
* 🌾 **Grain Stock & Godowns**: Ask *"What is the Paddy stock?"*
* 👤 **Parties & Ledgers**: Ask *"Show pending receivables"* or *"search Ramesh"*
* 🛒 **Kirana Store POS**: Ask *"Kirana sales today"*
* 👨‍🌾 **Employees & Advances**: Ask *"Pending advance requests"*
* 🚚 **Fleet & Vehicle Expenses**: Ask *"Check vehicle fleet"*
* 🏦 **Investors & Loans**: Ask *"Investor loans"*

What would you like to check right now?`;
  }

  // Fallback response with helpful links
  return `### 🤖 **Nawaz Traders ERP Assistant**

I analyzed your query: *"${userMessage}"*

Here are quick actions you can take right now:
* 📊 Check **[Today's Business Summary](/dashboard)**
* 🌾 View **[Godown & Grain Stock Balances](/godowns)**
* 👤 Search **[Parties & Customer Ledgers](/parties)**
* 📝 Create **[New Purchase Parchi](/purchases/new)** or **[Sale Invoice](/sales/new)**
* 🛒 Open **[Kirana Store POS](/kirana/pos)**

*Tip: You can ask specific questions like "What is today's sales?", "Paddy stock balance", or "Who owes money?"*`;
}

export async function POST(req) {
  try {
    const { message, history } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Get live database data safely
    const erpContext = await getErpLiveContext();

    // Option 1: 100% Free Built-in Local Engine (Zero External API Fees)
    const reply = await generateLocalErpResponse(message, erpContext);

    return NextResponse.json({
      success: true,
      reply,
      source: 'local-erp-engine-free',
    });
  } catch (error) {
    console.error('Chatbot API Error:', error);
    return NextResponse.json(
      {
        success: false,
        reply: `⚠️ Sorry, an error occurred while processing your request. Please try again.`,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
