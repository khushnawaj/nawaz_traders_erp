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
  Camera
} from 'lucide-react';
import FarmerPaymentModal from '@/components/farmers/FarmerPaymentModal';
import FarmerPurchaseModal from '@/components/farmers/FarmerPurchaseModal';
import ProfileAvatarModal from '@/components/common/ProfileAvatarModal';
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-slate-500 dark:text-slate-400 font-semibold text-sm">Loading farmer profile...</div>
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

  return (
    <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Breadcrumb & Back Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/farmers"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 glass-card px-3.5 py-2 rounded-xl shadow-sm transition"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Back to Farmer Directory
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-amber-800 dark:text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-md uppercase">
            {farmer.partyCode}
          </span>
          <span className="text-xs font-extrabold text-white bg-emerald-700 dark:bg-emerald-600 px-2.5 py-0.5 rounded-md uppercase shadow-sm">
            FARMER (किसान)
          </span>
        </div>
      </div>

      {/* Farmer Profile Card Header */}
      <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          {/* Avatar Picture with Camera Click Trigger */}
          <div className="relative group cursor-pointer" onClick={() => setIsAvatarModalOpen(true)}>
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl overflow-hidden border-2 border-emerald-500/40 shadow-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center group-hover:opacity-90 transition">
              {farmer.avatarUrl ? (
                <img src={farmer.avatarUrl} alt={farmer.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center text-slate-950 font-black text-2xl">
                  {farmer.name.charAt(0).toUpperCase()}
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

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {farmer.name}
              </h1>
              <button
                onClick={() => setIsAvatarModalOpen(true)}
                className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-bold"
              >
                (Edit Photo)
              </button>
            </div>
            {farmer.address && (
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> Village: {farmer.address} {farmer.city ? `, ${farmer.city}` : ''}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-2xl text-left">
            <div className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Mobile Number</div>
            <div className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1 mt-0.5">
              <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> {farmer.phone || 'N/A'}
            </div>
          </div>

          <div className="bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-2xl text-left">
            <div className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Pending Balance</div>
            <div className={`text-xs font-extrabold mt-0.5 ${
              farmer.balanceType === 'RECEIVABLE' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}>
              {formatCurrency(farmer.openingBalance)} ({farmer.balanceType === 'RECEIVABLE' ? 'DR' : 'CR'})
            </div>
          </div>

          <button
            onClick={() => setIsPurchaseModalOpen(true)}
            className="bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 px-4 py-2.5 rounded-2xl text-xs font-extrabold shadow-lg shadow-amber-500/20 transition flex items-center gap-2 transform hover:-translate-y-0.5"
          >
            <Wheat className="w-4 h-4 text-slate-950" /> Buy Crop (फसल खरीदी पर्ची)
          </button>

          <button
            onClick={() => setIsPaymentModalOpen(true)}
            className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white px-4 py-2.5 rounded-2xl text-xs font-extrabold shadow-lg shadow-emerald-950/20 transition flex items-center gap-2 transform hover:-translate-y-0.5"
          >
            <PlusCircle className="w-4 h-4 text-amber-300" /> Give Payment / Advance
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex gap-2 overflow-x-auto pb-0.5">
        {[
          { id: 'overview', label: 'Farmer Profile & Bank (किसान विवरण)', icon: User },
          { id: 'purchases', label: 'Dhan/Gehu Procurement (फसल खरीद)', icon: Wheat },
          { id: 'ledger', label: 'Farmer Khaata & Ledger (खाता विवरण)', icon: Receipt },
          { id: 'payments', label: 'Payment Vouchers & Advance (भुगतान रसीद)', icon: CreditCard },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 font-bold text-xs rounded-t-2xl transition border-b-2 whitespace-nowrap ${
                isActive
                  ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900 shadow-sm'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-amber-500 dark:text-amber-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: FARMER PROFILE & BANK & DOCUMENTS */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Personal & Village Details
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Farmer Code</span>
                <span className="font-bold text-slate-900 dark:text-white">{farmer.partyCode}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Farmer Name</span>
                <span className="font-bold text-slate-900 dark:text-white">{farmer.name}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Mobile Number</span>
                <span className="font-bold text-slate-900 dark:text-white">{farmer.phone || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Alt Mobile</span>
                <span className="font-bold text-slate-900 dark:text-white">{farmer.alternatePhone || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Village (गाँव)</span>
                <span className="font-bold text-slate-900 dark:text-white">{farmer.address || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Tehsil / District</span>
                <span className="font-bold text-slate-900 dark:text-white">{farmer.city || 'N/A'}, {farmer.state || 'MP'}</span>
              </div>
            </div>
          </div>

          <div className="glass-card p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center gap-2">
              <Landmark className="w-4 h-4 text-amber-600 dark:text-amber-400" /> Bank Account & KYC Documents (दस्तावेज़)
            </h3>
            <div className="text-xs space-y-3">
              {/* Bank Details */}
              <div className="p-3 bg-slate-100 dark:bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="font-extrabold text-emerald-600 dark:text-emerald-400 uppercase text-[10px]">Bank Account Details</div>
                <div className="font-bold text-slate-900 dark:text-white">
                  {farmer.bankName || 'Bank Name Not Specified'} {farmer.accountNo ? `• A/C: ${farmer.accountNo}` : ''}
                </div>
                {farmer.ifscCode && <div className="text-slate-500 text-[11px]">IFSC: {farmer.ifscCode}</div>}
                {farmer.bankDocUrl && (
                  <div className="pt-1">
                    <a href={farmer.bankDocUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-extrabold hover:underline">
                      📄 View Bank Passbook / Chequebook Photo
                    </a>
                  </div>
                )}
              </div>

              {/* Aadhaar & Khatauni */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="p-3 bg-slate-100 dark:bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="font-extrabold text-amber-600 dark:text-amber-400 uppercase text-[10px]">Aadhaar Card</div>
                  <div className="font-bold text-slate-900 dark:text-white">{farmer.aadhaarNo || 'Aadhaar Not Uploaded'}</div>
                  {farmer.aadhaarDocUrl && (
                    <a href={farmer.aadhaarDocUrl} target="_blank" rel="noreferrer" className="inline-block text-[11px] text-amber-600 dark:text-amber-400 font-bold hover:underline mt-1">
                      📄 View Aadhaar Card Document
                    </a>
                  )}
                </div>

                <div className="p-3 bg-slate-100 dark:bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="font-extrabold text-amber-600 dark:text-amber-400 uppercase text-[10px]">Khatauni Land Record</div>
                  {farmer.khatauniDocUrl ? (
                    <a href={farmer.khatauniDocUrl} target="_blank" rel="noreferrer" className="inline-block text-[11px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline mt-1">
                      📜 View Khatauni Document Copy
                    </a>
                  ) : (
                    <div className="text-[11px] text-slate-400">Khatauni Not Uploaded</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CROP PROCUREMENT & PURCHASES */}
      {activeTab === 'purchases' && (
        <div className="glass-card rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-emerald-500/10 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <Wheat className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Crop Procurement Logs (धान, गेहूँ, चना, मक्का खरीदी)
            </h3>
            <button
              onClick={() => setIsPurchaseModalOpen(true)}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl text-xs transition shadow-sm"
            >
              + Record New Purchase (खरीदी पर्ची)
            </button>
          </div>
          {!farmer.purchases || farmer.purchases.length === 0 ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs">
              No grain purchases recorded for this farmer yet. Click "+ Record New Purchase" to buy crop.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 font-bold uppercase">
                  <tr>
                    <th className="p-3">Voucher No</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Crop / Commodity</th>
                    <th className="p-3">Quantity & Rate</th>
                    <th className="p-3">Charges (Labour/GST/Freight)</th>
                    <th className="p-3 text-right">Bill Total</th>
                    <th className="p-3 text-right">Advance Paid</th>
                    <th className="p-3 text-right">Due Balance</th>
                    <th className="p-3">Promised Date</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
                  {farmer.purchases.map((pur) => {
                    const item = pur.items?.[0];
                    const chargesTotal = (parseFloat(pur.labourCharges) || 0) + (parseFloat(pur.gstAmount) || 0) + (parseFloat(pur.otherExpenses) || 0);

                    return (
                      <tr key={pur.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <td className="p-3 font-bold text-slate-900 dark:text-white font-mono">
                          {pur.purchaseNo}
                          {pur.parchiUrl && (
                            <a href={pur.parchiUrl} target="_blank" rel="noreferrer" className="block text-[10px] text-amber-600 dark:text-amber-400 font-bold hover:underline">
                              📄 View Parchi Scan
                            </a>
                          )}
                        </td>
                        <td className="p-3 text-slate-600 dark:text-slate-400">{new Date(pur.date).toLocaleDateString('en-IN')}</td>
                        <td className="p-3 font-extrabold text-amber-700 dark:text-amber-300">
                          {item?.commodity?.localName || item?.commodity?.name || 'Crop'}
                        </td>
                        <td className="p-3 font-bold text-slate-900 dark:text-white">
                          {item ? `${item.displayQuantity} ${item.unit?.code || 'QTL'}` : '-'}
                          {item?.ratePerUnit && <span className="block text-[10px] text-slate-500 font-normal">@ ₹{item.ratePerUnit}/unit</span>}
                        </td>
                        <td className="p-3 text-slate-600 dark:text-slate-400 text-[11px]">
                          {chargesTotal > 0 ? (
                            <span>+₹{chargesTotal.toLocaleString('en-IN')}</span>
                          ) : (
                            <span className="text-slate-400">₹0</span>
                          )}
                        </td>
                        <td className="p-3 text-right font-extrabold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(pur.netAmount)}
                        </td>
                        <td className="p-3 text-right font-bold text-blue-600 dark:text-blue-400">
                          {formatCurrency(pur.paidAmount)}
                        </td>
                        <td className="p-3 text-right font-extrabold text-amber-600 dark:text-amber-400">
                          {formatCurrency(pur.dueAmount)}
                        </td>
                        <td className="p-3 text-slate-600 dark:text-slate-400 font-medium">
                          {pur.promisedDate ? new Date(pur.promisedDate).toLocaleDateString('en-IN') : '-'}
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${
                              pur.paymentStatus === 'PAID'
                                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'
                                : pur.paymentStatus === 'PARTIAL'
                                ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20'
                                : 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20'
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
        <div className="glass-card rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Farmer Account Ledger (किसान खाता विवरण)</h3>
          </div>
          {!farmer.ledgerEntries || farmer.ledgerEntries.length === 0 ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs">No ledger entries logged yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 font-bold uppercase border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Voucher No</th>
                    <th className="p-3">Voucher Type</th>
                    <th className="p-3">Narration</th>
                    <th className="p-3 text-right text-emerald-600 dark:text-emerald-400">Paid / DR</th>
                    <th className="p-3 text-right text-rose-600 dark:text-rose-400">Crop Credit / CR</th>
                    <th className="p-3 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
                  {farmer.ledgerEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="p-3 text-slate-600 dark:text-slate-400 font-medium">
                        {new Date(entry.date).toLocaleDateString('en-IN')}
                      </td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">{entry.voucherNo}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase">
                          {entry.voucherType}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">{entry.narration || '-'}</td>
                      <td className="p-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        {parseFloat(entry.debit) > 0 ? formatCurrency(entry.debit) : '-'}
                      </td>
                      <td className="p-3 text-right font-bold text-rose-600 dark:text-rose-400">
                        {parseFloat(entry.credit) > 0 ? formatCurrency(entry.credit) : '-'}
                      </td>
                      <td className="p-3 text-right font-bold text-slate-900 dark:text-white">
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

      {/* TAB 4: PAYMENT VOUCHERS & ADVANCES */}
      {activeTab === 'payments' && (
        <div className="glass-card rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Payment Vouchers & Khet Advance Logs</h3>
          </div>
          {!farmer.payments || farmer.payments.length === 0 ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs">No payment vouchers issued yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 font-bold uppercase">
                  <tr>
                    <th className="p-3">Payment No</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Mode</th>
                    <th className="p-3">Account</th>
                    <th className="p-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
                  {farmer.payments.map((pmt) => (
                    <tr key={pmt.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="p-3 font-bold text-slate-900 dark:text-white">{pmt.paymentNo}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">{new Date(pmt.date).toLocaleDateString('en-IN')}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                          {pmt.paymentType}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">{pmt.paymentMode}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">{pmt.accountName}</td>
                      <td className="p-3 text-right font-bold text-slate-900 dark:text-white">{formatCurrency(pmt.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Farmer Payment Voucher Modal */}
      <FarmerPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        farmerId={farmer.id}
        farmerName={farmer.name}
        onSuccess={() => fetchProfile()}
      />

      {/* Farmer Crop Purchase Modal */}
      <FarmerPurchaseModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        defaultFarmer={farmer}
        onSuccess={() => fetchProfile()}
      />

      {/* Profile Photo Upload/Edit/Delete Modal */}
      <ProfileAvatarModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        currentAvatar={farmer.avatarUrl}
        entityName={farmer.name}
        apiEndpoint={`/api/parties/${farmer.id}/avatar`}
        onSuccess={() => fetchProfile()}
      />
    </main>
  );
}

