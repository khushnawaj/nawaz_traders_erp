'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Wheat, 
  UserPlus, 
  Search, 
  ArrowDownRight, 
  ArrowUpRight, 
  Phone, 
  MapPin, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import FarmerFormModal from '@/components/farmers/FarmerFormModal';
import FarmerPurchaseModal from '@/components/farmers/FarmerPurchaseModal';
import { formatCurrency } from '@/lib/utils';

export default function FarmersPage() {
  const [farmers, setFarmers] = useState([]);
  const [stats, setStats] = useState({
    totalPayables: '0',
    totalReceivables: '0',
    farmerCount: 0,
  });

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [selectedFarmerForPurchase, setSelectedFarmerForPurchase] = useState(null);

  const fetchFarmers = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ search, role: 'FARMER' });
      const res = await fetch(`/api/parties?${query.toString()}`);
      const json = await res.json();
      if (json.success) {
        setFarmers(json.data);
        if (json.stats) {
          setStats({
            totalPayables: json.stats.totalPayables,
            totalReceivables: json.stats.totalReceivables,
            farmerCount: json.stats.farmerCount,
          });
        }
      }
    } catch (err) {
      console.error('Failed to load farmers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmers();
  }, [search]);

  return (
    <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Title Header */}
      <div className="glass-card p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-extrabold text-2xl text-slate-900 dark:text-white flex items-center gap-2.5">
            <Wheat className="w-6 h-6 text-amber-500 dark:text-amber-400" /> Farmer Directory (किसान सूची)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Registered farmers, crop procurement logs & payment ledgers</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              setSelectedFarmerForPurchase(null);
              setIsPurchaseModalOpen(true);
            }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-extrabold px-4 py-2.5 rounded-2xl text-xs shadow-lg shadow-amber-500/20 transition-all transform hover:-translate-y-0.5"
          >
            <Wheat className="w-4 h-4" /> Record Crop Purchase (फसल खरीदी पर्ची)
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-extrabold px-4 py-2.5 rounded-2xl text-xs shadow-lg shadow-emerald-950/20 transition-all transform hover:-translate-y-0.5"
          >
            <UserPlus className="w-4 h-4 text-amber-300" /> Add Farmer (किसान जोड़ें)
          </button>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Registered Farmers</span>
            <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-500/20">
              <Wheat className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{stats.farmerCount}</div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Active Farmers in System</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Farmer Payables</span>
            <div className="p-1.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl border border-rose-500/20">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
            {formatCurrency(stats.totalPayables)}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Kisan ko dene hain (Crop payment balance)</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Khet Advance Receivables</span>
            <div className="p-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-500/20">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(stats.totalReceivables)}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Advance loans given</p>
        </div>
      </div>

      {/* Search & List Container */}
      <div className="glass-card p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="relative w-full sm:w-96">
            <input
              type="text"
              placeholder="Search by farmer name, village, mobile..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="app-input app-input-with-icon"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-500 dark:text-slate-400 text-xs">Loading farmer directory...</div>
        ) : farmers.length === 0 ? (
          <div className="py-16 text-center text-slate-500 dark:text-slate-400 space-y-3">
            <Wheat className="w-12 h-12 text-amber-500/30 mx-auto" />
            <p className="text-sm font-semibold text-slate-900 dark:text-white">No farmers found</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
            >
              + Register First Farmer
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {farmers.map((farmer) => (
              <div
                key={farmer.id}
                className="glass-card glass-card-hover rounded-2xl p-5 border border-slate-200 dark:border-slate-800 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl overflow-hidden bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 flex items-center justify-center font-extrabold text-sm shadow-md flex-shrink-0">
                        {farmer.avatarUrl ? (
                          <img src={farmer.avatarUrl} alt={farmer.name} className="w-full h-full object-cover" />
                        ) : (
                          farmer.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <span className="text-[10px] font-extrabold text-amber-700 dark:text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 uppercase font-mono">
                          {farmer.partyCode}
                        </span>
                        <Link href={`/farmers/${farmer.id}`}>
                          <h3 className="font-extrabold text-slate-900 dark:text-white text-base mt-0.5 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition">
                            {farmer.name}
                          </h3>
                        </Link>
                      </div>
                    </div>
                    <Link href={`/farmers/${farmer.id}`}>
                      <ChevronRight className="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:text-amber-500 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>

                  <div className="mt-4 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    {farmer.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>{farmer.phone}</span>
                      </div>
                    )}
                    {farmer.address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        <span className="truncate">{farmer.address} {farmer.city ? `(${farmer.city})` : ''}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-200 dark:border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Pending Balance:</span>
                    <span
                      className={`font-extrabold ${
                        farmer.balanceType === 'RECEIVABLE' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {formatCurrency(farmer.openingBalance)} ({farmer.balanceType === 'RECEIVABLE' ? 'DR' : 'CR'})
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => {
                        setSelectedFarmerForPurchase(farmer);
                        setIsPurchaseModalOpen(true);
                      }}
                      className="w-full py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/20 rounded-xl text-[11px] font-extrabold flex items-center justify-center gap-1 transition"
                    >
                      <Wheat className="w-3.5 h-3.5" /> Buy Crop (फसल खरीदी)
                    </button>
                    <Link
                      href={`/farmers/${farmer.id}`}
                      className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-[11px] font-bold text-center transition"
                    >
                      Profile
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <FarmerFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => fetchFarmers()}
      />

      <FarmerPurchaseModal
        isOpen={isPurchaseModalOpen}
        onClose={() => {
          setIsPurchaseModalOpen(false);
          setSelectedFarmerForPurchase(null);
        }}
        defaultFarmer={selectedFarmerForPurchase}
        onSuccess={() => fetchFarmers()}
      />
    </main>
  );
}

