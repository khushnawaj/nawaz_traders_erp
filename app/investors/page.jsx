'use client';

import { useEffect, useState } from 'react';
import { 
  Landmark, 
  Plus, 
  Search, 
  Filter, 
  Coins, 
  Percent, 
  Calendar, 
  Receipt, 
  TrendingDown, 
  TrendingUp, 
  Building2, 
  FileText, 
  Edit, 
  Trash2, 
  LayoutGrid, 
  List, 
  CheckCircle2, 
  Clock, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { 
  fetchInvestors, 
  setSearch, 
  setCategoryFilter, 
  setStatusFilter, 
  setViewMode, 
  setSelectedInvestor, 
  setIsFormModalOpen, 
  setIsTransactionModalOpen, 
  setIsLedgerModalOpen,
  deleteInvestor
} from '@/lib/redux/slices/investorsSlice';
import InvestorFormModal from '@/components/investors/InvestorFormModal';
import CapitalTransactionModal from '@/components/investors/CapitalTransactionModal';
import InvestorLedgerModal from '@/components/investors/InvestorLedgerModal';
import toast from 'react-hot-toast';

export default function InvestorsPage() {
  const dispatch = useAppDispatch();
  const { 
    list: investors, 
    stats, 
    loading, 
    search, 
    categoryFilter, 
    statusFilter, 
    viewMode, 
    selectedInvestor, 
    isFormModalOpen, 
    isTransactionModalOpen, 
    isLedgerModalOpen 
  } = useAppSelector((state) => state.investors);

  const [investorToEdit, setInvestorToEdit] = useState(null);
  const [selectedLedgerId, setSelectedLedgerId] = useState(null);

  useEffect(() => {
    dispatch(fetchInvestors({ search, category: categoryFilter, status: statusFilter }));
  }, [dispatch, search, categoryFilter, statusFilter]);

  const handleSearchChange = (e) => {
    dispatch(setSearch(e.target.value));
  };

  const handleOpenAddModal = () => {
    setInvestorToEdit(null);
    dispatch(setIsFormModalOpen(true));
  };

  const handleOpenEditModal = (investor) => {
    setInvestorToEdit(investor);
    dispatch(setIsFormModalOpen(true));
  };

  const handleOpenTransactionModal = (investor) => {
    dispatch(setSelectedInvestor(investor));
    dispatch(setIsTransactionModalOpen(true));
  };

  const handleOpenLedgerModal = (investorId) => {
    setSelectedLedgerId(investorId);
    dispatch(setIsLedgerModalOpen(true));
  };

  const handleDeleteInvestor = async (investor) => {
    if (window.confirm(`Are you sure you want to delete investor record "${investor.name}"?`)) {
      try {
        await dispatch(deleteInvestor(investor.id)).unwrap();
        toast.success('Investor record deleted successfully');
      } catch (err) {
        toast.error(err || 'Failed to delete investor');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white pb-24">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-950 text-white border-b border-emerald-900/40 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
              <Landmark className="w-3.5 h-3.5" /> Capital & Investor Desk
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-outfit">
              Investors, Banks & Capital Loans
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-outfit mt-1">
              Track equity partners, bank facilities, private loans, profit share percentages, interest rates, EMI terms & promised payoff dates.
            </p>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="bahi-btn-primary py-2.5 px-5 text-xs font-bold font-outfit shadow-lg shadow-emerald-900/40 flex items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" /> Add Partner or Bank Loan
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-modal p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider font-outfit">
              <span>Total Principal Invested</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Coins className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-2">
              ₹{(stats.totalPrincipal || 0).toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 font-outfit">
              Across {stats.totalCount || 0} registered partners
            </div>
          </div>

          <div className="glass-modal p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider font-outfit">
              <span>Outstanding Payables</span>
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <TrendingDown className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black font-mono text-rose-600 dark:text-rose-400 mt-2">
              ₹{(stats.totalOutstanding || 0).toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 font-outfit">
              {stats.activeCount || 0} active loan/partner accounts
            </div>
          </div>

          <div className="glass-modal p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider font-outfit">
              <span>Principal Repaid</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-2">
              ₹{(stats.totalPaidPrincipal || 0).toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 font-outfit">
              Cumulative principal returned
            </div>
          </div>

          <div className="glass-modal p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider font-outfit">
              <span>Interest & Profits Paid</span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                <Percent className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black font-mono text-amber-500 mt-2">
              ₹{(stats.totalPaidInterest || 0).toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 font-outfit">
              Disbursed interest & profit share
            </div>
          </div>
        </div>

        {/* Toolbar & Filter Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 glass-modal p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search by name, code, phone, bank..."
              value={search}
              onChange={handleSearchChange}
              className="app-input pl-10 text-xs font-outfit"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 font-outfit text-xs">
            {[
              { id: 'ALL', label: 'All Partners' },
              { id: 'INVESTOR', label: 'Equity Investors' },
              { id: 'BANK', label: 'Banks & Loans' },
              { id: 'PRIVATE_FINANCIER', label: 'Financiers' },
              { id: 'INDIVIDUAL_LENDER', label: 'Lenders' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => dispatch(setCategoryFilter(tab.id))}
                className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition ${
                  categoryFilter === tab.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-800 shrink-0">
            <button
              onClick={() => dispatch(setViewMode('grid'))}
              className={`p-1.5 rounded-xl transition ${
                viewMode === 'grid' ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => dispatch(setViewMode('table'))}
              className={`p-1.5 rounded-xl transition ${
                viewMode === 'table' ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Display: Grid or Table */}
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-sm font-outfit animate-pulse">
            Loading investors and capital partners...
          </div>
        ) : investors.length === 0 ? (
          <div className="glass-modal p-12 rounded-3xl text-center border border-slate-200/80 dark:border-slate-800 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
              <Landmark className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-outfit">No Capital Partners Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto font-outfit mt-1">
                You haven&apos;t added any investor, bank loan, or private financier yet. Click the button below to record your first capital partner.
              </p>
            </div>
            <button
              onClick={handleOpenAddModal}
              className="bahi-btn-primary py-2 px-5 text-xs font-bold font-outfit inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Partner or Bank Loan
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View Cards */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {investors.map((inv) => {
              const p = parseFloat(inv.principalAmount || 0);
              const out = parseFloat(inv.currentOutstandingBalance || 0);
              const profitShare = parseFloat(inv.profitSharePercentage || 0);
              const interestRate = parseFloat(inv.annualInterestRate || 0);
              const emi = parseFloat(inv.emiAmount || 0);

              return (
                <div
                  key={inv.id}
                  className="glass-modal rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col justify-between space-y-4 group"
                >
                  <div>
                    {/* Header: Code & Category */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {inv.investorCode}
                      </span>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-slate-900 px-2.5 py-1 rounded-xl">
                        {inv.category?.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Partner Name & Contact */}
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition font-outfit">
                      {inv.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      {inv.phone || inv.email || inv.bankName || 'No contact specified'}
                    </p>

                    {/* Financial Terms Details Pills */}
                    <div className="mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-800/60 space-y-2 text-xs font-outfit">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Principal Invested:</span>
                        <span className="font-bold font-mono text-slate-900 dark:text-white">
                          ₹{p.toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Outstanding Balance:</span>
                        <span className="font-extrabold font-mono text-rose-600 dark:text-rose-400">
                          ₹{out.toLocaleString('en-IN')}
                        </span>
                      </div>

                      {profitShare > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Profit / Equity Share:</span>
                          <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
                            {profitShare}%
                          </span>
                        </div>
                      )}

                      {interestRate > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Interest Rate (% p.a.):</span>
                          <span className="font-bold font-mono text-amber-500">
                            {interestRate}% ({inv.interestType})
                          </span>
                        </div>
                      )}

                      {emi > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Monthly EMI:</span>
                          <span className="font-bold font-mono text-slate-800 dark:text-slate-200">
                            ₹{emi.toLocaleString('en-IN')} (Due {inv.emiDueDateDay || 5}th)
                          </span>
                        </div>
                      )}

                      {inv.promisedDate && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Promised Maturity:</span>
                          <span className="font-semibold font-mono text-amber-600 dark:text-amber-400">
                            {new Date(inv.promisedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Toolbar */}
                  <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleOpenTransactionModal(inv)}
                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition flex items-center justify-center gap-1.5 font-outfit"
                    >
                      <Coins className="w-3.5 h-3.5" /> Log Payment
                    </button>

                    <button
                      onClick={() => handleOpenLedgerModal(inv.id)}
                      className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition flex items-center gap-1 font-outfit"
                    >
                      <FileText className="w-3.5 h-3.5 text-emerald-500" /> Ledger
                    </button>

                    <button
                      onClick={() => handleOpenEditModal(inv)}
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="Edit Profile"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteInvestor(inv)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 transition"
                      title="Delete Partner"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table View */
          <div className="glass-modal rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-900/90 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider font-outfit border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3.5">Code</th>
                    <th className="px-4 py-3.5">Partner Name</th>
                    <th className="px-4 py-3.5">Category</th>
                    <th className="px-4 py-3.5 text-right">Principal</th>
                    <th className="px-4 py-3.5 text-right">Outstanding</th>
                    <th className="px-4 py-3.5 text-right">Share %</th>
                    <th className="px-4 py-3.5 text-right">Interest %</th>
                    <th className="px-4 py-3.5 text-right">Monthly EMI</th>
                    <th className="px-4 py-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-outfit">
                  {investors.map((inv) => {
                    const p = parseFloat(inv.principalAmount || 0);
                    const out = parseFloat(inv.currentOutstandingBalance || 0);
                    const profitShare = parseFloat(inv.profitSharePercentage || 0);
                    const interestRate = parseFloat(inv.annualInterestRate || 0);
                    const emi = parseFloat(inv.emiAmount || 0);

                    return (
                      <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition">
                        <td className="px-4 py-3.5 font-mono font-bold text-slate-900 dark:text-white">
                          {inv.investorCode}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-slate-900 dark:text-white">{inv.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{inv.phone || inv.email || '-'}</div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300">
                            {inv.category?.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono font-semibold text-slate-800 dark:text-slate-200">
                          ₹{p.toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono font-bold text-rose-600 dark:text-rose-400">
                          ₹{out.toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {profitShare > 0 ? `${profitShare}%` : '-'}
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono font-bold text-amber-500">
                          {interestRate > 0 ? `${interestRate}%` : '-'}
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono font-semibold text-slate-700 dark:text-slate-300">
                          {emi > 0 ? `₹${emi.toLocaleString('en-IN')}` : '-'}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenTransactionModal(inv)}
                              className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition flex items-center gap-1"
                            >
                              <Coins className="w-3 h-3" /> Pay
                            </button>

                            <button
                              onClick={() => handleOpenLedgerModal(inv.id)}
                              className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-[11px] transition flex items-center gap-1"
                            >
                              Ledger
                            </button>

                            <button
                              onClick={() => handleOpenEditModal(inv)}
                              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDeleteInvestor(inv)}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <InvestorFormModal
        isOpen={isFormModalOpen}
        onClose={() => dispatch(setIsFormModalOpen(false))}
        investorToEdit={investorToEdit}
      />

      <CapitalTransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => dispatch(setIsTransactionModalOpen(false))}
        investor={selectedInvestor}
      />

      <InvestorLedgerModal
        isOpen={isLedgerModalOpen}
        onClose={() => dispatch(setIsLedgerModalOpen(false))}
        investorId={selectedLedgerId}
      />
    </div>
  );
}
