'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  User, 
  Phone, 
  MapPin, 
  ArrowLeft, 
  Receipt, 
  CreditCard, 
  Wheat, 
  Landmark, 
  Building2,
  Camera,
  Copy,
  Edit,
  Upload,
  Share2,
  Eye,
  ShieldCheck,
  Calendar,
  Sparkles,
  Printer,
  PlusCircle,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  FileSpreadsheet,
  CheckCircle2,
  Search
} from 'lucide-react';
import ProfileAvatarModal from '@/components/common/ProfileAvatarModal';
import PartyFormModal from '@/components/parties/PartyFormModal';
import PartyPaymentModal from '@/components/parties/PartyPaymentModal';
import PartyVoucherReceiptModal from '@/components/parties/PartyVoucherReceiptModal';
import DocumentPreviewModal from '@/components/common/DocumentPreviewModal';
import Loader from '@/components/common/Loader';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { formatCurrency, formatWeight } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function PartyProfilePage() {
  const params = useParams();
  const id = params?.id;
  const [party, setParty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ledger'); // default to 'ledger' for financial focus
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Modals for Payment & Voucher Slips
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);

  // Lightbox document preview state
  const [previewDocUrl, setPreviewDocUrl] = useState(null);
  const [previewDocTitle, setPreviewDocTitle] = useState('');
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // Ledger Filter States (Datewise & Type)
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [ledgerTypeFilter, setLedgerTypeFilter] = useState('ALL'); // 'ALL', 'DEBIT_ONLY', 'CREDIT_ONLY'
  const [ledgerSearchText, setLedgerSearchText] = useState('');

  const openDocPreview = (url, title) => {
    setPreviewDocUrl(url);
    setPreviewDocTitle(title);
    setIsPreviewModalOpen(true);
  };

  const fetchProfile = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/parties/${id}`);
      const json = await res.json();
      if (json.success) {
        setParty(json.data);
      }
    } catch (err) {
      console.error('Error fetching party profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [id]);

  // Filtered Ledger Entries Datewise & Typewise
  const filteredLedgerEntries = useMemo(() => {
    if (!party?.ledgerEntries) return [];
    return party.ledgerEntries.filter((entry) => {
      // Date filter
      const entryDate = new Date(entry.date);
      if (startDate && new Date(startDate) > entryDate) return false;
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (end < entryDate) return false;
      }

      // Type Filter
      const debit = parseFloat(entry.debit || 0);
      const credit = parseFloat(entry.credit || 0);
      if (ledgerTypeFilter === 'DEBIT_ONLY' && debit <= 0) return false;
      if (ledgerTypeFilter === 'CREDIT_ONLY' && credit <= 0) return false;

      // Text Search
      if (ledgerSearchText) {
        const query = ledgerSearchText.toLowerCase();
        const matchNo = entry.voucherNo?.toLowerCase().includes(query);
        const matchType = entry.voucherType?.toLowerCase().includes(query);
        const matchNarration = entry.narration?.toLowerCase().includes(query);
        if (!matchNo && !matchType && !matchNarration) return false;
      }

      return true;
    });
  }, [party, startDate, endDate, ledgerTypeFilter, ledgerSearchText]);

  // Summary Metrics for Filtered Ledger
  const ledgerMetrics = useMemo(() => {
    let totalDebit = 0;
    let totalCredit = 0;
    filteredLedgerEntries.forEach((e) => {
      totalDebit += parseFloat(e.debit || 0);
      totalCredit += parseFloat(e.credit || 0);
    });
    return {
      totalDebit,
      totalCredit,
      count: filteredLedgerEntries.length,
    };
  }, [filteredLedgerEntries]);

  const handleCopyBankDetails = () => {
    if (!party?.accountNo && !party?.bankName) {
      toast.error('No bank details available to copy');
      return;
    }
    const text = `Account Holder: ${party.name}\nBank Name: ${party.bankName || 'N/A'}\nAccount No: ${party.accountNo || 'N/A'}\nIFSC Code: ${party.ifscCode || 'N/A'}`;
    navigator.clipboard.writeText(text);
    toast.success('Bank details copied to clipboard!');
  };

  const handleShareWhatsApp = () => {
    const balanceStr = `${formatCurrency(party.openingBalance)} (${party.balanceType === 'RECEIVABLE' ? 'DR - Lene hain (Udhaar)' : 'CR - Dene hain'})`;
    const message = `*NAWAZ TRADERS - KHAATA STATEMENT*\n*Customer Name:* ${party.name}\n*Party Code:* ${party.partyCode}\n*Mobile:* ${party.phone || 'N/A'}\n*Current Balance:* ${balanceStr}\n*Total Period Udhaar (DR):* ${formatCurrency(ledgerMetrics.totalDebit)}\n*Total Period Jama (CR):* ${formatCurrency(ledgerMetrics.totalCredit)}\n\nThank you for doing business with Nawaz Traders!`;
    const cleanPhone = party.phone ? party.phone.replace(/[^0-9]/g, '') : '';
    const phoneParam = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const url = `https://wa.me/${phoneParam}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handlePrintPassbook = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <Loader text="Loading Udhaar Customer Profile..." subtext="Syncing datewise passbook ledgers and vouchers" size="lg" />
      </div>
    );
  }

  if (!party) {
    return (
      <div className="max-w-7xl mx-auto p-6 text-center">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Party Not Found</h2>
        <Link href="/parties" className="text-emerald-600 dark:text-emerald-400 font-bold text-sm mt-2 inline-block">
          ← Back to Parties Directory
        </Link>
      </div>
    );
  }

  const totalPurchases = party.purchases?.reduce((acc, p) => acc + (parseFloat(p.netAmount) || 0), 0) || 0;
  const totalSales = party.sales?.reduce((acc, p) => acc + (parseFloat(p.netAmount) || 0), 0) || 0;

  return (
    <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-200">
      {/* Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 print:hidden">
        <Breadcrumb items={[{ label: 'Parties & Udhaar Khata', href: '/parties' }, { label: party.name }]} />

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsPaymentModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-sm transition"
          >
            <PlusCircle className="w-4 h-4 text-amber-300" /> Record Jama / Payment
          </button>

          <button
            onClick={handlePrintPassbook}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white rounded-xl text-xs font-medium shadow-sm transition"
          >
            <Printer className="w-4 h-4 text-amber-400" /> Print Passbook
          </button>

          <button
            onClick={handleShareWhatsApp}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-medium shadow-sm transition"
            title="Share Statement on WhatsApp"
          >
            <Share2 className="w-4 h-4" /> WhatsApp Share
          </button>
        </div>
      </div>

      {/* Hero Profile Banner Card */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-xl relative overflow-hidden space-y-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
          <div className="flex items-center gap-5">
            {/* Avatar Picture */}
            <div className="relative group cursor-pointer" onClick={() => setIsAvatarModalOpen(true)}>
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl overflow-hidden border-2 border-emerald-500/40 shadow-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center group-hover:opacity-90 transition">
                {party.avatarUrl ? (
                  <img src={party.avatarUrl} alt={party.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-white font-bold text-3xl">
                    {party.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="absolute inset-0 bg-slate-950/40 rounded-3xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <span className="absolute -bottom-1 -right-1 p-1.5 bg-emerald-600 text-white rounded-xl shadow-md">
                <Camera className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-outfit">
                  {party.name}
                </h1>
                <span className="text-xs font-mono font-semibold text-amber-700 dark:text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-lg uppercase">
                  {party.partyCode}
                </span>
                <div className="flex gap-1">
                  {party.roles?.map((r) => (
                    <span key={r} className="text-[10px] font-semibold text-white bg-emerald-700 dark:bg-emerald-600 px-2 py-0.5 rounded-md uppercase">
                      {r.replace('_', ' ')}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 hover:underline font-medium bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/20"
                >
                  <Edit className="w-3 h-3" /> Edit Profile
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 font-normal">
                {party.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> {party.phone}
                  </span>
                )}
                {party.address && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-500" /> {party.address} {party.city ? `, ${party.city}` : ''}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> Account Created: {new Date(party.createdAt).toLocaleDateString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Outstanding Balance Banner Card */}
          <div className="p-4 rounded-3xl bg-slate-900 dark:bg-slate-950 text-white border border-slate-800 shadow-lg w-full lg:w-72 space-y-1">
            <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 block font-outfit">
              Current Outstanding Balance
            </span>
            <div className={`text-2xl font-extrabold font-mono ${
              party.balanceType === 'RECEIVABLE' ? 'text-amber-400' : 'text-rose-400'
            }`}>
              {formatCurrency(party.openingBalance)}
            </div>
            <div className="flex items-center justify-between text-[11px] font-medium pt-1 border-t border-slate-800">
              <span className="text-slate-400">
                {party.balanceType === 'RECEIVABLE' ? 'DR - Lene hain (Udhaar)' : 'CR - Dene hain'}
              </span>
              <button
                onClick={() => setIsPaymentModalOpen(true)}
                className="text-amber-400 hover:underline text-[10px] font-semibold uppercase"
              >
                + Jama Entry
              </button>
            </div>
          </div>
        </div>

        {/* 4-Card Financial Metrics Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
          <div className="p-4 bg-slate-50/80 dark:bg-slate-950/60 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400">Total Period Debit (Udhaar)</span>
              <ArrowUpRight className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              {formatCurrency(ledgerMetrics.totalDebit)}
            </div>
            <span className="text-[10px] text-slate-400">Sales & Debit Vouchers</span>
          </div>

          <div className="p-4 bg-slate-50/80 dark:bg-slate-950/60 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400">Total Period Credit (Jama)</span>
              <ArrowDownRight className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-lg font-bold text-rose-600 dark:text-rose-400 font-mono">
              {formatCurrency(ledgerMetrics.totalCredit)}
            </div>
            <span className="text-[10px] text-slate-400">Payments & Jama Credits</span>
          </div>

          <div className="p-4 bg-slate-50/80 dark:bg-slate-950/60 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Commercial Sales Billed</span>
              <Building2 className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(totalSales)}</div>
            <span className="text-[10px] text-slate-400">{party.sales?.length || 0} Sales Invoices</span>
          </div>

          <div className="p-4 bg-slate-50/80 dark:bg-slate-950/60 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Bank Details</span>
              <Landmark className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
              {party.bankName || 'Bank Details N/A'}
            </div>
            <div className="flex items-center justify-between pt-0.5">
              <span className="text-[10px] text-slate-400 font-mono">A/C: {party.accountNo || 'N/A'}</span>
              <button onClick={handleCopyBankDetails} className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline font-medium flex items-center gap-1">
                <Copy className="w-2.5 h-2.5" /> Copy
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation Bar */}
      <div className="border-b border-slate-200/60 dark:border-slate-800/60 flex gap-2 overflow-x-auto pb-0.5 print:hidden">
        {[
          { id: 'ledger', label: 'Passbook & Datewise Ledger', icon: Receipt },
          { id: 'overview', label: 'Profile & KYC Vault', icon: User },
          { id: 'history', label: 'Sales & Purchases Vouchers', icon: Wheat },
          { id: 'payments', label: 'Payment Logs', icon: CreditCard },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 font-semibold text-xs rounded-t-2xl transition border-b-2 whitespace-nowrap ${
                isActive
                  ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900 shadow-sm'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-500' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: PASSBOOK & DATEWISE LEDGER (MAIN FINANCIAL VIEW) */}
      {activeTab === 'ledger' && (
        <div className="glass-card rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-xl overflow-hidden space-y-4 p-5">
          
          {/* Filters Bar (Date range & Type) */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-200/60 dark:border-slate-800/60 pb-4 print:hidden">
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-medium text-slate-500">From:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="app-input text-xs py-1 px-2 max-w-[130px]"
                />
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-medium text-slate-500">To:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="app-input text-xs py-1 px-2 max-w-[130px]"
                />
              </div>

              {(startDate || endDate) && (
                <button
                  onClick={() => { setStartDate(''); setEndDate(''); }}
                  className="text-xs text-rose-500 hover:underline font-medium"
                >
                  Clear Dates
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
              {/* Type Filter */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-900/80 p-1 rounded-xl border border-slate-200/60 dark:border-slate-800/60 text-xs font-medium">
                <button
                  onClick={() => setLedgerTypeFilter('ALL')}
                  className={`px-3 py-1 rounded-lg transition ${
                    ledgerTypeFilter === 'ALL'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm font-semibold'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  All Vouchers
                </button>
                <button
                  onClick={() => setLedgerTypeFilter('DEBIT_ONLY')}
                  className={`px-3 py-1 rounded-lg transition ${
                    ledgerTypeFilter === 'DEBIT_ONLY'
                      ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                      : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10'
                  }`}
                >
                  Debit (Udhaar)
                </button>
                <button
                  onClick={() => setLedgerTypeFilter('CREDIT_ONLY')}
                  className={`px-3 py-1 rounded-lg transition ${
                    ledgerTypeFilter === 'CREDIT_ONLY'
                      ? 'bg-rose-500 text-white font-semibold shadow-sm'
                      : 'text-rose-600 dark:text-rose-400 hover:bg-rose-500/10'
                  }`}
                >
                  Credit (Jama)
                </button>
              </div>

              {/* Search text */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Filter by voucher # or narration..."
                  value={ledgerSearchText}
                  onChange={(e) => setLedgerSearchText(e.target.value)}
                  className="app-input text-xs py-1.5 pl-8 pr-3 w-48"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>
          </div>

          {/* Passbook Header Summary */}
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-sm font-outfit flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-500" /> Datewise Passbook Statements ({filteredLedgerEntries.length} Records)
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              Filtered Period Debit: ₹{ledgerMetrics.totalDebit.toLocaleString('en-IN')} | Credit: ₹{ledgerMetrics.totalCredit.toLocaleString('en-IN')}
            </span>
          </div>

          {filteredLedgerEntries.length === 0 ? (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-xs font-medium space-y-2">
              <Receipt className="w-8 h-8 text-slate-400 mx-auto opacity-50" />
              <p>No passbook ledger entries matching selected filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200/60 dark:border-slate-800/60">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 font-semibold uppercase border-b border-slate-200/60 dark:border-slate-800/60">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Voucher No</th>
                    <th className="p-3">Voucher Type</th>
                    <th className="p-3">Narration / Particulars</th>
                    <th className="p-3 text-right text-emerald-600 dark:text-emerald-400">Debit (DR / Udhaar)</th>
                    <th className="p-3 text-right text-rose-600 dark:text-rose-400">Credit (CR / Jama)</th>
                    <th className="p-3 text-right">Running Balance</th>
                    <th className="p-3 text-center print:hidden">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60 font-medium">
                  {filteredLedgerEntries.map((entry) => (
                    <tr 
                      key={entry.id} 
                      onClick={() => {
                        setSelectedVoucher(entry);
                        setIsVoucherModalOpen(true);
                      }}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition cursor-pointer group"
                    >
                      <td className="p-3 text-slate-600 dark:text-slate-400 font-mono">
                        {new Date(entry.date).toLocaleDateString('en-IN')}
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                        {entry.voucherNo}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase border border-slate-200 dark:border-slate-700">
                          {entry.voucherType}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-400 max-w-xs truncate">{entry.narration || '-'}</td>
                      <td className="p-3 text-right font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
                        {parseFloat(entry.debit) > 0 ? formatCurrency(entry.debit) : '-'}
                      </td>
                      <td className="p-3 text-right font-semibold text-rose-600 dark:text-rose-400 font-mono">
                        {parseFloat(entry.credit) > 0 ? formatCurrency(entry.credit) : '-'}
                      </td>
                      <td className="p-3 text-right font-bold text-slate-900 dark:text-white font-mono">
                        {formatCurrency(entry.runningBalance)} ({entry.balanceType === 'RECEIVABLE' ? 'DR' : 'CR'})
                      </td>
                      <td className="p-3 text-center print:hidden">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedVoucher(entry);
                            setIsVoucherModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/20 text-[11px] font-bold transition flex items-center justify-center gap-1 mx-auto"
                        >
                          <Eye className="w-3 h-3" /> View Slip
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: OVERVIEW & DOCUMENTS VAULT */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card p-5 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-lg space-y-4">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm border-b border-slate-200/60 dark:border-slate-800/60 pb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Basic Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block font-normal">Party Code</span>
                <span className="font-semibold text-slate-900 dark:text-white font-mono">{party.partyCode}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block font-normal">Full Name</span>
                <span className="font-semibold text-slate-900 dark:text-white">{party.name}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block font-normal">Primary Phone</span>
                <span className="font-semibold text-slate-900 dark:text-white">{party.phone || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block font-normal">Alternate Phone</span>
                <span className="font-semibold text-slate-900 dark:text-white">{party.alternatePhone || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block font-normal">Address</span>
                <span className="font-semibold text-slate-900 dark:text-white">{party.address || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block font-normal">City / State</span>
                <span className="font-semibold text-slate-900 dark:text-white">{party.city || 'N/A'}, {party.state || 'MP'}</span>
              </div>
            </div>
          </div>

          <div className="glass-card p-5 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-lg space-y-4">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm border-b border-slate-200/60 dark:border-slate-800/60 pb-2 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-amber-500" /> Financial & Notes
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block font-normal">Opening Balance</span>
                <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(party.openingBalance)}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block font-normal">Balance Type</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{party.balanceType}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block font-normal">Registered Date</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {new Date(party.createdAt).toLocaleDateString('en-IN')}
                </span>
              </div>
            </div>
            {party.notes && (
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                <span className="text-slate-500 dark:text-slate-400 text-xs block font-normal">Notes & Remarks</span>
                <p className="text-xs text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-950/80 p-3 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 font-mono mt-1">
                  {party.notes}
                </p>
              </div>
            )}
          </div>

          {/* KYC & Bank Documents Vault */}
          <div className="glass-card p-5 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-lg space-y-4 md:col-span-2">
            <div className="border-b border-slate-200/60 dark:border-slate-800/60 pb-2 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-500" /> KYC & Bank Document Vault
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyBankDetails}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] rounded-xl shadow-sm transition flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" /> Copy Bank Details
                </button>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-[11px] rounded-xl shadow-sm transition flex items-center gap-1"
                >
                  <Upload className="w-3 h-3" /> Upload / Edit Docs
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              {/* Aadhaar Card */}
              <div className="bg-slate-50/80 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 flex flex-col justify-between space-y-2">
                <div>
                  <span className="text-[10px] font-medium uppercase text-slate-500 dark:text-slate-400 block">Aadhaar Card No</span>
                  <span className="font-semibold text-slate-900 dark:text-white text-sm font-mono">{party.aadhaarNo || 'N/A'}</span>
                </div>
                {party.aadhaarDocUrl ? (
                  <button
                    onClick={() => openDocPreview(party.aadhaarDocUrl, `${party.name} — Aadhaar Card`)}
                    className="inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-semibold hover:underline pt-2 border-t border-slate-200/60 dark:border-slate-800/60"
                  >
                    <Eye className="w-3.5 h-3.5" /> View Aadhaar Scan (In-App) ↗
                  </button>
                ) : (
                  <button onClick={() => setIsEditModalOpen(true)} className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium underline pt-2 border-t border-slate-200/60 dark:border-slate-800/60 text-left">
                    + Upload Aadhaar Doc
                  </button>
                )}
              </div>

              {/* PAN Card */}
              <div className="bg-slate-50/80 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 flex flex-col justify-between space-y-2">
                <div>
                  <span className="text-[10px] font-medium uppercase text-slate-500 dark:text-slate-400 block">PAN Card No</span>
                  <span className="font-semibold text-slate-900 dark:text-white text-sm font-mono uppercase">{party.panNo || 'N/A'}</span>
                </div>
                {party.panDocUrl ? (
                  <button
                    onClick={() => openDocPreview(party.panDocUrl, `${party.name} — PAN Card`)}
                    className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold hover:underline pt-2 border-t border-slate-200/60 dark:border-slate-800/60"
                  >
                    <Eye className="w-3.5 h-3.5" /> View PAN Card (In-App) ↗
                  </button>
                ) : (
                  <button onClick={() => setIsEditModalOpen(true)} className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium underline pt-2 border-t border-slate-200/60 dark:border-slate-800/60 text-left">
                    + Upload PAN Doc
                  </button>
                )}
              </div>

              {/* Bank Passbook */}
              <div className="bg-slate-50/80 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 flex flex-col justify-between space-y-2">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-medium uppercase text-slate-500 dark:text-slate-400 block">Bank A/C & IFSC</span>
                    <button onClick={handleCopyBankDetails} className="text-[10px] text-amber-500 hover:underline flex items-center gap-0.5">
                      <Copy className="w-2.5 h-2.5" /> Copy
                    </button>
                  </div>
                  <div className="font-semibold text-slate-900 dark:text-white text-xs mt-0.5">
                    {party.bankName ? `${party.bankName}` : 'Bank N/A'}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    A/C: {party.accountNo || 'N/A'}
                  </div>
                </div>
                {party.bankDocUrl ? (
                  <button
                    onClick={() => openDocPreview(party.bankDocUrl, `${party.name} — Bank Passbook`)}
                    className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold hover:underline pt-2 border-t border-slate-200/60 dark:border-slate-800/60"
                  >
                    <Eye className="w-3.5 h-3.5" /> View Passbook (In-App) ↗
                  </button>
                ) : (
                  <button onClick={() => setIsEditModalOpen(true)} className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium underline pt-2 border-t border-slate-200/60 dark:border-slate-800/60 text-left">
                    + Upload Passbook
                  </button>
                )}
              </div>

              {/* Khatauni Document */}
              <div className="bg-slate-50/80 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 flex flex-col justify-between space-y-2">
                <div>
                  <span className="text-[10px] font-medium uppercase text-slate-500 dark:text-slate-400 block">Khatauni / Land Record</span>
                  <span className="font-semibold text-slate-900 dark:text-white text-xs">Land Record Doc</span>
                </div>
                {party.khatauniDocUrl ? (
                  <button
                    onClick={() => openDocPreview(party.khatauniDocUrl, `${party.name} — Khatauni Document`)}
                    className="inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-semibold hover:underline pt-2 border-t border-slate-200/60 dark:border-slate-800/60"
                  >
                    <Eye className="w-3.5 h-3.5" /> View Khatauni (In-App) ↗
                  </button>
                ) : (
                  <button onClick={() => setIsEditModalOpen(true)} className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium underline pt-2 border-t border-slate-200/60 dark:border-slate-800/60 text-left">
                    + Upload Khatauni
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PURCHASES & SALES HISTORY */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          {/* Sales */}
          <div className="glass-card rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-xl overflow-hidden">
            <div className="p-4 border-b border-slate-200/60 dark:border-slate-800/60 bg-blue-500/10 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Commercial Sales Invoices
              </h3>
              <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">{party.sales?.length || 0} Sales</span>
            </div>
            {party.sales?.length === 0 ? (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs font-normal">No sales history recorded.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 font-semibold uppercase border-b border-slate-200/60 dark:border-slate-800/60">
                    <tr>
                      <th className="p-3">Sale No</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Commodity</th>
                      <th className="p-3">Net Quantity</th>
                      <th className="p-3 text-right">Net Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60 font-medium">
                    {party.sales?.map((sal) => (
                      <tr key={sal.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <td className="p-3 font-semibold text-slate-900 dark:text-white font-mono">{sal.saleNo}</td>
                        <td className="p-3 text-slate-600 dark:text-slate-400">{new Date(sal.date).toLocaleDateString('en-IN')}</td>
                        <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                          {sal.items?.map((i) => i.commodity?.name).join(', ')}
                        </td>
                        <td className="p-3 text-slate-800 dark:text-slate-200">
                          {sal.items?.map((i) => formatWeight(i.displayQuantity, i.unit?.code)).join(', ')}
                        </td>
                        <td className="p-3 text-right font-bold text-slate-900 dark:text-white font-mono">{formatCurrency(sal.netAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Purchases */}
          <div className="glass-card rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-xl overflow-hidden">
            <div className="p-4 border-b border-slate-200/60 dark:border-slate-800/60 bg-emerald-500/10 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <Wheat className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Procurement / Purchase History
              </h3>
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">{party.purchases?.length || 0} Purchases</span>
            </div>
            {party.purchases?.length === 0 ? (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs font-normal">No purchase history recorded.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 font-semibold uppercase border-b border-slate-200/60 dark:border-slate-800/60">
                    <tr>
                      <th className="p-3">Purchase No</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Commodity</th>
                      <th className="p-3">Net Quantity</th>
                      <th className="p-3 text-right">Net Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60 font-medium">
                    {party.purchases?.map((pur) => (
                      <tr key={pur.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <td className="p-3 font-semibold text-slate-900 dark:text-white font-mono">{pur.purchaseNo}</td>
                        <td className="p-3 text-slate-600 dark:text-slate-400">{new Date(pur.date).toLocaleDateString('en-IN')}</td>
                        <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                          {pur.items?.map((i) => i.commodity?.name).join(', ')}
                        </td>
                        <td className="p-3 text-slate-800 dark:text-slate-200">
                          {pur.items?.map((i) => formatWeight(i.displayQuantity, i.unit?.code)).join(', ')}
                        </td>
                        <td className="p-3 text-right font-bold text-slate-900 dark:text-white font-mono">{formatCurrency(pur.netAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: PAYMENTS & RECEIPTS */}
      {activeTab === 'payments' && (
        <div className="glass-card rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-xl overflow-hidden space-y-4 p-5">
          <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-3">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-sm font-outfit">Payment Vouchers Log</h3>
            <button
              onClick={() => setIsPaymentModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition flex items-center gap-1"
            >
              + Record New Payment / Jama
            </button>
          </div>
          {party.payments?.length === 0 ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs font-normal">No payment vouchers logged yet.</div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200/60 dark:border-slate-800/60">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 font-semibold uppercase border-b border-slate-200/60 dark:border-slate-800/60">
                  <tr>
                    <th className="p-3">Payment No</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Mode</th>
                    <th className="p-3">Account</th>
                    <th className="p-3">Ref No</th>
                    <th className="p-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60 font-medium">
                  {party.payments?.map((pmt) => (
                    <tr key={pmt.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">{pmt.paymentNo}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">{new Date(pmt.date).toLocaleDateString('en-IN')}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          pmt.paymentType === 'PAYMENT_RECEIVED'
                            ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-600 border border-rose-500/30'
                        }`}>
                          {pmt.paymentType === 'PAYMENT_RECEIVED' ? 'JAMA (RECEIVED)' : 'NAAM (PAID)'}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-slate-700 dark:text-slate-300 uppercase">{pmt.paymentMode}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">{pmt.accountName}</td>
                      <td className="p-3 font-mono text-slate-500">{pmt.referenceNo || '-'}</td>
                      <td className="p-3 text-right font-black text-slate-900 dark:text-white font-mono">{formatCurrency(pmt.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Record Jama / Payment Modal */}
      <PartyPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        party={party}
        onSuccess={() => fetchProfile()}
      />

      {/* Individual Voucher Receipt Modal */}
      <PartyVoucherReceiptModal
        isOpen={isVoucherModalOpen}
        onClose={() => setIsVoucherModalOpen(false)}
        voucher={selectedVoucher}
        party={party}
      />

      {/* Profile Photo Avatar Modal */}
      <ProfileAvatarModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        currentAvatar={party.avatarUrl}
        entityName={party.name}
        apiEndpoint={`/api/parties/${party.id}/avatar`}
        onSuccess={() => fetchProfile()}
      />

      {/* Edit Profile Modal */}
      <PartyFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialData={party}
        onSuccess={() => fetchProfile()}
      />

      {/* In-App Document Lightbox Viewer */}
      <DocumentPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        docUrl={previewDocUrl}
        title={previewDocTitle}
      />
    </main>
  );
}
