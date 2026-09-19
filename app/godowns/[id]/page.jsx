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
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500">
        Loading warehouse stock ledger...
      </div>
    );
  }

  if (!godown) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <Warehouse className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Godown Not Found</h2>
        <Link href="/godowns" className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Godowns Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1550px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Link */}
      <Link
        href="/godowns"
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Godowns List
      </Link>

      {/* Godown Profile Hero Card */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-3xl border border-emerald-500/20 shadow-inner">
              🏛️
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {godown.name}
                </h1>
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                  {godown.code}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-bold">
                📍 {godown.location || 'Location Not Specified'} {godown.supervisor ? `• 👨‍✈️ Supervisor: ${godown.supervisor}` : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Live Grain Stock Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Total Live Stock (QTL)</span>
            <span className="text-xl font-black text-amber-600 dark:text-amber-400 flex items-center gap-1.5 mt-1">
              <Wheat className="w-4 h-4" />
              {godown.totalStockQtl.toLocaleString('en-IN', { maximumFractionDigits: 1 })} QTL
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Total Live Stock (MT)</span>
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mt-1">
              <Scale className="w-4 h-4" />
              {godown.totalStockMT.toLocaleString('en-IN', { maximumFractionDigits: 1 })} MT
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Shed Capacity</span>
            <span className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-1.5 mt-1">
              {godown.capacity ? `${godown.capacity} MT` : 'Uncapped'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Total Stock Movements</span>
            <span className="text-xl font-black text-purple-600 dark:text-purple-400 flex items-center gap-1.5 mt-1">
              <Layers className="w-4 h-4" />
              {godown.stockMovements?.length || 0} Logs
            </span>
          </div>
        </div>

        {/* Commodity Breakdown Pills */}
        <div className="pt-2">
          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block mb-2">Grain-wise Inventory Breakdown</span>
          <div className="flex flex-wrap gap-2">
            {godown.stockBreakdown?.map((b, i) => (
              <div key={i} className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>🌾 {b.commodityName}:</span>
                <span className="font-black text-amber-600 dark:text-amber-400">{b.stockQtl.toFixed(1)} Quintals ({b.stockMT.toFixed(2)} MT)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stock Ledger History Table */}
      <div className="glass-card p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl space-y-4">
        <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-emerald-500" /> Stock Inflow & Outflow Movement History (स्टॉक रजिस्टर)
        </h3>

        <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-950/80 text-slate-700 dark:text-slate-300 font-extrabold uppercase border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3.5">Date & Reference</th>
                <th className="px-4 py-3.5">Movement Type</th>
                <th className="px-4 py-3.5">Commodity / Grain</th>
                <th className="px-4 py-3.5 text-right">Quantity</th>
                <th className="px-4 py-3.5 text-right">Base Weight (KG)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60 text-slate-900 dark:text-white font-semibold">
              {godown.stockMovements?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    No stock movements recorded for this warehouse yet.
                  </td>
                </tr>
              ) : (
                godown.stockMovements?.map((m) => {
                  const isInflow = m.movementType.includes('IN');
                  return (
                    <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-extrabold">{new Date(m.date).toLocaleDateString('en-IN')}</div>
                        <div className="text-[10px] text-slate-400 font-bold">{m.referenceNo}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black border ${
                            isInflow
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                          }`}
                        >
                          {isInflow ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                          {m.movementType}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-amber-600 dark:text-amber-400">
                        {m.commodity?.localName || m.commodity?.name}
                      </td>
                      <td className="px-4 py-3 text-right font-black text-slate-900 dark:text-white">
                        {parseFloat(m.displayQuantity).toFixed(2)} {m.displayUnit}
                      </td>
                      <td className="px-4 py-3 text-right font-black">
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
