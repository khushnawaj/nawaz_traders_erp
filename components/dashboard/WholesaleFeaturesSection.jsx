'use client';

import Link from 'next/link';
import { 
  Package, 
  Wheat, 
  Inbox, 
  FileText, 
  BookOpen, 
  BarChart3,
  ArrowRight
} from 'lucide-react';

const FEATURES = [
  {
    id: 'dual-unit',
    icon: Package,
    iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    accentBorder: 'border-l-amber-500',
    title: 'Dual-Unit Stock Tracking',
    description: 'Monitor incoming, outgoing, and godown stock balances simultaneously by bag count (bori) and net weight in quintals across all commodities.',
    linkText: 'Read dual-unit inventory guide',
    linkHref: '/godowns',
  },
  {
    id: 'commodity-catalog',
    icon: Wheat,
    iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    accentBorder: 'border-l-emerald-500',
    title: 'Commodity Catalog',
    description: 'Organize multiple agricultural crops and varieties (Wheat Lokwan/Sharbati, Paddy Basmati, Mustard, Soybean, Gram, Maize) with custom HSN mapping.',
    linkText: 'View commodity varieties',
    linkHref: '/godowns',
  },
  {
    id: 'purchase-inward',
    icon: Inbox,
    iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    accentBorder: 'border-l-blue-500',
    title: 'Purchase & Inward Log',
    description: 'Fast inward recording from farmers, suppliers, and local mandi brokers with automatic supplier ledger posting.',
    linkText: 'Record purchase slip',
    linkHref: '/purchases',
  },
  {
    id: 'sales-invoicing',
    icon: FileText,
    iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    accentBorder: 'border-l-purple-500',
    title: 'Outward Sales Invoicing',
    description: 'Issue structured tax invoices and trade bills to millers, food processors, and wholesale buyers with itemized commodity details.',
    linkText: 'Issue sales invoice',
    linkHref: '/sales',
  },
  {
    id: 'party-khatas',
    icon: BookOpen,
    iconBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    accentBorder: 'border-l-rose-500',
    title: 'Party Khatas & Dues',
    description: 'Keep clear running Khatas for all suppliers and buyers. Track outstanding dues, payment terms, and historical transactions.',
    linkText: 'Manage party ledgers',
    linkHref: '/parties',
  },
  {
    id: 'trade-reports',
    icon: BarChart3,
    iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    accentBorder: 'border-l-indigo-500',
    title: 'Trade & Stock Reports',
    description: 'Generate commodity-wise inventory registers, daily sales summaries, party balance sheets, and profit-loss statements.',
    linkText: 'View financial reports',
    linkHref: '/reports/profit-loss',
  },
];

export default function WholesaleFeaturesSection() {
  return (
    <section className="space-y-6">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="bahi-badge">
          Engineered for Wholesale Agricultural Trading
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-outfit">
          Engineered for Wholesale Agricultural Trading
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
          Full Operational visibility across procurement, godown stock, sales, and party Khatas
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {FEATURES.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className={`glass-card glass-card-hover p-6 rounded-2xl border-l-4 ${item.accentBorder} border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between group transition-all duration-300`}
            >
              <div className="space-y-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${item.iconBg}`}>
                  <Icon className="w-5 h-5" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-outfit tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="pt-5 mt-4 border-t border-slate-100 dark:border-slate-800/60">
                <Link
                  href={item.linkHref}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 font-outfit group/link"
                >
                  <span>{item.linkText}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
