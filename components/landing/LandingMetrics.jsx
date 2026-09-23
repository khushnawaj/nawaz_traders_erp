'use client';

import { Wheat, Users, Warehouse, ShieldCheck } from 'lucide-react';

const METRICS = [
  {
    icon: Wheat,
    value: '50,000+ Qtl',
    label: 'Grain Procured',
    subtext: 'Paddy & Wheat Mandi weighment',
  },
  {
    icon: Users,
    value: '1,200+',
    label: 'Farmers & Rice Mills',
    subtext: 'Registered accounts',
  },
  {
    icon: Warehouse,
    value: '5,000 MT',
    label: 'Godown Storage',
    subtext: 'Live Mandi storage capacity',
  },
  {
    icon: ShieldCheck,
    value: '100% Math',
    label: 'Exact Precision',
    subtext: 'Zero floating-point rounding errors',
  },
];

export default function LandingMetrics() {
  return (
    <section className="py-6 font-outfit">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-slate-800">
            {METRICS.map((m, idx) => {
              const IconComp = m.icon;
              return (
                <div key={idx} className={`space-y-2 text-center sm:text-left ${idx !== 0 ? 'pt-4 sm:pt-0 sm:pl-6' : ''}`}>
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-center mx-auto sm:mx-0">
                    <IconComp className="w-4 h-4" />
                  </div>
                  <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
                    {m.value}
                  </div>
                  <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                    {m.label}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                    {m.subtext}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
