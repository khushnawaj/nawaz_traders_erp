'use client';

import { useState, useEffect, useMemo } from 'react';
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
  Sparkles,
  LayoutGrid,
  List,
  Filter,
  Share2,
  ExternalLink,
  Eye,
  CheckCircle2
} from 'lucide-react';
import { CardGridSkeleton } from '@/components/common/SkeletonLoader';
import Loader from '@/components/common/Loader';
import FarmerFormModal from '@/components/farmers/FarmerFormModal';
import FarmerPurchaseModal from '@/components/farmers/FarmerPurchaseModal';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function FarmersPage() {
  const [farmers, setFarmers] = useState([]);
  const [stats, setStats] = useState({
    totalPayables: '0',
    totalReceivables: '0',
    farmerCount: 0,
  });

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [balanceFilter, setBalanceFilter] = useState('ALL'); // 'ALL' | 'PAYABLE' | 'RECEIVABLE'
  const [selectedVillage, setSelectedVillage] = useState('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [selectedFarmerForPurchase, setSelectedFarmerForPurchase] = useState(null);

  const fetchFarmers = async (isInitial = false) => {
    if (isInitial) setLoading(true);
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
    fetchFarmers(true);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFarmers(false);
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  // Extract unique villages for filtering
  const villages = useMemo(() => {
    const set = new Set();
    farmers.forEach((f) => {
      if (f.address) set.add(f.address.trim());
    });
    return Array.from(set);
  }, [farmers]);

  // Filtered farmers list
  const filteredFarmers = useMemo(() => {
    return farmers.filter((f) => {
      if (balanceFilter === 'PAYABLE' && f.balanceType !== 'PAYABLE') return false;
      if (balanceFilter === 'RECEIVABLE' && f.balanceType !== 'RECEIVABLE') return false;
      if (selectedVillage !== 'ALL' && f.address?.trim() !== selectedVillage) return false;
      return true;
    });
  }, [farmers, balanceFilter, selectedVillage]);

  const handleShareWhatsApp = (farmer, e) => {
    e.stopPropagation();
    const balanceStr = `${formatCurrency(farmer.openingBalance)} (${farmer.balanceType === 'RECEIVABLE' ? 'DR - Kisan se lene hain' : 'CR - Kisan ko dene hain'})`;
    const message = `*NAWAZ TRADERS - FARMER STATEMENT*\n*Farmer Name:* ${farmer.name}\n*Code:* ${farmer.partyCode}\n*Mobile:* ${farmer.phone || 'N/A'}\n*Village:* ${farmer.address || 'N/A'}\n*Pending Balance:* ${balanceStr}\n\nThank you for doing business with Nawaz Traders!`;
    const cleanPhone = farmer.phone ? farmer.phone.replace(/[^0-9]/g, '') : '';
    const phoneParam = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const url = `https://wa.me/${phoneParam}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-200">
      {/* Breadcrumb Navigation */}
      <Breadcrumb items={[{ label: 'Farmer Directory' }]} />

      {/* Header Banner Card */}
      <div className="glass-card p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
              <Wheat className="w-3 h-3 text-amber-500" />
              <span>Mandi Farmer Directory</span>
            </span>
          </div>
          <h1 className="font-semibold text-2xl sm:text-3xl text-slate-900 dark:text-white flex items-center gap-2">
            Farmer Directory
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
            Manage village farmers, crop procurement logs, khet advances & document vaults
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 relative z-10">
          <button
            onClick={() => {
              setSelectedFarmerForPurchase(null);
              setIsPurchaseModalOpen(true);
            }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-semibold px-4 py-2.5 rounded-2xl text-xs shadow-md transition transform hover:-translate-y-0.5"
          >
            <Wheat className="w-4 h-4" /> Record Crop Purchase
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2.5 rounded-2xl text-xs shadow-md transition transform hover:-translate-y-0.5"
          >
            <UserPlus className="w-4 h-4 text-amber-300" /> Add New Farmer
          </button>
        </div>
      </div>

      {/* Summary Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium uppercase text-slate-500 dark:text-slate-400 block">Total Registered Farmers</span>
            <div className="text-2xl font-semibold text-slate-900 dark:text-white mt-0.5">{stats.farmerCount}</div>
            <span className="text-[10px] text-slate-400 font-normal">Active Paddy & Wheat Suppliers</span>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl border border-amber-500/20">
            <Wheat className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium uppercase text-rose-600 dark:text-rose-400 block">Farmer Payables (CR)</span>
            <div className="text-2xl font-semibold text-rose-600 dark:text-rose-400 mt-0.5">
              {formatCurrency(stats.totalPayables)}
            </div>
            <span className="text-[10px] text-slate-400 font-normal">Kisan ko dene hain (Purchases)</span>
          </div>
          <div className="p-3 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-2xl border border-rose-500/20">
            <ArrowDownRight className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium uppercase text-emerald-600 dark:text-emerald-400 block">Khet Advances (DR)</span>
            <div className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {formatCurrency(stats.totalReceivables)}
            </div>
            <span className="text-[10px] text-slate-400 font-normal">Kisan se lene hain (Loans)</span>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-500/20">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search Bar & Filters Section */}
      <div className="glass-card p-4 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search by name, village, mobile, code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="app-input app-input-with-icon"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>

          {/* Filter Pills & View Switcher */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            {/* Balance Filter */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-900/80 p-1 rounded-xl border border-slate-200/60 dark:border-slate-800/60 text-xs font-medium">
              <button
                onClick={() => setBalanceFilter('ALL')}
                className={`px-3 py-1 rounded-lg transition ${
                  balanceFilter === 'ALL'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm font-semibold'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setBalanceFilter('PAYABLE')}
                className={`px-3 py-1 rounded-lg transition ${
                  balanceFilter === 'PAYABLE'
                    ? 'bg-rose-500 text-white font-semibold shadow-sm'
                    : 'text-rose-600 dark:text-rose-400 hover:bg-rose-500/10'
                }`}
              >
                Payable (CR)
              </button>
              <button
                onClick={() => setBalanceFilter('RECEIVABLE')}
                className={`px-3 py-1 rounded-lg transition ${
                  balanceFilter === 'RECEIVABLE'
                    ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                    : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10'
                }`}
              >
                Advance (DR)
              </button>
            </div>

            {/* Village Filter */}
            {villages.length > 0 && (
              <select
                value={selectedVillage}
                onChange={(e) => setSelectedVillage(e.target.value)}
                className="app-select text-xs py-1.5 px-3 max-w-[150px]"
              >
                <option value="ALL">All Villages ({villages.length})</option>
                {villages.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            )}

            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-900/80 p-1 rounded-xl border border-slate-200/60 dark:border-slate-800/60 text-xs">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content Body */}
        {loading ? (
          <CardGridSkeleton count={6} />
        ) : filteredFarmers.length === 0 ? (
          <div className="py-16 text-center text-slate-500 dark:text-slate-400 space-y-3">
            <Wheat className="w-10 h-10 text-amber-500/40 mx-auto" />
            <p className="text-xs font-semibold text-slate-900 dark:text-white">No farmers matching filters</p>
            <button
              onClick={() => {
                setSearch('');
                setBalanceFilter('ALL');
                setSelectedVillage('ALL');
              }}
              className="text-xs text-emerald-600 dark:text-emerald-400 font-medium underline"
            >
              Reset Filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* GRID VIEW */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
            {filteredFarmers.map((farmer) => (
              <div
                key={farmer.id}
                className="glass-card glass-card-hover rounded-2xl p-4 border border-slate-200/60 dark:border-slate-800/60 flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl overflow-hidden bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 flex items-center justify-center font-bold text-base shadow-sm shrink-0">
                        {farmer.avatarUrl ? (
                          <img src={farmer.avatarUrl} alt={farmer.name} className="w-full h-full object-cover" />
                        ) : (
                          farmer.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono font-semibold text-amber-700 dark:text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 uppercase">
                            {farmer.partyCode}
                          </span>
                          {farmer.bankDocUrl || farmer.aadhaarDocUrl ? (
                            <span className="text-[9px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                              KYC Docs ✓
                            </span>
                          ) : null}
                        </div>
                        <Link href={`/farmers/${farmer.id}`}>
                          <h3 className="font-semibold text-slate-900 dark:text-white text-base mt-0.5 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                            {farmer.name}
                          </h3>
                        </Link>
                      </div>
                    </div>

                    <Link href={`/farmers/${farmer.id}`}>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>

                  <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300 font-normal">
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

                <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-normal">Pending Balance:</span>
                    <span
                      className={`font-semibold ${
                        farmer.balanceType === 'RECEIVABLE' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {formatCurrency(farmer.openingBalance)} ({farmer.balanceType === 'RECEIVABLE' ? 'DR' : 'CR'})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedFarmerForPurchase(farmer);
                        setIsPurchaseModalOpen(true);
                      }}
                      className="w-full py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/20 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1 transition"
                    >
                      <Wheat className="w-3.5 h-3.5" /> Buy Crop
                    </button>

                    <button
                      onClick={(e) => handleShareWhatsApp(farmer, e)}
                      className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-xl transition"
                      title="Share Statement on WhatsApp"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>

                    <Link
                      href={`/farmers/${farmer.id}`}
                      className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-[11px] font-medium transition"
                    >
                      Profile
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* TABLE VIEW */
          <div className="overflow-x-auto rounded-2xl border border-slate-200/60 dark:border-slate-800/60">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 font-semibold uppercase border-b border-slate-200/60 dark:border-slate-800/60">
                <tr>
                  <th className="p-3">Farmer Code</th>
                  <th className="p-3">Farmer Name</th>
                  <th className="p-3">Mobile</th>
                  <th className="p-3">Village / Address</th>
                  <th className="p-3 text-right">Pending Balance</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60 font-medium">
                {filteredFarmers.map((farmer) => (
                  <tr key={farmer.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="p-3 font-mono text-amber-700 dark:text-amber-300 font-semibold">{farmer.partyCode}</td>
                    <td className="p-3">
                      <Link href={`/farmers/${farmer.id}`} className="font-semibold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition">
                        {farmer.name}
                      </Link>
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">{farmer.phone || '-'}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">{farmer.address || '-'}</td>
                    <td className="p-3 text-right font-semibold">
                      <span className={farmer.balanceType === 'RECEIVABLE' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                        {formatCurrency(farmer.openingBalance)} ({farmer.balanceType === 'RECEIVABLE' ? 'DR' : 'CR'})
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedFarmerForPurchase(farmer);
                            setIsPurchaseModalOpen(true);
                          }}
                          className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/20 rounded-lg text-[11px] font-medium"
                        >
                          Buy Crop
                        </button>
                        <Link
                          href={`/farmers/${farmer.id}`}
                          className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-lg text-[11px] font-medium"
                        >
                          Profile ↗
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form & Purchase Modals */}
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
