'use client';

import Link from 'next/link';
import { ShoppingBag, Warehouse, FileText, BookOpen, ArrowRight } from 'lucide-react';

const STEPS = [
  {
    step: 'STEP 1',
    icon: ShoppingBag,
    title: 'Purchase Inward',
    description: 'Record incoming crop lot with supplier Khata debit, bag count, and weight in quintals.',
    badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  },
  {
    step: 'STEP 2',
    icon: Warehouse,
    title: 'Stock Updated',
    description: 'Available commodity stock increments automatically by bag count and net weight.',
    badgeBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  },
  {
    step: 'STEP 3',
    icon: FileText,
    title: 'Buyer Outward Bill',
    description: 'Bill sold quantities directly from current inventory with mapped HSN codes and GST.',
    badgeBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  },
  {
    step: 'STEP 4',
    icon: BookOpen,
    title: 'Khata & Ledger',
    description: 'Buyer Khata updates instantly with invoice debit, maintaining clean payment ledgers.',
    badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  },
];

export default function WholesaleWorkflowSection() {
  return (
    <section className="space-y-6">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="bahi-badge">
          PROCURING TO SELLING
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-outfit">
          From Crop Inward to Godown Stock to Buyer Sale
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
          Track Inward purchases, godown stock, and outward sales seamlessly in 4 simple steps
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STEPS.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.step}
              className="glass-card glass-card-hover p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between space-y-4 group transition-all duration-300"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 font-mono">
                    {item.step}
                  </span>
                  <div className={`p-2 rounded-xl border ${item.badgeBg}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-outfit tracking-tight">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Callout Banner */}
      <div className="p-4 sm:p-5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-center flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
        <span className="text-xs sm:text-sm font-semibold text-emerald-950 dark:text-emerald-100 font-outfit">
          Onboarding managed for you. Create a free trade slip or manage party Khatas now.
        </span>
        <Link href="/farmers" className="bahi-btn-primary shrink-0 py-2 px-4 text-xs">
          Start Inward Entry <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </section>
  );
}
