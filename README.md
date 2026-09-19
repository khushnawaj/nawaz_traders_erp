# 🌾 Nawaz Traders — Grain Trading ERP (Version 1.0)

Production-oriented **Grain Trading ERP** built for **Nawaz Traders**, managing the complete agricultural procurement and distribution cycle:

**Farmer → Procurement → Weighment → Stock → Sale → Customer Payment → Expenses → Employees/Drivers → Vehicles → Accounting → Profit/Loss**

---

## 📚 Complete Project Documentation
For detailed architectural overview, UI design guidelines, glassmorphism tokens, and database transaction flows, please read:
👉 **[`PROJECT_DOCUMENTATION.md`](./PROJECT_DOCUMENTATION.md)**

---

## 🚀 Tech Stack

* **Frontend Framework**: Next.js 14 (App Router, JavaScript)
* **Styling**: Tailwind CSS & Modern Clean Glassmorphism Primitives
* **Database & ORM**: PostgreSQL & Prisma ORM
* **Financial & Weight Precision**: PostgreSQL `Decimal` & `decimal.js`
* **Authentication**: HttpOnly JWT Session & Bcrypt password hashing
* **Validation**: Zod Schema Validation

---

## 🗄️ Database Setup & Configuration

### 1. Environment Variables
Ensure `.env` contains your PostgreSQL database URL:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nawaz_traders?schema=public"
JWT_SECRET="super-secret-grain-erp-jwt-key-change-in-production-2026"
NODE_ENV="development"
```

### 2. Push Schema & Seed Initial Data

Run the following commands:

```bash
# Push Prisma schema to PostgreSQL database
npx prisma db push

# Seed initial master data (Units, Commodities, Admin User, Godown, Vehicles, Employees)
node prisma/seed.js
```

### 3. Start Development Server

```bash
npm run dev
```

Application will be live at `http://localhost:3000`.

---

## 📋 Initial Seed Credentials

* **Company**: Nawaz Traders
* **Admin Username**: `admin`
* **Admin Password**: `admin123`

---

## 🏛️ Foundational Modules

1. **Vehicles & Diesel (`/vehicles`)**: Fleet management, driver assignments, diesel slips with live auto-calculator & vendor ledger credit posting.
2. **Warehouses & Godowns (`/godowns`)**: Live stock inventory in Quintals & Metric Tonnes, storage capacity bars, inflow/outflow register.
3. **Crop Purchases (`/purchases`)**: Farmer procurement vouchers, Palledari/Labour calculator (per bag, per qtl, fixed), advance settlement, promised date tracking, printable slips.
4. **Commercial Sales (`/sales`)**: Dispatches to Rice Mills & buyers, customer ledger debit posting, automatic stock deduction (`SALE_OUT`), printable tax invoices.
5. **Parties & Khaata (`/parties`)**: Farmers, Customers, Rice Mills, Suppliers & Vendors with complete running debit/credit ledgers.
6. **Staff & Drivers (`/employees`)**: Employee master, daily attendance logs, salary credits & advance lending ledgers.

---

## 📁 Directory Structure

```text
d:\ERP/
├── app/                  # Next.js App Router Pages & REST API Routes
│   ├── globals.css       # Global design system & print styles
│   ├── layout.jsx        # Root Layout component
│   └── page.jsx          # Dashboard Homepage
├── components/           # UI Components (Godowns, Purchases, Sales, Vehicles)
├── server/services/      # Business logic services (purchaseService, saleService)
├── lib/                  # Core Utilities & Services
│   ├── db/prisma.js      # Prisma singleton
│   ├── calculations/     # Unit conversion logic (KG/Quintal/Tonne)
│   └── utils.js          # Currency formatting
├── prisma/               # Schema & database seed script
├── PROJECT_DOCUMENTATION.md # Complete Architecture & UI Guide
└── README.md             # Project Quickstart
```
