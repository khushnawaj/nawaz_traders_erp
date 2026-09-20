'use client';

import { useState, useEffect } from 'react';
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
  Sparkles
} from 'lucide-react';
import ProfileAvatarModal from '@/components/common/ProfileAvatarModal';
import PartyFormModal from '@/components/parties/PartyFormModal';
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
  const [activeTab, setActiveTab] = useState('overview');
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Lightbox document preview state
  const [previewDocUrl, setPreviewDocUrl] = useState(null);
  const [previewDocTitle, setPreviewDocTitle] = useState('');
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

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
    const balanceStr = `${formatCurrency(party.openingBalance)} (${party.balanceType === 'RECEIVABLE' ? 'DR - Lene hain' : 'CR - Dene hain'})`;
    const message = `*NAWAZ TRADERS - PARTY STATEMENT*\n*Party Name:* ${party.name}\n*Party Code:* ${party.partyCode}\n*Roles:* ${party.roles.join(', ')}\n*Mobile:* ${party.phone || 'N/A'}\n*Current Balance:* ${balanceStr}\n\nThank you for doing business with Nawaz Traders!`;
    const cleanPhone = party.phone ? party.phone.replace(/[^0-9]/g, '') : '';
    const phoneParam = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const url = `https://wa.me/${phoneParam}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <Loader text="Loading Party Profile..." subtext="Syncing rice mill sales and vendor accounts" size="lg" />
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <Breadcrumb items={[{ label: 'Parties & Rice Mills', href: '/parties' }, { label: party.name }]} />

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleShareWhatsApp}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-medium shadow-sm transition"
            title="Share Statement on WhatsApp"
          >
            <Share2 className="w-3.5 h-3.5" /> WhatsApp Share
          </button>

          <span className="text-xs font-mono font-semibold text-amber-700 dark:text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg uppercase">
            {party.partyCode}
          </span>
          <div className="flex gap-1">
            {party.roles.map((r) => (
              <span key={r} className="text-[10px] font-semibold text-white bg-emerald-700 dark:bg-emerald-600 px-2 py-0.5 rounded-md uppercase">
                {r.replace('_', ' ')}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Hero Profile Card */}
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
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">
                  {party.name}
                </h1>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 hover:underline font-medium bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20"
                >
                  <Edit className="w-3 h-3" /> Edit Profile & Docs
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-normal">
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
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> Registered: {new Date(party.createdAt).toLocaleDateString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <button
              onClick={handleCopyBankDetails}
              className="flex-1 lg:flex-none bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white px-4 py-2.5 rounded-2xl text-xs font-semibold shadow-md transition flex items-center justify-center gap-2"
            >
              <Copy className="w-4 h-4 text-emerald-400" /> Copy Bank Details
            </button>
          </div>
        </div>

        {/* 4-Card Financial Metrics Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
          <div className="p-4 bg-slate-50/80 dark:bg-slate-950/60 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium uppercase text-slate-500 dark:text-slate-400">Total Procurement / Purchases</span>
              <Wheat className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-lg font-semibold text-slate-900 dark:text-white">{formatCurrency(totalPurchases)}</div>
            <span className="text-[10px] text-slate-400">{party.purchases?.length || 0} Purchase Vouchers</span>
          </div>

          <div className="p-4 bg-slate-50/80 dark:bg-slate-950/60 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium uppercase text-slate-500 dark:text-slate-400">Total Sales Billed</span>
              <Building2 className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(totalSales)}</div>
            <span className="text-[10px] text-slate-400">{party.sales?.length || 0} Sales Invoices</span>
          </div>

          <div className="p-4 bg-slate-50/80 dark:bg-slate-950/60 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium uppercase text-slate-500 dark:text-slate-400">Opening Balance</span>
              <Receipt className="w-4 h-4 text-rose-500" />
            </div>
            <div className={`text-lg font-semibold ${
              party.balanceType === 'RECEIVABLE' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}>
              {formatCurrency(party.openingBalance)}
            </div>
            <span className="text-[10px] text-slate-400 font-normal">
              {party.balanceType === 'RECEIVABLE' ? 'DR - Lene Hain' : 'CR - Dene Hain'}
            </span>
          </div>

          <div className="p-4 bg-slate-50/80 dark:bg-slate-950/60 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium uppercase text-slate-500 dark:text-slate-400">Bank Account & IFSC</span>
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

      {/* Tab Navigation */}
      <div className="border-b border-slate-200/60 dark:border-slate-800/60 flex gap-2 overflow-x-auto pb-0.5">
        {[
          { id: 'overview', label: 'Overview & Documents', icon: User },
          { id: 'ledger', label: 'Accounts & Ledger', icon: Receipt },
          { id: 'history', label: 'Purchase & Sales History', icon: Wheat },
          { id: 'payments', label: 'Payments & Receipts', icon: CreditCard },
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

      {/* TAB 1: OVERVIEW & DOCUMENTS VAULT */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card p-5 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-lg space-y-4">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm border-b border-slate-200/60 dark:border-slate-800/60 pb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Basic Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block font-normal">Party Code</span>
                <span className="font-semibold text-slate-900 dark:text-white">{party.partyCode}</span>
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

      {/* TAB 2: ACCOUNTS & LEDGER */}
      {activeTab === 'ledger' && (
        <div className="glass-card rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-xl overflow-hidden">
          <div className="p-4 border-b border-slate-200/60 dark:border-slate-800/60 bg-slate-100/80 dark:bg-slate-900/60 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Account Ledger</h3>
          </div>
          {party.ledgerEntries?.length === 0 ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs font-normal">
              No ledger transactions recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 font-semibold uppercase border-b border-slate-200/60 dark:border-slate-800/60">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Voucher No</th>
                    <th className="p-3">Voucher Type</th>
                    <th className="p-3">Narration</th>
                    <th className="p-3 text-right text-emerald-600 dark:text-emerald-400">Debit (DR)</th>
                    <th className="p-3 text-right text-rose-600 dark:text-rose-400">Credit (CR)</th>
                    <th className="p-3 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60 font-medium">
                  {party.ledgerEntries?.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="p-3 text-slate-600 dark:text-slate-400">
                        {new Date(entry.date).toLocaleDateString('en-IN')}
                      </td>
                      <td className="p-3 font-semibold text-slate-900 dark:text-white">{entry.voucherNo}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase">
                          {entry.voucherType}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">{entry.narration || '-'}</td>
                      <td className="p-3 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                        {parseFloat(entry.debit) > 0 ? formatCurrency(entry.debit) : '-'}
                      </td>
                      <td className="p-3 text-right font-semibold text-rose-600 dark:text-rose-400">
                        {parseFloat(entry.credit) > 0 ? formatCurrency(entry.credit) : '-'}
                      </td>
                      <td className="p-3 text-right font-semibold text-slate-900 dark:text-white">
                        {formatCurrency(entry.runningBalance)} ({entry.balanceType === 'RECEIVABLE' ? 'DR' : 'CR'})
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PURCHASES & SALES HISTORY */}
      {activeTab === 'history' && (
        <div className="space-y-6">
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
                        <td className="p-3 font-semibold text-slate-900 dark:text-white">{pur.purchaseNo}</td>
                        <td className="p-3 text-slate-600 dark:text-slate-400">{new Date(pur.date).toLocaleDateString('en-IN')}</td>
                        <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                          {pur.items?.map((i) => i.commodity?.name).join(', ')}
                        </td>
                        <td className="p-3 text-slate-800 dark:text-slate-200">
                          {pur.items?.map((i) => formatWeight(i.displayQuantity, i.unit?.code)).join(', ')}
                        </td>
                        <td className="p-3 text-right font-semibold text-slate-900 dark:text-white">{formatCurrency(pur.netAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Sales */}
          <div className="glass-card rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-xl overflow-hidden">
            <div className="p-4 border-b border-slate-200/60 dark:border-slate-800/60 bg-blue-500/10 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Sales History
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
                        <td className="p-3 font-semibold text-slate-900 dark:text-white">{sal.saleNo}</td>
                        <td className="p-3 text-slate-600 dark:text-slate-400">{new Date(sal.date).toLocaleDateString('en-IN')}</td>
                        <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                          {sal.items?.map((i) => i.commodity?.name).join(', ')}
                        </td>
                        <td className="p-3 text-slate-800 dark:text-slate-200">
                          {sal.items?.map((i) => formatWeight(i.displayQuantity, i.unit?.code)).join(', ')}
                        </td>
                        <td className="p-3 text-right font-semibold text-slate-900 dark:text-white">{formatCurrency(sal.netAmount)}</td>
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
        <div className="glass-card rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-xl overflow-hidden">
          <div className="p-4 border-b border-slate-200/60 dark:border-slate-800/60 bg-slate-100/80 dark:bg-slate-900/60 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Payment Vouchers & Receipts</h3>
          </div>
          {party.payments?.length === 0 ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs font-normal">No payments logged yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 font-semibold uppercase border-b border-slate-200/60 dark:border-slate-800/60">
                  <tr>
                    <th className="p-3">Payment No</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Mode</th>
                    <th className="p-3">Account</th>
                    <th className="p-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60 font-medium">
                  {party.payments?.map((pmt) => (
                    <tr key={pmt.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="p-3 font-semibold text-slate-900 dark:text-white">{pmt.paymentNo}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">{new Date(pmt.date).toLocaleDateString('en-IN')}</td>
                      <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">{pmt.paymentType}</td>
                      <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">{pmt.paymentMode}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">{pmt.accountName}</td>
                      <td className="p-3 text-right font-semibold text-slate-900 dark:text-white">{formatCurrency(pmt.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

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


