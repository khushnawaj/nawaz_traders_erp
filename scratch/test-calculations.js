const Decimal = require('decimal.js');

function runMathTests() {
  console.log('🧪 Running Unit & Precision Math Verification Tests...\n');

  // Test 1: Weight conversion Quintal to KG
  const displayQtyQtl = new Decimal(150.5); // 150.5 Quintal
  const conversionFactorQtl = new Decimal(100); // 1 Quintal = 100 KG
  const baseWeightKg = displayQtyQtl.times(conversionFactorQtl);

  if (!baseWeightKg.equals(15050)) {
    throw new Error(`Test 1 Failed: Expected 15050 KG, got ${baseWeightKg.toString()}`);
  }
  console.log('✅ Test 1 Passed: 150.5 Quintal correctly converts to 15,050.000 KG');

  // Test 2: Weight conversion Tonne to KG
  const displayQtyTon = new Decimal(25); // 25 Tonne
  const conversionFactorTon = new Decimal(1000); // 1 Tonne = 1000 KG
  const baseWeightKgTon = displayQtyTon.times(conversionFactorTon);

  if (!baseWeightKgTon.equals(25000)) {
    throw new Error(`Test 2 Failed: Expected 25000 KG, got ${baseWeightKgTon.toString()}`);
  }
  console.log('✅ Test 2 Passed: 25 Metric Tonnes correctly converts to 25,000.000 KG');

  // Test 3: Financial Net Purchase Calculation with Mandi Tax (1.5%)
  const ratePerQtl = new Decimal(2250); // ₹2250 / Quintal
  const grossAmount = displayQtyQtl.times(ratePerQtl); // 150.5 * 2250 = 338,625
  const labourCharges = new Decimal(1200); // Palledari
  const mandiTaxPercent = new Decimal(1.5);
  const mandiTaxAmount = grossAmount.times(mandiTaxPercent.dividedBy(100)); // 338,625 * 0.015 = 5,079.375
  const deductions = new Decimal(500); // Moisture deduction

  const netPurchaseAmount = grossAmount.plus(labourCharges).plus(mandiTaxAmount).minus(deductions);

  if (!netPurchaseAmount.equals(344404.375)) {
    throw new Error(`Test 3 Failed: Expected 344404.375, got ${netPurchaseAmount.toString()}`);
  }
  console.log(`✅ Test 3 Passed: Net Crop Purchase Amount calculated precisely as ₹${netPurchaseAmount.toFixed(2)} (Mandi Tax: ₹${mandiTaxAmount.toFixed(2)})`);

  console.log('\n🎉 ALL PRECISION MATH & WEIGHT UNIT CONVERSION TESTS PASSED SUCCESSFULLY!');
}

runMathTests();
