'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, 
  Plus, 
  Search, 
  Wheat, 
  Calendar, 
  CreditCard, 
  ChevronRight, 
  User, 
  Warehouse,
  CheckCircle2,
  Clock,
  Trash2,
  FileText,
  DollarSign
} from 'lucide-react';
import toast from 'react-hot-toast';
import PurchaseFormModal from '@/components/purchases/PurchaseFormModal';

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadPurchases = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/purchases');
      const json = await res.json();
      if (json.success) setPurchases(json.data || []);
    } catch (err) {
      toast.error('Failed to load purchases');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPurchases();
  }, []);

  const handleDeletePurchase = async (id, purchaseNo) => {
    if (!confirm(`Are you sure you want to delete crop purchase voucher "${purchaseNo}"?`)) return;

    try {
      const res = await fetch(`/api/purchases/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to delete purchase');

      toast.success('Purchase voucher deleted');
      loadPurchases();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Metric Stats Calculations
  const totalPurchaseValue = purchases.reduce((acc, p) => acc + (parseFloat(p.netAmount) || 0), 0);
  const totalPaidAmount = purchases.reduce((acc, p) => acc + (parseFloat(p.paidAmount) || 0), 0);
  const totalDueAmount = purchases.reduce((acc, p) => acc + (parseFloat(p.dueAmount) || 0), 0);

  // Total Quantity Purchased in Quintals
  const totalQuantityQtl = purchases.reduce((acc, p) => {
    const itemQty = p.items?.[0]?.displayQuantity || 0;
    return acc + (parseFloat(itemQty) || 0);
  }, 0);

  const filteredPurchases = purchases.filter((p) => {
    const query = search.toLowerCase();
    const matchesSearch = (
      p.purchaseNo.toLowerCase().includes(query) ||
      (p.party?.name && p.party.name.toLowerCase().includes(query)) ||
      (p.godown?.name && p.godown.name.toLowerCase().includes(query)) ||
      (p.items?.[0]?.commodity?.name && p.items[0].commodity.name.toLowerCase().includes(query)) ||
      (p.items?.[0]?.commodity?.localName && p.items[0].commodity.localName.toLowerCase().includes(query))
    );

    const matchesStatus = statusFilter === 'ALL' || p.paymentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  return (
    <div className="max-w-[1550px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-1">
            <ShoppingBag className="w-3.5 h-3.5" /> Grain Procurement & Purchases
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Crop Purchases & Vouchers
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track Mandi procurement, Palledari / Labour pay, Farmer settlements & promised dates
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-extrabold px-4 py-2.5 rounded-2xl text-xs shadow-lg shadow-emerald-950/20 transition-all transform hover:-translate-y-0.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-amber-300" /> New Crop Purchase
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xl relative overflow-hidden group hover:border-emerald-500/40 transition-all duration-300">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">Total Procurement Cost</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-500/20 group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {formatCurrency(totalPurchaseValue)}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Across {purchases.length} Purchase Vouchers</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xl relative overflow-hidden group hover:border-amber-500/40 transition-all duration-300">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">Total Quantity Purchased</span>
            <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-500/20 group-hover:scale-110 transition-transform">
              <Wheat className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
            {totalQuantityQtl.toLocaleString('en-IN', { maximumFractionDigits: 1 })} QTL
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Equivalent to {(totalQuantityQtl / 10).toFixed(1)} MT
          </p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xl relative overflow-hidden group hover:border-emerald-500/40 transition-all duration-300">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">Total Paid / Advance</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-500/20 group-hover:scale-110 transition-transform">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {formatCurrency(totalPaidAmount)}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Paid to Farmers at Mandi</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xl relative overflow-hidden group hover:border-rose-500/40 transition-all duration-300">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">Farmer Dues Payable</span>
            <div className="p-2 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl border border-rose-500/20 group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
            {formatCurrency(totalDueAmount)}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Outstanding Farmer Payment Balance</p>
        </div>
      </div>

      {/* Purchases Directory Container */}
      <div className="glass-card p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl space-y-6">
        {/* Controls: Search & Payment Status Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search voucher, farmer, crop, godown..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="app-input app-input-with-icon"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {[
              { id: 'ALL', label: 'All Purchases' },
              { id: 'UNPAID', label: 'Unpaid Dues' },
              { id: 'PARTIAL', label: 'Partially Paid' },
              { id: 'PAID', label: 'Fully Paid' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-colors duration-150 ${
                  statusFilter === tab.id
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Purchases Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-950/80 text-slate-700 dark:text-slate-300 font-extrabold uppercase border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3.5">Date & Voucher No</th>
                <th className="px-4 py-3.5">Farmer Name</th>
                <th className="px-4 py-3.5">Crop / Commodity</th>
                <th className="px-4 py-3.5">Godown</th>
                <th className="px-4 py-3.5 text-right">Qty & Rate</th>
                <th className="px-4 py-3.5 text-right">Net Bill</th>
                <th className="px-4 py-3.5 text-right">Advance / Paid</th>
                <th className="px-4 py-3.5 text-right">Status & Due</th>
                <th className="px-4 py-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60 text-slate-900 dark:text-white font-semibold">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-500">
                    Loading crop purchases...
                  </td>
                </tr>
              ) : filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-500">
                    No crop purchases recorded yet. Click "+ New Crop Purchase" to register one.
                  </td>
                </tr>
              ) : (
                filteredPurchases.map((p) => {
                  const item = p.items?.[0];
                  const commodityName = item?.commodity?.localName || item?.commodity?.name || 'Grain';
                  const unitCode = item?.unit?.code || 'QTL';

                  return (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-extrabold">{new Date(p.date).toLocaleDateString('en-IN')}</div>
                        <div className="text-[10px] text-slate-400 font-bold">{p.purchaseNo}</div>
                      </td>

                      <td className="px-4 py-3">
                        <span className="font-black text-slate-900 dark:text-white block">{p.party?.name}</span>
                        <span className="text-[10px] text-slate-400 block">{p.party?.partyCode}</span>
                      </td>

                      <td className="px-4 py-3">
                        <span className="font-bold text-amber-600 dark:text-amber-400">{commodityName}</span>
                      </td>

                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {p.godown?.name || 'Main Godown'}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="font-black text-slate-900 dark:text-white">
                          {parseFloat(item?.displayQuantity || 0).toFixed(2)} {unitCode}
                        </div>
                        <div className="text-[10px] text-slate-400 font-bold">@ ₹{parseFloat(item?.ratePerUnit || 0).toFixed(2)}</div>
                      </td>

                      <td className="px-4 py-3 text-right font-black text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(p.netAmount)}
                      </td>

                      <td className="px-4 py-3 text-right font-bold text-slate-700 dark:text-slate-300">
                        {formatCurrency(p.paidAmount)}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                            p.paymentStatus === 'PAID'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                              : p.paymentStatus === 'PARTIAL'
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                          }`}
                        >
                          {p.paymentStatus}
                        </span>
                        {parseFloat(p.dueAmount) > 0 && (
                          <div className="text-[11px] font-black text-rose-600 dark:text-rose-400 mt-0.5">
                            Due: {formatCurrency(p.dueAmount)}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Link
                            href={`/purchases/${p.id}`}
                            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
                            title="View Voucher Invoice"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => handleDeletePurchase(p.id, p.purchaseNo)}
                            className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 transition"
                            title="Delete Voucher"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      <PurchaseFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadPurchases}
      />
    </div>
  );
}
