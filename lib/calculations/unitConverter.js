import Decimal from 'decimal.js';

/**
 * Standard base conversion factors relative to 1 KG
 */
export const STANDARD_FACTORS = {
  KG: new Decimal('1.0000'),
  QTL: new Decimal('100.0000'),
  QUINTAL: new Decimal('100.0000'),
  TON: new Decimal('1000.0000'),
  TONNE: new Decimal('1000.0000'),
};

/**
 * Converts a display quantity from a specific unit code into canonical Base Quantity in KG
 * @param {number|string|Decimal} quantity 
 * @param {string} unitCode e.g. 'QTL', 'KG', 'TON'
 * @param {number|string|Decimal} customFactor optional custom conversion factor if fetched from DB
 * @returns {Decimal} Base Quantity in KG
 */
export function convertToBaseKg(quantity, unitCode = 'QTL', customFactor = null) {
  const qtyDecimal = new Decimal(quantity || 0);
  const factor = customFactor 
    ? new Decimal(customFactor) 
    : (STANDARD_FACTORS[unitCode.toUpperCase()] || new Decimal('1.0000'));

  return qtyDecimal.times(factor);
}

/**
 * Converts a Base Quantity in KG back into a target display unit
 * @param {number|string|Decimal} baseKg 
 * @param {string} targetUnitCode e.g. 'QTL', 'TON'
 * @param {number|string|Decimal} customFactor optional custom factor from DB
 * @returns {Decimal} Converted Display Quantity
 */
export function convertFromBaseKg(baseKg, targetUnitCode = 'QTL', customFactor = null) {
  const kgDecimal = new Decimal(baseKg || 0);
  const factor = customFactor 
    ? new Decimal(customFactor) 
    : (STANDARD_FACTORS[targetUnitCode.toUpperCase()] || new Decimal('1.0000'));

  if (factor.isZero()) return new Decimal(0);
  return kgDecimal.dividedBy(factor);
}

/**
 * Calculates Net Weight from Gross Weight and Tare Weight
 * @param {number|string|Decimal} grossKg 
 * @param {number|string|Decimal} tareKg 
 * @returns {Decimal} Net Weight in KG
 */
export function calculateNetWeight(grossKg, tareKg) {
  const gross = new Decimal(grossKg || 0);
  const tare = new Decimal(tareKg || 0);
  const net = gross.minus(tare);
  return net.isNegative() ? new Decimal(0) : net;
}
