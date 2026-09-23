'use client';

import { 
  Wheat, 
  Warehouse, 
  TrendingUp, 
  Truck, 
  PieChart, 
  Coins
} from 'lucide-react';

const FEATURES = [
  {
    icon: Wheat,
    title: 'Crop Procurement & Weighment Slips',
    description: 'Instant Parchi generation for Paddy, Wheat, Gram & Soyabean with moisture deduction, Palledari calculator & printable vouchers.',
  },
  {
    icon: Coins,
    title: 'Capital Partners & Investor Desk',
    description: 'Track equity investors, bank loan facilities, profit share percentages, interest rates, monthly EMI schedules, and payoff dates.',
  },
  {
    icon: Warehouse,
    title: 'Multi-Godown Inventory Desk',
    description: 'Real-time stock tracking across Mandi storage sheds. Automated inward (PURCHASE_IN) and outward (SALE_OUT) movement records.',
  },
  {
    icon: TrendingUp,
    title: 'Commercial Sales & Tax Invoices',
    description: 'Direct grain dispatch to Rice Mills & Commercial Buyers with itemized tax invoices, bank transfer details, and automatic customer ledger posting.',
  },
  {
    icon: Truck,
    title: 'Fleet & Fuel Expense Ledger',
    description: 'Vehicle maintenance logs, diesel fuel slips, driver advances, and Mandi trip history tracking to prevent leakage in logistics operations.',
  },
  {
    icon: PieChart,
    title: 'Double-Entry Financial Accounting',
    description: 'Automatic debit/credit ledger posting, instant Profit & Loss statement generation, and real-time Trial Balance oversight.',
  },
];

export default function LandingFeatures() {
  return (
    <section className="py-10 font-outfit">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Built for Grain Mandi Operations
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-normal">
            Essential tools for Mandi weighments, inventory management, ledgers, and financial reports.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, idx) => {
            const IconComponent = f.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm hover:border-emerald-500/40 transition"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-center">
                  <IconComponent className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {f.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-normal leading-relaxed">
                  {f.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
