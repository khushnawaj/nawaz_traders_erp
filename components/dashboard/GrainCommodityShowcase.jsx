'use client';

import Link from 'next/link';
import { Wheat, ArrowRight, Sparkles } from 'lucide-react';

const COMMODITIES = [
  {
    id: 'paddy',
    name: 'Paddy / Grain',
    hindiName: 'Paddy Procurement',
    variety: 'Kharif Crop • Fine Grade',
    image: '/images/paddy_banner.jpg',
    avgRate: '₹2,300 - ₹2,850 / qtl',
    unitsAvailable: 'Bags & Loose',
    link: '/farmers',
  },
  {
    id: 'wheat',
    name: 'Wheat / Grain',
    hindiName: 'Wheat Storage',
    variety: 'Rabi Crop • Sharbati & Lok-1',
    image: '/images/wheat_banner.jpg',
    avgRate: '₹2,450 - ₹3,100 / qtl',
    unitsAvailable: '50kg Jute Bags',
    link: '/purchases',
  },
  {
    id: 'rice',
    name: 'Basmati Rice',
    hindiName: 'Rice Mill Sales',
    variety: 'Processed Grain • 1121 Raw',
    image: '/images/rice_banner.jpg',
    avgRate: '₹4,200 - ₹6,500 / qtl',
    unitsAvailable: 'Bulk Dispatch',
    link: '/sales',
  },
];

export default function GrainCommodityShowcase() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Wheat className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Commodity Portfolio & Mandi Trade
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
            Key agricultural grains, current mandi rate estimates & quick trade links
          </p>
        </div>

        <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full text-xs font-normal bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 items-center gap-1">
          <Sparkles className="w-3 h-3" /> Live Mandi Rates
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {COMMODITIES.map((c) => (
          <div
            key={c.id}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between group hover:border-emerald-500/40 transition space-y-3"
          >
            {/* Grain Banner Image with Clean Vignette */}
            <div className="relative h-32 w-full rounded-xl overflow-hidden">
              <img
                src={c.image}
                alt={c.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
              <div className="absolute top-2.5 left-2.5">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white bg-slate-950/60 backdrop-blur-md border border-white/10">
                  {c.unitsAvailable}
                </span>
              </div>
              <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider block">{c.hindiName}</span>
                <h4 className="font-extrabold text-white text-base leading-tight font-outfit">{c.name}</h4>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
              <div className="flex items-center justify-between p-2.5 bg-slate-50/80 dark:bg-slate-900/60 rounded-xl border border-slate-200/50 dark:border-slate-800/50 text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-normal">Est. Rate</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{c.avgRate}</span>
              </div>

              <Link
                href={c.link}
                className="w-full py-2 rounded-xl text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/70 dark:hover:bg-slate-800 text-slate-800 dark:text-white border border-slate-200/80 dark:border-slate-700/60 transition flex items-center justify-center gap-1.5"
              >
                View Trade Details <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
