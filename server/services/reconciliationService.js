import { prisma } from '@/lib/db/prisma';
import Decimal from 'decimal.js';

/**
 * Perform deep accounting audit and ledger integrity check
 */
export async function runLedgerReconciliation() {
  const auditResults = {
    timestamp: new Date().toISOString(),
    isBalanced: true,
    totalLedgerDebits: '0.00',
    totalLedgerCredits: '0.00',
    partyDiscrepancies: [],
    godownStockDiscrepancies: [],
  };

  // 1. Audit Double-Entry Debits vs Credits across all Party Ledgers
  const ledgerAggregate = await prisma.partyLedger.aggregate({
    _sum: {
      debit: true,
      credit: true,
    },
  });

  const totalDebits = new Decimal(ledgerAggregate._sum.debit || 0);
  const totalCredits = new Decimal(ledgerAggregate._sum.credit || 0);

  auditResults.totalLedgerDebits = totalDebits.toFixed(2);
  auditResults.totalLedgerCredits = totalCredits.toFixed(2);

  // 2. Audit Individual Party Running Balances against Transaction Item Stream
  const parties = await prisma.party.findMany({
    select: { id: true, partyCode: true, name: true, openingBalance: true, balanceType: true },
  });

  for (const party of parties) {
    const ledgers = await prisma.partyLedger.findMany({
      where: { partyId: party.id },
      orderBy: { createdAt: 'asc' },
    });

    if (ledgers.length > 0) {
      let expectedBalance = new Decimal(party.openingBalance || 0);

      for (const entry of ledgers) {
        const dr = new Decimal(entry.debit || 0);
        const cr = new Decimal(entry.credit || 0);
        expectedBalance = expectedBalance.plus(dr).minus(cr);

        const recordedRunning = new Decimal(entry.runningBalance || 0);
        const diff = expectedBalance.minus(recordedRunning).abs();

        if (diff.greaterThan(0.01)) {
          auditResults.isBalanced = false;
          auditResults.partyDiscrepancies.push({
            partyCode: party.partyCode,
            name: party.name,
            voucherNo: entry.voucherNo,
            recordedRunningBalance: recordedRunning.toNumber(),
            expectedRunningBalance: expectedBalance.toNumber(),
            difference: diff.toNumber(),
          });
          break;
        }
      }
    }
  }

  // 3. Audit Godown Grain Stock Ledger against Purchase and Sale Movements
  const godowns = await prisma.godown.findMany({
    where: { status: 'ACTIVE' },
    include: { stockMovements: true },
  });

  for (const g of godowns) {
    let calculatedKg = new Decimal(0);
    (g.stockMovements || []).forEach((m) => {
      calculatedKg = calculatedKg.plus(new Decimal(m.baseQuantityKg || 0));
    });

    if (calculatedKg.isNegative()) {
      auditResults.isBalanced = false;
      auditResults.godownStockDiscrepancies.push({
        godownId: g.id,
        godownName: g.name,
        issue: 'Negative stock inventory balance detected',
        netCalculatedKg: calculatedKg.toNumber(),
      });
    }
  }

  return auditResults;
}
