'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  Warehouse, 
  ArrowLeft, 
  Wheat, 
  Scale, 
  MapPin, 
  User, 
  ArrowUpRight, 
  ArrowDownLeft,
  Calendar,
  Layers,
  FileText
} from 'lucide-react';
import Breadcrumb from '@/components/layout/Breadcrumb';
import Loader from '@/components/common/Loader';
import toast from 'react-hot-toast';

export default function GodownDetailPage() {
  const { id } = useParams();
  const [godown, setGodown] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchGodownDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/godowns/${id}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch godown');

      setGodown(json.data);
    } catch (err) {
      toast.error(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchGodownDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <Loader text="Loading Warehouse Stock Ledger..." subtext="Syncing inflow and outflow grain movement" size="lg" />
      </div>
    );
  }

  if (!godown) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <Warehouse className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Godown Not Found</h2>
        <Link href="/godowns" className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Godowns Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-200">
      {/* Breadcrumb Navigation */}
      <Breadcrumb items={[{ label: 'Godowns & Stock Warehouses', href: '/godowns' }, { label: godown.name }]} />

      {/* Godown Profile Hero Card */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-xl relative overflow-hidden space-y-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-3xl border border-amber-500/20 shadow-sm">
              <Warehouse className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">
                  {godown.name}
                </h1>
                <span className="px-3 py-1 rounded-xl text-xs font-mono font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                  {godown.code}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-normal flex items-center gap-2">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" />{godown.location || 'Location Not Specified'}</span>
                {godown.supervisor && <span className="flex items-center gap-1">• <User className="w-3.5 h-3.5 text-slate-400" /> Supervisor: {godown.supervisor}</span>}
              </p>
            </div>
          </div>
        </div>

        {/* Live Grain Stock Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
          <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/50 dark:border-slate-800/50">
            <span className="text-[10px] font-medium uppercase text-slate-500 dark:text-slate-400 block">Total Live Stock (QTL)</span>
            <span className="text-xl font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 mt-1">
              <Wheat className="w-4 h-4" />
              {godown.totalStockQtl.toLocaleString('en-IN', { maximumFractionDigits: 1 })} QTL
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/50 dark:border-slate-800/50">
            <span className="text-[10px] font-medium uppercase text-slate-500 dark:text-slate-400 block">Total Live Stock (MT)</span>
            <span className="text-xl font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mt-1">
              <Scale className="w-4 h-4" />
              {godown.totalStockMT.toLocaleString('en-IN', { maximumFractionDigits: 1 })} MT
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/50 dark:border-slate-800/50">
            <span className="text-[10px] font-medium uppercase text-slate-500 dark:text-slate-400 block">Shed Capacity</span>
            <span className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-1.5 mt-1">
              {godown.capacity ? `${godown.capacity} MT` : 'Uncapped'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/50 dark:border-slate-800/50">
            <span className="text-[10px] font-medium uppercase text-slate-500 dark:text-slate-400 block">Total Stock Movements</span>
            <span className="text-xl font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1.5 mt-1">
              <Layers className="w-4 h-4" />
              {godown.stockMovements?.length || 0} Logs
            </span>
          </div>
        </div>

        {/* Commodity Breakdown Pills */}
        <div className="pt-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">Grain-wise Inventory Breakdown</span>
          <div className="flex flex-wrap gap-2">
            {godown.stockBreakdown?.map((b, i) => (
              <div key={i} className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs font-medium text-slate-900 dark:text-white flex items-center gap-2">
                <Wheat className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>{b.commodityName}:</span>
                <span className="font-semibold text-amber-600 dark:text-amber-400">{b.stockQtl.toFixed(1)} Quintals ({b.stockMT.toFixed(2)} MT)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stock Ledger History Table */}
      <div className="glass-card p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-xl space-y-4">
        <h3 className="font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-500" /> Stock Inflow & Outflow Movement History
        </h3>

        <div className="overflow-x-auto rounded-2xl border border-slate-200/60 dark:border-slate-800/60">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 font-semibold uppercase border-b border-slate-200/60 dark:border-slate-800/60">
              <tr>
                <th className="px-4 py-3">Date & Reference</th>
                <th className="px-4 py-3">Movement Type</th>
                <th className="px-4 py-3">Commodity / Grain</th>
                <th className="px-4 py-3 text-right">Quantity</th>
                <th className="px-4 py-3 text-right">Base Weight (KG)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60 text-slate-900 dark:text-white font-medium">
              {godown.stockMovements?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400 font-normal">
                    No stock movements recorded for this warehouse yet.
                  </td>
                </tr>
              ) : (
                godown.stockMovements?.map((m) => {
                  const isInflow = m.movementType.includes('IN');
                  return (
                    <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold">{new Date(m.date).toLocaleDateString('en-IN')}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{m.referenceNo}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold border ${
                            isInflow
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                          }`}
                        >
                          {isInflow ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                          {m.movementType}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-amber-600 dark:text-amber-400">
                        {m.commodity?.localName || m.commodity?.name}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-white">
                        {parseFloat(m.displayQuantity).toFixed(2)} {m.displayUnit}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">
                        <span className={isInflow ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                          {isInflow ? '+' : ''}{parseFloat(m.baseQuantityKg).toLocaleString('en-IN')} KG
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

