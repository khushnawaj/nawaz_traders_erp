import { prisma } from '@/lib/db/prisma';
import Decimal from 'decimal.js';

/**
 * Get summary metrics for parties (Total Receivables, Total Payables, Active Farmers, Rice Mills)
 */
export async function getPartySummaryStats() {
  const parties = await prisma.party.findMany({
    where: { status: 'ACTIVE' },
    select: { openingBalance: true, balanceType: true, roles: true },
  });

  let totalReceivables = new Decimal(0);
  let totalPayables = new Decimal(0);
  let farmerCount = 0;
  let riceMillCount = 0;

  for (const p of parties) {
    const bal = new Decimal(p.openingBalance || 0);
    if (p.balanceType === 'RECEIVABLE') {
      totalReceivables = totalReceivables.plus(bal);
    } else {
      totalPayables = totalPayables.plus(bal);
    }

    if (p.roles.includes('FARMER')) farmerCount++;
    if (p.roles.includes('RICE_MILL')) riceMillCount++;
  }

  return {
    totalReceivables: totalReceivables.toString(),
    totalPayables: totalPayables.toString(),
    farmerCount,
    riceMillCount,
    totalParties: parties.length,
  };
}

/**
 * Get paginated & filtered list of parties
 */
export async function getAllParties({ search = '', role = '', status = 'ACTIVE' } = {}) {
  const where = {
    status: status ? status : undefined,
  };

  if (role && role !== 'ALL') {
    where.roles = {
      has: role,
    };
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { partyCode: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
      { city: { contains: search, mode: 'insensitive' } },
    ];
  }

  const parties = await prisma.party.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  return parties;
}

/**
 * Generate Next Unique Party Code (PRT-0001)
 */
async function generatePartyCode() {
  const count = await prisma.party.count();
  const nextNum = (count + 1).toString().padStart(4, '0');
  return `PRT-${nextNum}`;
}

/**
 * Create a new party and automatically insert Opening Balance into PartyLedger if > 0
 */
export async function createParty(data) {
  const partyCode = await generatePartyCode();

  const openingBal = new Decimal(data.openingBalance || 0);

  const newParty = await prisma.$transaction(async (tx) => {
    const party = await tx.party.create({
      data: {
        partyCode,
        name: data.name,
        phone: data.phone || null,
        alternatePhone: data.alternatePhone || null,
        address: data.address || null,
        city: data.city || null,
        state: data.state || null,
        roles: data.roles,
        openingBalance: openingBal.toNumber(),
        balanceType: data.balanceType || 'RECEIVABLE',
        notes: data.notes || null,
        status: data.status || 'ACTIVE',
        avatarUrl: data.avatarUrl || null,
        aadhaarNo: data.aadhaarNo || null,
        aadhaarDocUrl: data.aadhaarDocUrl || null,
        bankName: data.bankName || null,
        accountNo: data.accountNo || null,
        ifscCode: data.ifscCode || null,
        bankDocUrl: data.bankDocUrl || null,
        khatauniDocUrl: data.khatauniDocUrl || null,
      },
    });

    // If opening balance > 0, create initial ledger voucher entry
    if (!openingBal.isZero()) {
      const isReceivable = data.balanceType === 'RECEIVABLE';
      await tx.partyLedger.create({
        data: {
          partyId: party.id,
          voucherNo: `OPB-${party.partyCode}`,
          voucherType: 'OPENING_BALANCE',
          debit: isReceivable ? openingBal.toNumber() : 0.0,
          credit: !isReceivable ? openingBal.toNumber() : 0.0,
          runningBalance: openingBal.toNumber(),
          balanceType: data.balanceType,
          narration: 'Opening balance initialized',
        },
      });
    }

    return party;
  });

  return newParty;
}

/**
 * Get comprehensive tabbed Party Profile by ID
 */
export async function getPartyProfileById(id) {
  if (!id || typeof id !== 'string') return null;

  const party = await prisma.party.findUnique({
    where: { id },
    include: {
      ledgerEntries: {
        orderBy: { date: 'desc' },
        take: 100,
      },
      purchases: {
        orderBy: { date: 'desc' },
        take: 50,
        include: {
          godown: { select: { name: true } },
          items: {
            include: {
              commodity: { select: { name: true, localName: true } },
              unit: { select: { code: true } },
            },
          },
        },
      },
      sales: {
        orderBy: { date: 'desc' },
        take: 50,
        include: {
          godown: { select: { name: true } },
          items: {
            include: {
              commodity: { select: { name: true, localName: true } },
              unit: { select: { code: true } },
            },
          },
        },
      },
      payments: {
        orderBy: { date: 'desc' },
        take: 50,
      },
    },
  });

  return party;
}
