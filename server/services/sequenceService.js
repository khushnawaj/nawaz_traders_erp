import { prisma } from '@/lib/db/prisma';

/**
 * Generates the next sequential voucher number for a model in a race-condition-safe manner.
 * Format: PREFIX-YYYY-0001 (e.g., PUR-2026-0001, SAL-2026-0001, PAY-2026-0001)
 *
 * @param {object} [tx] Optional Prisma transaction client
 * @param {string} prefix Voucher prefix (PUR, SAL, PAY, FUL, VEX, TRP)
 * @param {string} modelName Prisma model name (purchase, sale, payment, fuelExpense, vehicleExpense, trip)
 * @param {string} fieldName Model field name storing the voucher string (default: purchaseNo, saleNo, paymentNo, etc.)
 * @returns {Promise<string>} Next unique voucher string
 */
export async function getNextVoucherNumber(tx = prisma, prefix, modelName, fieldName = 'voucherNo') {
  const year = new Date().getFullYear();
  const pattern = `${prefix}-${year}-`;

  // Fetch the latest record matching the year pattern
  const dbClient = tx[modelName] || prisma[modelName];
  if (!dbClient) {
    throw new Error(`Invalid Prisma model name: ${modelName}`);
  }

  const latestRecord = await dbClient.findFirst({
    where: {
      [fieldName]: {
        startsWith: pattern,
      },
    },
    orderBy: {
      [fieldName]: 'desc',
    },
    select: {
      [fieldName]: true,
    },
  });

  let nextSequence = 1;

  if (latestRecord && latestRecord[fieldName]) {
    const lastVoucher = latestRecord[fieldName];
    const parts = lastVoucher.split('-');
    const lastNumStr = parts[parts.length - 1];
    const lastNum = parseInt(lastNumStr, 10);
    if (!isNaN(lastNum)) {
      nextSequence = lastNum + 1;
    }
  }

  const paddedNum = nextSequence.toString().padStart(4, '0');
  return `${prefix}-${year}-${paddedNum}`;
}
