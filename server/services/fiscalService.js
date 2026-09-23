import { prisma } from '@/lib/db/prisma';

/**
 * Validates if a transaction date falls inside a closed accounting fiscal period.
 * Throws an error if the period is locked/closed.
 * 
 * @param {Date|string} date Date of transaction to validate
 */
export async function validateFiscalPeriodOpen(date) {
  if (!date) return;
  const targetDate = new Date(date);

  const closedPeriod = await prisma.fiscalPeriod.findFirst({
    where: {
      isClosed: true,
      startDate: { lte: targetDate },
      endDate: { gte: targetDate },
    },
  });

  if (closedPeriod) {
    throw new Error(
      `FISCAL PERIOD LOCKED: Financial period "${closedPeriod.name}" was closed on ${closedPeriod.closedAt ? new Date(closedPeriod.closedAt).toLocaleDateString('en-IN') : 'audited date'}. Backdated entries are restricted.`
    );
  }
}

/**
 * Get list of all fiscal periods
 */
export async function getFiscalPeriods() {
  return await prisma.fiscalPeriod.findMany({
    orderBy: { startDate: 'desc' },
  });
}

/**
 * Close/Lock a fiscal period
 */
export async function closeFiscalPeriod(periodId, closedByUsername = 'Admin') {
  const period = await prisma.fiscalPeriod.findUnique({ where: { id: periodId } });
  if (!period) throw new Error('Fiscal period not found');

  return await prisma.fiscalPeriod.update({
    where: { id: periodId },
    data: {
      isClosed: true,
      closedAt: new Date(),
      closedBy: closedByUsername,
    },
  });
}

/**
 * Re-open a fiscal period
 */
export async function openFiscalPeriod(periodId) {
  return await prisma.fiscalPeriod.update({
    where: { id: periodId },
    data: {
      isClosed: false,
      closedAt: null,
      closedBy: null,
    },
  });
}
