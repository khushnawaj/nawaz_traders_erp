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
      name: 'Nawaz Traders - Main Mandi Warehouse',
      location: 'Central Mandi Complex, Gate #2',
      capacity: 5000.000,
      supervisor: 'Ram Kumar',
    },
  });
  console.log('✅ Main Godown seeded');

  // 4. Seed Vehicles
  const tractor = await prisma.vehicle.upsert({
    where: { vehicleNumber: 'MP04AB1234' },
    update: {},
    create: {
      vehicleNumber: 'MP04AB1234',
      vehicleType: 'Tractor 4WD',
      model: 'Mahindra 575 DI',
      ownership: 'OWNED',
      currentKm: 12500.0,
    },
  });
  console.log('✅ Vehicle MP04AB1234 seeded');

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
      address: 'Village Pipariya, Sehore',
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
      name: 'National Rice Mill',
      phone: '9425098765',
      address: 'Industrial Area, Mandideep',
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
      name: 'Kisan Fuel Station (Diesel Pump)',
      phone: '9893011223',
      address: 'Main Highway Bypass',
      roles: ['VENDOR'],
      openingBalance: 0.0,
      balanceType: 'PAYABLE',
    },
  });
  console.log('✅ Parties seeded (Farmer, Rice Mill, Fuel Vendor)');

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

  // Seed Farmer Party User
  const farmerParty = await prisma.party.findUnique({ where: { partyCode: 'PRT-0001' } });
  if (farmerParty) {
    const passwordHashFarmer = await bcrypt.hash('farmer123', 10);
    await prisma.user.upsert({
      where: { username: 'farmer_ramesh' },
      update: { partyId: farmerParty.id },
      create: {
        username: 'farmer_ramesh',
        email: 'ramesh.farmer@nawaztraders.com',
        passwordHash: passwordHashFarmer,
        fullName: 'Ramesh Patel (Farmer)',
        role: 'FARMER',
        partyId: farmerParty.id,
        status: 'ACTIVE',
      },
    });
    console.log('✅ Farmer Portal User seeded (username: farmer_ramesh, password: farmer123)');
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
