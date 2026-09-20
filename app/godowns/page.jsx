'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Warehouse, 
  Plus, 
  Search, 
  Scale, 
  MapPin, 
  User, 
  TrendingUp, 
  TrendingDown, 
  ChevronRight, 
  Wheat, 
  Layers,
  Building2,
  Trash2,
  Edit3
} from 'lucide-react';
import toast from 'react-hot-toast';
import GodownFormModal from '@/components/godowns/GodownFormModal';

export default function GodownsPage() {
  const [godowns, setGodowns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGodown, setSelectedGodown] = useState(null);

  const loadGodowns = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/godowns');
      const json = await res.json();
      if (json.success) setGodowns(json.data || []);
    } catch (err) {
      toast.error('Failed to load godowns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGodowns();
  }, []);

  const handleDeleteGodown = async (id, name) => {
    if (!confirm(`Are you sure you want to delete godown "${name}"?`)) return;

    try {
      const res = await fetch(`/api/godowns/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to delete godown');

      toast.success('Godown deleted successfully');
      loadGodowns();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Stats Calculations
  const totalGodowns = godowns.length;
  const totalCapacityMT = godowns.reduce((acc, curr) => acc + (curr.capacity || 0), 0);
  const totalLiveStockMT = godowns.reduce((acc, curr) => acc + (curr.totalStockMT || 0), 0);
  const totalLiveStockQtl = godowns.reduce((acc, curr) => acc + (curr.totalStockQtl || 0), 0);

  const capacityUtilization = totalCapacityMT > 0 ? (totalLiveStockMT / totalCapacityMT) * 100 : 0;

  const filteredGodowns = godowns.filter((g) => {
    const query = search.toLowerCase();
    return (
      g.name.toLowerCase().includes(query) ||
      g.code.toLowerCase().includes(query) ||
      (g.location && g.location.toLowerCase().includes(query)) ||
      (g.supervisor && g.supervisor.toLowerCase().includes(query))
    );
  });

  return (
    <div className="max-w-[1550px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-1">
            <Warehouse className="w-3.5 h-3.5" /> Warehouses & Grain Storage
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Godowns & Stock Inventory
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track Paddy, Wheat, Gram & Oilseeds live storage across Mandi sheds & warehouses
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedGodown(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-extrabold px-4 py-2.5 rounded-2xl text-xs shadow-lg shadow-emerald-950/20 transition-all transform hover:-translate-y-0.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-amber-300" /> Add Godown
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xl relative overflow-hidden group hover:border-emerald-500/40 transition-all duration-300">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">Active Warehouses</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-500/20 group-hover:scale-110 transition-transform">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">{totalGodowns}</div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Registered Storage Locations</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xl relative overflow-hidden group hover:border-amber-500/40 transition-all duration-300">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">Total Grain Stock</span>
            <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-500/20 group-hover:scale-110 transition-transform">
              <Wheat className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
            {totalLiveStockQtl.toLocaleString('en-IN', { maximumFractionDigits: 1 })} QTL
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Equivalent to {totalLiveStockMT.toLocaleString('en-IN', { maximumFractionDigits: 1 })} MT
          </p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xl relative overflow-hidden group hover:border-emerald-500/40 transition-all duration-300">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">Total Capacity</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-500/20 group-hover:scale-110 transition-transform">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {totalCapacityMT.toLocaleString('en-IN')} MT
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Total Allocated Storage Space</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xl relative overflow-hidden group hover:border-purple-500/40 transition-all duration-300">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">Space Occupancy</span>
            <div className="p-2 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl border border-purple-500/20 group-hover:scale-110 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {capacityUtilization.toFixed(1)}%
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Shed Capacity Utilization</p>
        </div>
      </div>

      {/* Main Container */}
      <div className="glass-card p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl space-y-6">
        {/* Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search godown name, code, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="app-input app-input-with-icon"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>
          <span className="text-xs text-slate-500 font-extrabold">
            Showing {filteredGodowns.length} Godowns
          </span>
        </div>

        {/* Godowns Cards Grid */}
        {loading ? (
          <div className="py-16 text-center text-slate-500 text-sm">Loading warehouses...</div>
        ) : filteredGodowns.length === 0 ? (
          <div className="py-16 text-center text-slate-500 space-y-3">
            <Warehouse className="w-12 h-12 text-emerald-500/30 mx-auto" />
            <p className="text-base font-extrabold text-slate-900 dark:text-white">No Godowns found</p>
            <p className="text-xs">Click "+ Add Godown" to create your first warehouse.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredGodowns.map((g) => {
              const capacityMT = g.capacity || 0;
              const stockMT = g.totalStockMT || 0;
              const usagePct = capacityMT > 0 ? Math.min(100, (stockMT / capacityMT) * 100) : 0;

              return (
                <div
                  key={g.id}
                  className="p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/40 transition-all duration-200 space-y-4 shadow-md group"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-xl border border-emerald-500/20 group-hover:scale-105 transition-transform">
                        <Warehouse className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-base font-black text-slate-900 dark:text-white block uppercase tracking-tight">
                          {g.name}
                        </span>
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-extrabold block">
                          {g.code} {g.location ? `• ${g.location}` : ''}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setSelectedGodown(g);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
                        title="Edit Godown"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteGodown(g.id, g.name)}
                        className="p-1.5 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-950 text-slate-400 hover:text-rose-600 transition"
                        title="Delete Godown"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Supervisor */}
                  {g.supervisor && (
                    <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800/60">
                      <User className="w-3.5 h-3.5 text-amber-500" /> In-Charge: <span className="font-extrabold text-slate-900 dark:text-white">{g.supervisor}</span>
                    </div>
                  )}

                  {/* Capacity Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-500 dark:text-slate-400 uppercase text-[10px]">Storage Capacity</span>
                      <span className="text-slate-900 dark:text-white">
                        {stockMT.toFixed(1)} / {capacityMT ? `${capacityMT} MT` : 'Uncapped'} ({usagePct.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          usagePct > 85 ? 'bg-rose-500' : usagePct > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${capacityMT > 0 ? usagePct : 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Stock Commodity Breakdown Badges */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Live Grain Stocks</span>
                    {g.stockBreakdown?.length === 0 ? (
                      <span className="text-xs text-slate-400 italic">No grain stock stored currently</span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {g.stockBreakdown?.map((stk, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-xl text-xs font-extrabold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 flex items-center gap-1"
                          >
                            <Wheat className="w-3 h-3 text-amber-500" />
                            <span>{stk.commodityName}: <strong className="text-slate-900 dark:text-white">{stk.stockQtl.toFixed(1)} Qtl</strong></span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Action Link */}
                  <div className="pt-2">
                    <Link
                      href={`/godowns/${g.id}`}
                      className="w-full py-2 px-3 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-1"
                    >
                      View Stock Ledger <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Form Modal */}
      <GodownFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedGodown(null);
        }}
        initialData={selectedGodown}
        onSuccess={loadGodowns}
      />
    </div>
  );
}
