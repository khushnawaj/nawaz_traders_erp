'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  Wheat, 
  Phone, 
  MapPin, 
  ArrowLeft, 
  Receipt, 
  CreditCard, 
  PlusCircle, 
  Landmark, 
  User,
  Camera,
  Copy,
  Edit,
  Upload,
  Share2,
  Eye,
  CheckCircle2,
  ShieldCheck,
  Building2,
  FileText,
  Calendar,
  Sparkles
} from 'lucide-react';
import FarmerPaymentModal from '@/components/farmers/FarmerPaymentModal';
import FarmerPurchaseModal from '@/components/farmers/FarmerPurchaseModal';
import FarmerFormModal from '@/components/farmers/FarmerFormModal';
import ProfileAvatarModal from '@/components/common/ProfileAvatarModal';
import DocumentPreviewModal from '@/components/common/DocumentPreviewModal';
import Loader from '@/components/common/Loader';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { formatCurrency, formatWeight } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function FarmerProfilePage() {
  const params = useParams();
  const id = params?.id;

  const [farmer, setFarmer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Document Lightbox Preview State
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
        setFarmer(json.data);
      }
    } catch (err) {
      console.error('Error fetching farmer profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const handleCopyBankDetails = () => {
    if (!farmer?.accountNo && !farmer?.bankName) {
      toast.error('No bank details available to copy');
      return;
    }
    const text = `Account Holder: ${farmer.name}\nBank Name: ${farmer.bankName || 'N/A'}\nAccount No: ${farmer.accountNo || 'N/A'}\nIFSC Code: ${farmer.ifscCode || 'N/A'}`;
    navigator.clipboard.writeText(text);
    toast.success('Bank details copied to clipboard!');
  };

  const handleShareWhatsApp = () => {
    const balanceStr = `${formatCurrency(farmer.openingBalance)} (${farmer.balanceType === 'RECEIVABLE' ? 'DR - Kisan se lene hain' : 'CR - Kisan ko dene hain'})`;
    const message = `*NAWAZ TRADERS - FARMER STATEMENT*\n*Farmer Name:* ${farmer.name}\n*Farmer Code:* ${farmer.partyCode}\n*Mobile:* ${farmer.phone || 'N/A'}\n*Village:* ${farmer.address || 'N/A'}\n*Pending Balance:* ${balanceStr}\n\nThank you for doing business with Nawaz Traders!`;
    const cleanPhone = farmer.phone ? farmer.phone.replace(/[^0-9]/g, '') : '';
    const phoneParam = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const url = `https://wa.me/${phoneParam}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <Loader text="Loading Farmer Profile..." subtext="Syncing crop purchases and payment ledger" size="lg" />
      </div>
    );
  }

  if (!farmer) {
    return (
      <div className="max-w-7xl mx-auto p-6 text-center">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Farmer Not Found</h2>
        <Link href="/farmers" className="text-emerald-600 dark:text-emerald-400 font-bold text-sm mt-2 inline-block">
          ← Back to Farmer Directory
        </Link>
      </div>
    );
  }

  // Calculate totals
  const totalProcurementValue = farmer.purchases?.reduce((acc, p) => acc + (parseFloat(p.netAmount) || 0), 0) || 0;
  const totalPaymentsGiven = farmer.payments?.reduce((acc, p) => acc + (parseFloat(p.amount) || 0), 0) || 0;

  return (
    <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-200">
      {/* Breadcrumb Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <Breadcrumb items={[{ label: 'Farmer Directory', href: '/farmers' }, { label: farmer.name }]} />

        <div className="flex items-center gap-2">
          <button
            onClick={handleShareWhatsApp}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-medium shadow-sm transition"
            title="Share Statement on WhatsApp"
          >
            <Share2 className="w-3.5 h-3.5" /> WhatsApp Share
          </button>

          <span className="text-xs font-mono font-semibold text-amber-700 dark:text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg uppercase">
            {farmer.partyCode}
          </span>
        </div>
      </div>

      {/* Hero Profile Card */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-2xl relative overflow-hidden space-y-6">
        {/* Glowing Background Lights */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
          <div className="flex items-center gap-5">
            {/* Avatar Picture with Camera Click Trigger */}
            <div className="relative group cursor-pointer" onClick={() => setIsAvatarModalOpen(true)}>
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl overflow-hidden border-2 border-amber-500/40 shadow-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center group-hover:opacity-90 transition">
                {farmer.avatarUrl ? (
                  <img src={farmer.avatarUrl} alt={farmer.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-amber-500 via-amber-400 to-emerald-500 flex items-center justify-center text-slate-950 font-bold text-3xl">
                    {farmer.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="absolute inset-0 bg-slate-950/40 rounded-3xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <span className="absolute -bottom-1 -right-1 p-1.5 bg-amber-500 text-slate-950 rounded-xl shadow-md">
                <Camera className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">
                  {farmer.name}
                </h1>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" /> Verified Kisan
                </span>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 hover:underline font-medium bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/20"
                >
                  <Edit className="w-3 h-3" /> Edit Profile & Docs
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-normal">
                {farmer.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> {farmer.phone}
                  </span>
                )}
                {farmer.address && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-500" /> Village: {farmer.address} {farmer.city ? `, ${farmer.city}` : ''}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> Registered: {new Date(farmer.createdAt).toLocaleDateString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <button
              onClick={() => setIsPurchaseModalOpen(true)}
              className="flex-1 lg:flex-none bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 px-4 py-2.5 rounded-2xl text-xs font-semibold shadow-md transition flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
            >
              <Wheat className="w-4 h-4 text-slate-950" /> Buy Crop
            </button>

            <button
              onClick={() => setIsPaymentModalOpen(true)}
              className="flex-1 lg:flex-none bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-2xl text-xs font-semibold shadow-md transition flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
            >
              <PlusCircle className="w-4 h-4 text-amber-300" /> Give Payment / Advance
            </button>
          </div>
        </div>

        {/* 4-Card Financial Metrics Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
          <div className="p-4 bg-slate-50/80 dark:bg-slate-950/60 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium uppercase text-slate-500 dark:text-slate-400">Total Crop Purchased Value</span>
              <Wheat className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-lg font-semibold text-slate-900 dark:text-white">{formatCurrency(totalProcurementValue)}</div>
            <span className="text-[10px] text-slate-400">{farmer.purchases?.length || 0} Purchase Vouchers</span>
          </div>

          <div className="p-4 bg-slate-50/80 dark:bg-slate-950/60 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium uppercase text-slate-500 dark:text-slate-400">Total Payments Released</span>
              <CreditCard className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(totalPaymentsGiven)}</div>
            <span className="text-[10px] text-slate-400">{farmer.payments?.length || 0} Payment Receipts</span>
          </div>

          <div className="p-4 bg-slate-50/80 dark:bg-slate-950/60 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium uppercase text-slate-500 dark:text-slate-400">Net Outstanding Balance</span>
              <Receipt className="w-4 h-4 text-rose-500" />
            </div>
            <div className={`text-lg font-semibold ${
              farmer.balanceType === 'RECEIVABLE' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}>
              {formatCurrency(farmer.openingBalance)}
            </div>
            <span className="text-[10px] text-slate-400 font-normal">
              {farmer.balanceType === 'RECEIVABLE' ? 'DR - Receivable from Farmer' : 'CR - Payable to Farmer'}
            </span>
          </div>

          <div className="p-4 bg-slate-50/80 dark:bg-slate-950/60 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium uppercase text-slate-500 dark:text-slate-400">Bank Account & IFSC</span>
              <Landmark className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
              {farmer.bankName || 'Bank Details N/A'}
            </div>
            <div className="flex items-center justify-between pt-0.5">
              <span className="text-[10px] text-slate-400 font-mono">A/C: {farmer.accountNo || 'N/A'}</span>
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
          { id: 'purchases', label: 'Crop Procurement Logs', icon: Wheat },
          { id: 'ledger', label: 'Farmer Khaata Ledger', icon: Receipt },
          { id: 'payments', label: 'Payment Vouchers', icon: CreditCard },
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
              <Icon className={`w-4 h-4 ${isActive ? 'text-amber-500' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & DOCUMENT VAULT */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card p-5 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-lg space-y-4">
            <div className="border-b border-slate-200/60 dark:border-slate-800/60 pb-2 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Personal & Village Info
              </h3>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="text-xs text-emerald-600 dark:text-emerald-400 font-medium hover:underline flex items-center gap-1"
              >
                <Upload className="w-3 h-3" /> Upload / Edit Docs
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block font-normal">Farmer Code</span>
                <span className="font-semibold text-slate-900 dark:text-white">{farmer.partyCode}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block font-normal">Farmer Full Name</span>
                <span className="font-semibold text-slate-900 dark:text-white">{farmer.name}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block font-normal">Primary Mobile</span>
                <span className="font-semibold text-slate-900 dark:text-white">{farmer.phone || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block font-normal">Alt Mobile</span>
                <span className="font-semibold text-slate-900 dark:text-white">{farmer.alternatePhone || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block font-normal">Village</span>
                <span className="font-semibold text-slate-900 dark:text-white">{farmer.address || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block font-normal">Tehsil / District</span>
                <span className="font-semibold text-slate-900 dark:text-white">{farmer.city || 'N/A'}, {farmer.state || 'MP'}</span>
              </div>
            </div>
          </div>

          <div className="glass-card p-5 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-lg space-y-4">
            <div className="border-b border-slate-200/60 dark:border-slate-800/60 pb-2 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <Landmark className="w-4 h-4 text-amber-500" /> Bank Account & Copy Details
              </h3>
              <button
                onClick={handleCopyBankDetails}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-[11px] rounded-xl shadow-sm transition flex items-center gap-1"
              >
                <Copy className="w-3 h-3" /> Copy Bank Details
              </button>
            </div>

            <div className="p-3.5 bg-slate-50/80 dark:bg-slate-950/60 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 uppercase text-[10px]">Bank Account Info</span>
                <button onClick={handleCopyBankDetails} className="text-[10px] text-amber-500 hover:underline flex items-center gap-0.5">
                  <Copy className="w-2.5 h-2.5" /> 1-Click Copy
                </button>
              </div>
              <div className="font-semibold text-slate-900 dark:text-white">
                {farmer.bankName || 'Bank Name Not Specified'} {farmer.accountNo ? `• A/C: ${farmer.accountNo}` : ''}
              </div>
              {farmer.ifscCode && <div className="text-slate-500 text-[11px] font-mono">IFSC Code: {farmer.ifscCode}</div>}
              {farmer.bankDocUrl && (
                <div className="pt-1">
                  <button
                    onClick={() => openDocPreview(farmer.bankDocUrl, `${farmer.name} — Bank Passbook`)}
                    className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold hover:underline text-xs"
                  >
                    <Eye className="w-3.5 h-3.5" /> View Passbook Photo (In-App) ↗
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Document Vault Cards */}
          <div className="glass-card p-5 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-lg space-y-4 md:col-span-2">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm border-b border-slate-200/60 dark:border-slate-800/60 pb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-500" /> KYC Document Vault
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              {/* Aadhaar Card */}
              <div className="bg-slate-50/80 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 flex flex-col justify-between space-y-2">
                <div>
                  <span className="text-[10px] font-medium uppercase text-slate-500 dark:text-slate-400 block">Aadhaar Card No</span>
                  <span className="font-semibold text-slate-900 dark:text-white text-sm font-mono">{farmer.aadhaarNo || 'N/A'}</span>
                </div>
                {farmer.aadhaarDocUrl ? (
                  <button
                    onClick={() => openDocPreview(farmer.aadhaarDocUrl, `${farmer.name} — Aadhaar Card`)}
                    className="inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-semibold hover:underline pt-2 border-t border-slate-200/60 dark:border-slate-800/60"
                  >
                    <Eye className="w-3.5 h-3.5" /> View Aadhaar Scan (In-App) ↗
                  </button>
                ) : (
                  <button onClick={() => setIsEditModalOpen(true)} className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium underline pt-2 border-t border-slate-200/60 dark:border-slate-800/60 text-left">
                    + Upload Aadhaar Document
                  </button>
                )}
              </div>

              {/* Passbook Scan */}
              <div className="bg-slate-50/80 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 flex flex-col justify-between space-y-2">
                <div>
                  <span className="text-[10px] font-medium uppercase text-slate-500 dark:text-slate-400 block">Bank Passbook / Cheque</span>
                  <span className="font-semibold text-slate-900 dark:text-white text-xs">{farmer.accountNo ? `A/C: ${farmer.accountNo}` : 'Passbook Doc'}</span>
                </div>
                {farmer.bankDocUrl ? (
                  <button
                    onClick={() => openDocPreview(farmer.bankDocUrl, `${farmer.name} — Bank Passbook`)}
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

              {/* Khatauni Land Record */}
              <div className="bg-slate-50/80 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 flex flex-col justify-between space-y-2">
                <div>
                  <span className="text-[10px] font-medium uppercase text-slate-500 dark:text-slate-400 block">Khatauni Land Record</span>
                  <span className="font-semibold text-slate-900 dark:text-white text-xs">Land Ownership Document</span>
                </div>
                {farmer.khatauniDocUrl ? (
                  <button
                    onClick={() => openDocPreview(farmer.khatauniDocUrl, `${farmer.name} — Khatauni Land Record`)}
                    className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold hover:underline pt-2 border-t border-slate-200/60 dark:border-slate-800/60"
                  >
                    <Eye className="w-3.5 h-3.5" /> View Khatauni (In-App) ↗
                  </button>
                ) : (
                  <button onClick={() => setIsEditModalOpen(true)} className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium underline pt-2 border-t border-slate-200/60 dark:border-slate-800/60 text-left">
                    + Upload Khatauni Copy
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CROP PROCUREMENT & PURCHASES */}
      {activeTab === 'purchases' && (
        <div className="glass-card rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-xl overflow-hidden">
          <div className="p-4 border-b border-slate-200/60 dark:border-slate-800/60 bg-emerald-500/10 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <Wheat className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Crop Procurement Logs
            </h3>
            <button
              onClick={() => setIsPurchaseModalOpen(true)}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-xl text-xs transition shadow-sm"
            >
              + Record New Purchase
            </button>
          </div>
          {!farmer.purchases || farmer.purchases.length === 0 ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs font-normal">
              No grain purchases recorded for this farmer yet. Click &quot;+ Record New Purchase&quot; to buy crop.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 font-semibold uppercase border-b border-slate-200/60 dark:border-slate-800/60">
                  <tr>
                    <th className="p-3">Voucher No</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Crop / Grain</th>
                    <th className="p-3">Quantity & Rate</th>
                    <th className="p-3 text-right">Bill Total</th>
                    <th className="p-3 text-right">Advance Paid</th>
                    <th className="p-3 text-right">Due Balance</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60 font-medium">
                  {farmer.purchases.map((pur) => {
                    const item = pur.items?.[0];

                    return (
                      <tr key={pur.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <td className="p-3 font-mono font-semibold text-slate-900 dark:text-white">
                          <Link href={`/purchases/${pur.id}`} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">
                            {pur.purchaseNo} ↗
                          </Link>
                          {pur.parchiUrl && (
                            <button
                              onClick={() => openDocPreview(pur.parchiUrl, `Purchase Parchi — ${pur.purchaseNo}`)}
                              className="block text-[10px] text-amber-500 font-medium hover:underline mt-0.5"
                            >
                              View Parchi Scan
                            </button>
                          )}
                        </td>
                        <td className="p-3 text-slate-600 dark:text-slate-400">{new Date(pur.date).toLocaleDateString('en-IN')}</td>
                        <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">
                          {item?.commodity?.localName || item?.commodity?.name || 'Crop'}
                        </td>
                        <td className="p-3 font-semibold text-slate-900 dark:text-white">
                          {item ? `${item.displayQuantity} ${item.unit?.code || 'QTL'}` : '-'}
                          {item?.ratePerUnit && <span className="block text-[10px] text-slate-500 font-normal">@ ₹{item.ratePerUnit}/unit</span>}
                        </td>
                        <td className="p-3 text-right font-semibold text-slate-900 dark:text-white">
                          {formatCurrency(pur.netAmount)}
                        </td>
                        <td className="p-3 text-right text-emerald-600 dark:text-emerald-400 font-semibold">
                          {formatCurrency(pur.paidAmount)}
                        </td>
                        <td className="p-3 text-right font-semibold text-amber-500">
                          {formatCurrency(pur.dueAmount)}
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                              pur.paymentStatus === 'PAID'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                : pur.paymentStatus === 'PARTIAL'
                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                            }`}
                          >
                            {pur.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: FARMER KHAATA & LEDGER */}
      {activeTab === 'ledger' && (
        <div className="glass-card rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-xl overflow-hidden">
          <div className="p-4 border-b border-slate-200/60 dark:border-slate-800/60 bg-slate-100/80 dark:bg-slate-900/60 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Farmer Account Ledger</h3>
          </div>
          {!farmer.ledgerEntries || farmer.ledgerEntries.length === 0 ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs font-normal">No ledger entries logged yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 font-semibold uppercase border-b border-slate-200/60 dark:border-slate-800/60">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Voucher No</th>
                    <th className="p-3">Voucher Type</th>
                    <th className="p-3">Narration</th>
                    <th className="p-3 text-right text-emerald-600 dark:text-emerald-400">Paid / DR</th>
                    <th className="p-3 text-right text-rose-600 dark:text-rose-400">Crop Credit / CR</th>
                    <th className="p-3 text-right">Running Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60 font-medium">
                  {farmer.ledgerEntries.map((entry) => (
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

      {/* TAB 4: PAYMENT VOUCHERS */}
      {activeTab === 'payments' && (
        <div className="glass-card rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-xl overflow-hidden">
          <div className="p-4 border-b border-slate-200/60 dark:border-slate-800/60 bg-slate-100/80 dark:bg-slate-900/60 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Payment Vouchers & Advances</h3>
          </div>
          {!farmer.payments || farmer.payments.length === 0 ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs font-normal">No payment vouchers issued yet.</div>
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
                  {farmer.payments.map((pmt) => (
                    <tr key={pmt.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="p-3 font-semibold text-slate-900 dark:text-white">{pmt.paymentNo}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">{new Date(pmt.date).toLocaleDateString('en-IN')}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          {pmt.paymentType}
                        </span>
                      </td>
                      <td className="p-3 text-slate-700 dark:text-slate-300">{pmt.paymentMode}</td>
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

      {/* Modals */}
      <FarmerPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        farmerId={farmer.id}
        farmerName={farmer.name}
        onSuccess={() => fetchProfile()}
      />

      <FarmerPurchaseModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        defaultFarmer={farmer}
        onSuccess={() => fetchProfile()}
      />

      <ProfileAvatarModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        currentAvatar={farmer.avatarUrl}
        entityName={farmer.name}
        apiEndpoint={`/api/parties/${farmer.id}/avatar`}
        onSuccess={() => fetchProfile()}
      />

      <FarmerFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialData={farmer}
        onSuccess={() => fetchProfile()}
      />

      <DocumentPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        docUrl={previewDocUrl}
        title={previewDocTitle}
      />
    </main>
  );
}
