const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Nawaz Traders database seed...');

  // 1. Seed Units
  const units = [
    { name: 'Kilogram', code: 'KG', baseConversionFactor: 1.0, isBaseUnit: true },
    { name: 'Quintal', code: 'QTL', baseConversionFactor: 100.0, isBaseUnit: false },
    { name: 'Tonne', code: 'TON', baseConversionFactor: 1000.0, isBaseUnit: false },
  ];

  for (const u of units) {
    await prisma.unit.upsert({
      where: { code: u.code },
      update: {},
      create: u,
    });
  }
  console.log('✅ Units seeded (KG, Quintal, Tonne)');

  // 2. Seed Commodities
  const commodities = [
    { code: 'CMD-PAD-01', name: 'Paddy', localName: 'धान (Dhan)', category: 'Grains', description: 'Raw Paddy grain harvested from farmers' },
    { code: 'CMD-WHT-01', name: 'Wheat', localName: 'गेहूँ (Gehu)', category: 'Grains', description: 'Sharbati & Lokwan quality wheat' },
    { code: 'CMD-CHNA-01', name: 'Gram', localName: 'चना (Chana)', category: 'Pulses', description: 'Desi and Kabuli Gram' },
    { code: 'CMD-MAIZ-01', name: 'Maize', localName: 'मक्का (Maize)', category: 'Grains', description: 'Yellow corn/maize grain' },
    { code: 'CMD-MUST-01', name: 'Mustard', localName: 'सरसों (Sarson)', category: 'Oilseeds', description: 'Mustard seeds' },
  ];

  for (const c of commodities) {
    await prisma.commodity.upsert({
      where: { code: c.code },
      update: {},
      create: c,
    });
  }
  console.log('✅ Commodities seeded (Paddy, Wheat, Gram, Maize, Mustard)');

  // 3. Seed Godowns
  await prisma.godown.upsert({
    where: { code: 'GDN-MAIN-01' },
    update: {},
    create: {
      code: 'GDN-MAIN-01',
      name: 'Nawaz Traders - Main Mandi Godown Sonebhadra',
      location: 'Central Mandi Complex, Robertsganj, Sonebhadra (UP)',
      capacity: 5000.000,
      supervisor: 'Ram Kumar',
    },
  });
  console.log('✅ Main Godown Sonebhadra UP seeded');

  // 4. Seed Vehicles (UP-64 Sonebhadra RTO)
  const tractor = await prisma.vehicle.upsert({
    where: { vehicleNumber: 'UP64AB1234' },
    update: {},
    create: {
      vehicleNumber: 'UP64AB1234',
      vehicleType: 'Tractor 4WD',
      model: 'Mahindra 575 DI',
      ownership: 'OWNED',
      currentKm: 12500.0,
    },
  });
  console.log('✅ Vehicle UP64AB1234 (Sonebhadra RTO) seeded');

  // 5. Seed Driver Employee
  await prisma.employee.upsert({
    where: { employeeCode: 'EMP-001' },
    update: {},
    create: {
      employeeCode: 'EMP-001',
      fullName: 'Santosh Kumar',
      phone: '9876543210',
      role: 'DRIVER',
      salaryType: 'MONTHLY',
      baseSalary: 18000.00,
      assignedVehicleId: tractor.id,
    },
  });
  console.log('✅ Employee EMP-001 Santosh Kumar (Driver) seeded');

  // 6. Seed Parties
  await prisma.party.upsert({
    where: { partyCode: 'PRT-0001' },
    update: {},
    create: {
      partyCode: 'PRT-0001',
      name: 'Ramesh Patel (Farmer)',
      phone: '9826012345',
      address: 'Village Ghorawal, Sonebhadra (UP)',
      roles: ['FARMER'],
      openingBalance: 0.0,
      balanceType: 'PAYABLE',
    },
  });

  await prisma.party.upsert({
    where: { partyCode: 'PRT-0002' },
    update: {},
    create: {
      partyCode: 'PRT-0002',
      name: 'Purvanchal Rice Mill Sonebhadra',
      phone: '9425098765',
      address: 'Industrial Area, Robertsganj, Sonebhadra (UP)',
      roles: ['RICE_MILL', 'CUSTOMER'],
      openingBalance: 0.0,
      balanceType: 'RECEIVABLE',
    },
  });

  await prisma.party.upsert({
    where: { partyCode: 'PRT-0003' },
    update: {},
    create: {
      partyCode: 'PRT-0003',
      name: 'Sonebhadra Fuel Center (Diesel Pump)',
      phone: '9893011223',
      address: 'Varanasi-Shaktinagar Highway, Robertsganj (UP)',
      roles: ['VENDOR'],
      openingBalance: 0.0,
      balanceType: 'PAYABLE',
    },
  });

  await prisma.party.upsert({
    where: { partyCode: 'PRT-0004' },
    update: {},
    create: {
      partyCode: 'PRT-0004',
      name: 'Robertsganj Subzi Mandi Produce Trader',
      phone: '9415123456',
      address: 'Central Mandi Complex, Robertsganj, Sonebhadra (UP)',
      roles: ['SUPPLIER'],
      openingBalance: 7800.0,
      balanceType: 'PAYABLE',
    },
  });
  console.log('✅ UP Sonebhadra Parties seeded');

  // 7. Seed Owner, Admin & Linked Portal Users
  const passwordHashOwner = await bcrypt.hash('owner123', 10);
  await prisma.user.upsert({
    where: { username: 'owner' },
    update: { role: 'OWNER' },
    create: {
      username: 'owner',
      email: 'owner@nawaztraders.com',
      passwordHash: passwordHashOwner,
      fullName: 'Nawaz Traders Owner',
      role: 'OWNER',
      status: 'ACTIVE',
    },
  });
  console.log('✅ Owner User seeded (username: owner, password: owner123)');

  const passwordHashAdmin = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@nawaztraders.com',
      passwordHash: passwordHashAdmin,
      fullName: 'System Administrator',
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });
  console.log('✅ Admin User seeded (username: admin, password: admin123)');

  // Seed Driver Employee User
  const driverEmp = await prisma.employee.findUnique({ where: { employeeCode: 'EMP-001' } });
  if (driverEmp) {
    const passwordHashDriver = await bcrypt.hash('driver123', 10);
    await prisma.user.upsert({
      where: { username: 'driver_santosh' },
      update: { employeeId: driverEmp.id },
      create: {
        username: 'driver_santosh',
        email: 'santosh@nawaztraders.com',
        passwordHash: passwordHashDriver,
        fullName: 'Santosh Kumar (Driver)',
        role: 'EMPLOYEE',
        employeeId: driverEmp.id,
        status: 'ACTIVE',
      },
    });
    console.log('✅ Employee Portal User seeded (username: driver_santosh, password: driver123)');
  }

  // 7. Seed Kirana Store Products
  const kiranaProducts = [
    { sku: 'KRN-PRD-001', barcode: '8901030001001', name: 'Tata Iodized Salt 1kg', localName: 'टाटा नमक 1 किलो', category: 'Groceries & Spices', mrp: 28.00, purchasePrice: 22.00, sellingPrice: 27.00, unit: 'Pkt', currentStock: 120, minStockLevel: 20 },
    { sku: 'KRN-PRD-002', barcode: '8901234002002', name: 'Fortune Refined Soyabean Oil 1L', localName: 'फॉर्च्यून सोयाबीन तेल 1 ली.', category: 'Groceries & Spices', mrp: 145.00, purchasePrice: 122.00, sellingPrice: 138.00, unit: 'Pkt', currentStock: 85, minStockLevel: 15 },
    { sku: 'KRN-PRD-003', barcode: '8901058003003', name: 'Aashirvaad Shuddh Chakki Atta 10kg', localName: 'आशीर्वाद आटा 10 किलो', category: 'Groceries & Spices', mrp: 440.00, purchasePrice: 380.00, sellingPrice: 420.00, unit: 'Pkt', currentStock: 40, minStockLevel: 10 },
    { sku: 'KRN-PRD-004', barcode: '8901030004004', name: 'Taj Mahal Premium Tea 250g', localName: 'ताज महल चाय 250 ग्राम', category: 'Snacks & Drinks', mrp: 185.00, purchasePrice: 150.00, sellingPrice: 175.00, unit: 'Pkt', currentStock: 35, minStockLevel: 5 },
    { sku: 'KRN-PRD-005', barcode: '8901058005005', name: 'Maggi 2-Minute Masala Noodles 70g', localName: 'मैगी नूडल्स 70 ग्राम', category: 'Snacks & Drinks', mrp: 14.00, purchasePrice: 11.50, sellingPrice: 14.00, unit: 'Pkt', currentStock: 250, minStockLevel: 30 },
    { sku: 'KRN-PRD-006', barcode: '8901030006006', name: 'Parle-G Gold Biscuits 100g', localName: 'पारले-जी बिस्किट', category: 'Snacks & Drinks', mrp: 10.00, purchasePrice: 8.20, sellingPrice: 10.00, unit: 'Pkt', currentStock: 300, minStockLevel: 50 },
    { sku: 'KRN-PRD-007', barcode: '8901030007007', name: 'Dettol Original Soap 125g', localName: 'डेटॉल साबुन 125 ग्राम', category: 'Personal Care', mrp: 58.00, purchasePrice: 46.00, sellingPrice: 55.00, unit: 'Pcs', currentStock: 90, minStockLevel: 15 },
    { sku: 'KRN-PRD-008', barcode: '8901030008008', name: 'Surf Excel Easy Wash Detergent Powder 1kg', localName: 'सर्फ एक्सेल 1 किलो', category: 'Household Items', mrp: 150.00, purchasePrice: 125.00, sellingPrice: 142.00, unit: 'Pkt', currentStock: 60, minStockLevel: 10 },
    { sku: 'KRN-PRD-009', barcode: '8901030009009', name: 'Amul Pasteurized Butter 500g', localName: 'अमूल मक्खन 500 ग्राम', category: 'Dairy & Bakery', mrp: 275.00, purchasePrice: 240.00, sellingPrice: 270.00, unit: 'Pkt', currentStock: 25, minStockLevel: 5 },
    { sku: 'KRN-PRD-010', barcode: '8901030010010', name: 'Cadbury Dairy Milk Silk 60g', localName: 'डेयरी मिल्क सिल्क 60 ग्राम', category: 'Snacks & Drinks', mrp: 90.00, purchasePrice: 72.00, sellingPrice: 88.00, unit: 'Pcs', currentStock: 50, minStockLevel: 10 },
  ];

  for (const kp of kiranaProducts) {
    await prisma.kiranaProduct.upsert({
      where: { sku: kp.sku },
      update: {},
      create: kp,
    });
  }
  console.log('✅ Kirana Store Products seeded (10 retail items)');

  // 8. Seed Compliance, Licenses & Tax Renewals
  const today = new Date();
  const daysFromNow = (days) => new Date(today.getTime() + days * 24 * 60 * 60 * 1000);

  const licenses = [
    {
      title: 'Counter Scale & Dharmakanta Stamping Verification Tax',
      category: 'WEIGHT_MACHINE',
      licenseNumber: 'WMT-UP64-2026-8812',
      issuingAuthority: 'Legal Metrology Dept, Sonebhadra Division, Uttar Pradesh',
      issueDate: new Date('2025-10-15'),
      expiryDate: daysFromNow(12), // Expiring in 12 days!
      reminderDays: 30,
      renewalFee: 4500.00,
      status: 'EXPIRING_SOON',
      notes: 'Mandatory annual stamping tax under UP Weight & Measurement Rules for Kirana counter scale and Mandi weighbridge.',
    },
    {
      title: 'FSDA UP Food Business Operator License (FSSAI)',
      category: 'FSSAI',
      licenseNumber: 'FSSAI-UP-09202499018234',
      issuingAuthority: 'Food Safety and Drug Administration (FSDA), UP Sonebhadra',
      issueDate: new Date('2024-11-01'),
      expiryDate: daysFromNow(28), // Expiring in 28 days!
      reminderDays: 45,
      renewalFee: 3000.00,
      status: 'EXPIRING_SOON',
      notes: 'Mandatory food operator registration for Kirana grocery shop & grain storage in UP.',
    },
    {
      title: 'UP Mandi Samiti Trade License & Mandi Shulk (1.5% Mandi Tax + 0.5% Vikas Cess)',
      category: 'MANDI_LICENSE',
      licenseNumber: 'UP-MND-SNB-0042',
      issuingAuthority: 'UP Krishi Upaj Mandi Samiti, Robertsganj - Sonebhadra (UP)',
      issueDate: new Date('2025-04-01'),
      expiryDate: daysFromNow(180),
      reminderDays: 30,
      renewalFee: 12500.00,
      status: 'VALID',
      notes: 'Annual UP Mandi trade license to bid & trade grain commodities inside Robertsganj Mandi yard.',
    },
    {
      title: 'UP Dukan Avam Vanijya Adhiniyam Registration (Form C - Shop Act)',
      category: 'TRADE_LICENSE',
      licenseNumber: 'UP-GUM-SNB-883192',
      issuingAuthority: 'Labor Dept / Nagar Palika Parishad Robertsganj (Sonebhadra, UP)',
      issueDate: new Date('2025-01-10'),
      expiryDate: daysFromNow(-5), // EXPIRED 5 days ago!
      reminderDays: 30,
      renewalFee: 1800.00,
      status: 'EXPIRED',
      notes: 'Uttar Pradesh Shop & Commercial Establishments Act license for Kirana store counter.',
    },
    {
      title: 'Tractor Commercial Fitness & UP Road Tax (UP64AB1234)',
      category: 'VEHICLE_TAX',
      licenseNumber: 'TAX-UP64AB1234',
      issuingAuthority: 'RTO Sonebhadra (UP-64), Uttar Pradesh',
      issueDate: new Date('2025-05-10'),
      expiryDate: daysFromNow(45),
      reminderDays: 30,
      renewalFee: 5500.00,
      status: 'VALID',
      notes: 'Annual commercial road tax and vehicle fitness certificate for UP-64 registered tractor.',
    },
  ];

  for (const lic of licenses) {
    const existing = await prisma.complianceLicense.findFirst({ where: { title: lic.title } });
    if (!existing) {
      await prisma.complianceLicense.create({ data: lic });
    }
  }
  console.log('✅ Compliance Licenses & Tax Reminders seeded');

  // 11. Seed Sample Kirana Inward Mandi Stock Purchase
  const existingPur = await prisma.kiranaPurchase.findFirst({ where: { purchaseNo: 'KRN-INW-2026-0001' } });
  if (!existingPur) {
    await prisma.kiranaPurchase.create({
      data: {
        purchaseNo: 'KRN-INW-2026-0001',
        date: new Date('2026-09-24'),
        supplierName: 'Robertsganj Subzi Mandi Produce Trader (Sonebhadra)',
        supplierPhone: '9415123456',
        invoiceNo: 'MND-RBT-9821',
        totalItemCost: 27000.00,
        taxCharges: 800.00, // Mandi Shulk 1.5% + Palledari Hamali
        netAmount: 27800.00,
        paidAmount: 20000.00,
        dueAmount: 7800.00, // Left to pay
        paymentMode: 'CREDIT',
        paymentStatus: 'PARTIAL',
        notes: 'Mandi purchase of Aaloo, Pyaj, Adrak, Lahsun crate lot.',
        parchiDocUrl: '/uploads/sample_mandi_parchi.png',
        items: {
          create: [
            { itemName: 'Aaloo (Potato Fresh)', unit: 'Kg', quantity: 500, purchasePrice: 20.00, totalAmount: 10000.00 },
            { itemName: 'Pyaj (Onion Red)', unit: 'Kg', quantity: 300, purchasePrice: 30.00, totalAmount: 9000.00 },
            { itemName: 'Adrak (Ginger Desi)', unit: 'Kg', quantity: 50, purchasePrice: 100.00, totalAmount: 5000.00 },
            { itemName: 'Lahsun (Garlic)', unit: 'Kg', quantity: 40, purchasePrice: 75.00, totalAmount: 3000.00 },
          ],
        },
      },
    });
    console.log('✅ Sample Kirana Inward Mandi Purchase seeded');
  }

  console.log('🎉 Nawaz Traders seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
