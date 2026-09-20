'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  UserPlus, 
  Search, 
  ArrowUpRight, 
  ArrowDownRight, 
  Wheat, 
  Building2, 
  Phone, 
  MapPin,
  ChevronRight
} from 'lucide-react';
import { CardGridSkeleton } from '@/components/common/SkeletonLoader';
import PartyFormModal from '@/components/parties/PartyFormModal';
import { formatCurrency } from '@/lib/utils';

export default function PartiesPage() {
  const [parties, setParties] = useState([]);
  const [stats, setStats] = useState({
    totalReceivables: '0',
    totalPayables: '0',
    farmerCount: 0,
    riceMillCount: 0,
    totalParties: 0,
  });

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchParties = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ search, role: selectedRole });
      const res = await fetch(`/api/parties?${query.toString()}`);
      const json = await res.json();
      if (json.success) {
        setParties(json.data);
        if (json.stats) setStats(json.stats);
      }
    } catch (err) {
      console.error('Failed to load parties:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParties();
  }, [search, selectedRole]);

  return (
    <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Title Header */}
      <div className="glass-card p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-extrabold text-2xl text-slate-900 dark:text-white flex items-center gap-2.5">
            <Users className="w-6 h-6 text-emerald-600 dark:text-emerald-400" /> Party Directory
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Farmers, Rice Mills, Customers & Diesel Vendors</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-extrabold px-5 py-2.5 rounded-2xl text-xs shadow-lg shadow-emerald-950/20 transition-all transform hover:-translate-y-0.5"
        >
          <UserPlus className="w-4 h-4 text-amber-300" /> Add Party
        </button>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Total Receivables</span>
            <div className="p-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-500/20">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(stats.totalReceivables)}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">To Receive</p>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Total Payables</span>
            <div className="p-1.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl border border-rose-500/20">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-rose-600 dark:text-rose-400">
            {formatCurrency(stats.totalPayables)}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">To Pay</p>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Registered Farmers</span>
            <div className="p-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-500/20">
              <Wheat className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white">{stats.farmerCount}</div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Active Farmers</p>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Rice Mills & Buyers</span>
            <div className="p-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-500/20">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white">{stats.riceMillCount}</div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Buyers & Vendors</p>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="glass-card p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search by name, code, village, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="app-input app-input-with-icon"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>

          {/* Role Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {[
              { id: 'ALL', label: 'All Parties' },
              { id: 'FARMER', label: 'Farmers' },
              { id: 'RICE_MILL', label: 'Rice Mills' },
              { id: 'CUSTOMER', label: 'Customers' },
              { id: 'VENDOR', label: 'Vendors' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedRole(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-colors duration-150 ${
                  selectedRole === tab.id
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Party Cards List */}
        {loading ? (
          <CardGridSkeleton count={6} />
        ) : parties.length === 0 ? (
          <div className="py-12 text-center text-slate-500 dark:text-slate-400 space-y-2">
            <Users className="w-10 h-10 text-emerald-500/30 mx-auto" />
            <p className="text-sm font-semibold text-slate-900 dark:text-white">No parties found matching filters</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
            >
              + Register New Party
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {parties.map((party) => (
              <Link
                key={party.id}
                href={`/parties/${party.id}`}
                className="glass-card glass-card-hover rounded-2xl p-5 border border-slate-200 dark:border-slate-800 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl overflow-hidden bg-gradient-to-tr from-emerald-600 to-emerald-500 text-white flex items-center justify-center font-extrabold text-sm shadow-md flex-shrink-0">
                        {party.avatarUrl ? (
                          <img src={party.avatarUrl} alt={party.name} className="w-full h-full object-cover" />
                        ) : (
                          party.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 uppercase font-mono">
                          {party.partyCode}
                        </span>
                        <h3 className="font-extrabold text-slate-900 dark:text-white text-base mt-0.5 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                          {party.name}
                        </h3>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:text-emerald-500 group-hover:translate-x-1 transition-transform" />
                  </div>

                  {/* Roles Badges */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {party.roles.map((r) => (
                      <span
                        key={r}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 uppercase border border-slate-200 dark:border-slate-700"
                      >
                        {r}
                      </span>
                    ))}
                  </div>

                  {/* Address & Phone */}
                  <div className="mt-4 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    {party.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>{party.phone}</span>
                      </div>
                    )}
                    {party.address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        <span className="truncate">{party.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Opening Balance Footer */}
                <div className="mt-5 pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Opening Balance:</span>
                  <span
                    className={`font-extrabold ${
                      party.balanceType === 'RECEIVABLE' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {formatCurrency(party.openingBalance)} ({party.balanceType === 'RECEIVABLE' ? 'DR' : 'CR'})
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Registration Modal */}
      <PartyFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchParties();
        }}
      />
    </main>
  );
}

