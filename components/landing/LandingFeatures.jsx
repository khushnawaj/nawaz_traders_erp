'use client';

import { 
  Wheat, 
  Warehouse, 
  TrendingUp, 
  Truck, 
  PieChart, 
  Share2, 
  Coins
} from 'lucide-react';

const FEATURES = [
  {
    icon: Wheat,
    color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    title: 'Crop Procurement & Weighment Slips',
    description: 'Instant weighment Parchi generation for Paddy, Wheat, Gram & Soyabean with moisture deduction, Palledari labour calculator & printable vouchers.',
  },
  {
    icon: Coins,
    color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    title: 'Capital Partners & Investor Desk',
    description: 'Track equity investors, bank loan facilities, private financiers, profit share percentages, interest rates, monthly EMI schedules, and payoff dates.',
  },
  {
    icon: Warehouse,
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    title: 'Multi-Godown Inventory Desk',
    description: 'Real-time stock tracking across Mandi storage sheds. Automated inward (`PURCHASE_IN`) and outward (`SALE_OUT`) movement records in Metric Tonnes.',
  },
  {
    icon: TrendingUp,
    color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    title: 'Commercial Sales & Tax Invoices',
    description: 'Direct grain dispatch to Rice Mills & Commercial Buyers with itemized tax invoices, SBI bank transfer details, and automatic customer ledger posting.',
  },
  {
    icon: Truck,
    color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    title: 'Fleet & Fuel Expense Ledger',
    description: 'Vehicle maintenance logs, diesel fuel slips, driver advances, and Mandi trip history tracking to prevent leakage in logistics operations.',
  },
  {
    icon: PieChart,
    color: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
    title: 'Double-Entry Financial Accounting',
    description: 'Automatic debit/credit ledger posting (`PartyLedger`), instant Profit & Loss statement generation, and real-time Trial Balance oversight.',
  },
];

export default function LandingFeatures() {
  return (
    <section className="py-12 sm:py-16 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 font-outfit">
        {/* Header Title */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-black text-slate-950 dark:text-white tracking-tight">
            Built for High-Volume Grain Mandi Operations
          </h2>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-semibold">
            Everything your grain trading firm needs—from Mandi weighment scales to double-entry financial statements and investor ledgers.
          </p>
        </div>

        {/* 6-Grid Feature Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, idx) => {
            const IconComponent = f.icon;
            return (
              <div
                key={idx}
                className="bg-slate-900 text-white p-6 rounded-3xl border-2 border-slate-800 shadow-2xl space-y-4 flex flex-col justify-between group transition-all duration-300 hover:border-emerald-500/50 hover:shadow-emerald-950/40"
              >
                <div className="space-y-3">
                  <div className={`w-12 h-12 rounded-2xl ${f.color} flex items-center justify-center border shadow-md group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-black text-white group-hover:text-emerald-400 transition-colors">
                    {f.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                    {f.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
