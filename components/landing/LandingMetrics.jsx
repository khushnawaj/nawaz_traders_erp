'use client';

import { Wheat, Users, Warehouse, ShieldCheck } from 'lucide-react';

const METRICS = [
  {
    icon: Wheat,
    value: '50,000+ Qtl',
    label: 'Grain Procured',
    subtext: 'Paddy & Wheat Mandi weighment',
    iconBg: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  },
  {
    icon: Users,
    value: '1,200+',
    label: 'Active Farmers & Mills',
    subtext: 'Kisan & Commercial Accounts',
    iconBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  },
  {
    icon: Warehouse,
    value: '5,000 MT',
    label: 'Godown Capacity',
    subtext: 'Live Mandi storage sheds',
    iconBg: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  },
  {
    icon: ShieldCheck,
    value: '100% Math',
    label: 'Decimal Precision',
    subtext: 'Zero floating-point rounding errors',
    iconBg: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  },
];

export default function LandingMetrics() {
  return (
    <section className="py-8 sm:py-12 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-10 rounded-3xl border-2 border-emerald-500/40 shadow-2xl bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900 text-white relative overflow-hidden font-outfit">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 relative z-10 divide-y sm:divide-y-0 sm:divide-x divide-slate-800/80">
            {METRICS.map((m, idx) => {
              const IconComp = m.icon;
              return (
                <div key={idx} className={`space-y-2 text-center sm:text-left ${idx !== 0 ? 'pt-4 sm:pt-0 sm:pl-6' : ''}`}>
                  <div className={`w-11 h-11 rounded-2xl ${m.iconBg} border flex items-center justify-center mx-auto sm:mx-0 shadow-md`}>
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div className="text-2xl sm:text-4xl font-black text-white tracking-tight pt-1 font-mono">
                    {m.value}
                  </div>
                  <div className="text-xs sm:text-sm font-extrabold text-emerald-400 uppercase tracking-wider">
                    {m.label}
                  </div>
                  <p className="text-xs text-slate-300 font-medium">
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
