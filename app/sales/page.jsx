'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { exportToExcel } from '@/lib/utils/excelExport';
import { 
  TrendingUp, 
  Plus, 
  Search, 
  Wheat, 
  Calendar, 
  CreditCard, 
  ChevronRight, 
  Building2, 
  Warehouse,
  CheckCircle2,
  Clock,
  Trash2,
  FileText,
  DollarSign,
  Download
} from 'lucide-react';
import toast from 'react-hot-toast';
import SaleFormModal from '@/components/sales/SaleFormModal';

export default function SalesPage() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleExportExcel = () => {
    const columns = [
      { label: 'Sale Invoice No', key: 'saleNo' },
      { label: 'Date', key: 'date' },
      { label: 'Customer / Rice Mill', key: 'party.name' },
      { label: 'Phone', key: 'party.phone' },
      { label: 'Godown', key: 'godown.name' },
      { label: 'Net Amount (₹)', key: 'netAmount' },
      { label: 'Received Amount (₹)', key: 'receivedAmount' },
      { label: 'Due Amount (₹)', key: 'dueAmount' },
      { label: 'Payment Status', key: 'paymentStatus' },
      { label: 'Invoice Status', key: 'status' },
    ];
    exportToExcel('Sales_Register', columns, filteredSales);
    toast.success('Sales register exported to CSV/Excel');
  };

  const loadSales = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/sales');
      const json = await res.json();
      if (json.success) setSales(json.data || []);
    } catch (err) {
      toast.error('Failed to load sales directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSales();
  }, []);

  const handleDeleteSale = async (id, saleNo) => {
    if (!confirm(`Are you sure you want to delete sale invoice "${saleNo}"? Stock will be reverted to Godown.`)) return;

    try {
      const res = await fetch(`/api/sales/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to delete sale');

      toast.success('Sale invoice deleted & stock reverted');
      loadSales();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Stats Calculations
  const totalSalesRevenue = sales.reduce((acc, s) => acc + (parseFloat(s.netAmount) || 0), 0);
  const totalReceivedAmount = sales.reduce((acc, s) => acc + (parseFloat(s.receivedAmount) || 0), 0);
  const totalDueAmount = sales.reduce((acc, s) => acc + (parseFloat(s.dueAmount) || 0), 0);

  // Total Quantity Sold in Quintals
  const totalQuantitySoldQtl = sales.reduce((acc, s) => {
    const itemQty = s.items?.[0]?.displayQuantity || 0;
    return acc + (parseFloat(itemQty) || 0);
  }, 0);

  const filteredSales = sales.filter((s) => {
    const query = search.toLowerCase();
    const matchesSearch = (
      s.saleNo.toLowerCase().includes(query) ||
      (s.party?.name && s.party.name.toLowerCase().includes(query)) ||
      (s.godown?.name && s.godown.name.toLowerCase().includes(query)) ||
      (s.items?.[0]?.commodity?.name && s.items[0].commodity.name.toLowerCase().includes(query)) ||
      (s.items?.[0]?.commodity?.localName && s.items[0].commodity.localName.toLowerCase().includes(query))
    );

    const matchesStatus = statusFilter === 'ALL' || s.paymentStatus === statusFilter;
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 mb-1">
            <TrendingUp className="w-3.5 h-3.5" /> Grain Sales & Outflow
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Sales & Invoices
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track Commercial Grain dispatches to Rice Mills, Buyers & Payment collections
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-extrabold px-3.5 py-2.5 rounded-2xl text-xs border border-slate-200 dark:border-slate-700 transition-all"
          >
            <Download className="w-4 h-4 text-purple-500" /> Export Excel
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-extrabold px-4 py-2.5 rounded-2xl text-xs shadow-lg shadow-purple-950/20 transition-all transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4 text-amber-300" /> New Sale Invoice
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xl relative overflow-hidden group hover:border-purple-500/40 transition-all duration-300">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">Total Sales Revenue</span>
            <div className="p-2 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl border border-purple-500/20 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
            {formatCurrency(totalSalesRevenue)}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Across {sales.length} Commercial Invoices</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xl relative overflow-hidden group hover:border-amber-500/40 transition-all duration-300">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">Total Grain Sold</span>
            <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-500/20 group-hover:scale-110 transition-transform">
              <Wheat className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
            {totalQuantitySoldQtl.toLocaleString('en-IN', { maximumFractionDigits: 1 })} QTL
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Equivalent to {(totalQuantitySoldQtl / 10).toFixed(1)} MT
          </p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xl relative overflow-hidden group hover:border-emerald-500/40 transition-all duration-300">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">Payments Collected</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-500/20 group-hover:scale-110 transition-transform">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {formatCurrency(totalReceivedAmount)}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Received from Rice Mills / Buyers</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xl relative overflow-hidden group hover:border-amber-500/40 transition-all duration-300">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">Outstanding Receivables</span>
            <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-500/20 group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
            {formatCurrency(totalDueAmount)}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Pending Customer Receivables</p>
        </div>
      </div>

      {/* Main Directory */}
      <div className="glass-card p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl space-y-6">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search sale no, buyer, commodity, godown..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="app-input app-input-with-icon"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {[
              { id: 'ALL', label: 'All Sales' },
              { id: 'UNPAID', label: 'Unpaid Bills' },
              { id: 'PARTIAL', label: 'Partial Collection' },
              { id: 'PAID', label: 'Fully Paid' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-colors duration-150 ${
                  statusFilter === tab.id
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-950/80 text-slate-700 dark:text-slate-300 font-extrabold uppercase border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3.5">Date & Invoice No</th>
                <th className="px-4 py-3.5">Customer / Rice Mill</th>
                <th className="px-4 py-3.5">Commodity</th>
                <th className="px-4 py-3.5">Godown Source</th>
                <th className="px-4 py-3.5 text-right">Qty & Sale Rate</th>
                <th className="px-4 py-3.5 text-right">Net Bill</th>
                <th className="px-4 py-3.5 text-right">Received</th>
                <th className="px-4 py-3.5 text-right">Status & Due</th>
                <th className="px-4 py-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60 text-slate-900 dark:text-white font-semibold">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-500">
                    Loading sales records...
                  </td>
                </tr>
              ) : filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-500">
                    No commercial sales recorded yet. Click &quot;+ New Sale&quot; to register one.
                  </td>
                </tr>
              ) : (
                filteredSales.map((s) => {
                  const item = s.items?.[0];
                  const commodityName = item?.commodity?.localName || item?.commodity?.name || 'Grain';
                  const unitCode = item?.unit?.code || 'QTL';

                  return (
                    <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-extrabold">{new Date(s.date).toLocaleDateString('en-IN')}</div>
                        <div className="text-[10px] text-slate-400 font-bold">{s.saleNo}</div>
                      </td>

                      <td className="px-4 py-3">
                        <span className="font-black text-slate-900 dark:text-white block">{s.party?.name}</span>
                        <span className="text-[10px] text-slate-400 block">{s.party?.partyCode}</span>
                      </td>

                      <td className="px-4 py-3">
                        <span className="font-bold text-amber-600 dark:text-amber-400">{commodityName}</span>
                      </td>

                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <Warehouse className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{s.godown?.name || 'Main Godown'}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="font-black text-slate-900 dark:text-white">
                          {parseFloat(item?.displayQuantity || 0).toFixed(2)} {unitCode}
                        </div>
                        <div className="text-[10px] text-slate-400 font-bold">@ ₹{parseFloat(item?.ratePerUnit || 0).toFixed(2)}</div>
                      </td>

                      <td className="px-4 py-3 text-right font-black text-purple-600 dark:text-purple-400">
                        {formatCurrency(s.netAmount)}
                      </td>

                      <td className="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(s.receivedAmount)}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                            s.paymentStatus === 'PAID'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                              : s.paymentStatus === 'PARTIAL'
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                          }`}
                        >
                          {s.paymentStatus}
                        </span>
                        {parseFloat(s.dueAmount) > 0 && (
                          <div className="text-[11px] font-black text-amber-600 dark:text-amber-400 mt-0.5">
                            Due: {formatCurrency(s.dueAmount)}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Link
                            href={`/sales/${s.id}`}
                            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
                            title="View Invoice Slip"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => handleDeleteSale(s.id, s.saleNo)}
                            className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 transition"
                            title="Delete Sale"
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

      {/* Modal */}
      <SaleFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadSales}
      />
    </div>
  );
}
