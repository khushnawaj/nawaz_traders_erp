'use client';

import { useState, useEffect } from 'react';
import { 
  Wheat, 
  Receipt, 
  CreditCard, 
  Eye, 
  ArrowUpRight, 
  ArrowDownRight, 
  Landmark, 
  CheckCircle, 
  AlertCircle,
  Copy,
  RefreshCw,
  Award,
  FileText
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function FarmerPortalPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [farmer, setFarmer] = useState(null);
  const [advanceRequests, setAdvanceRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('purchases');
  const [docPreview, setDocPreview] = useState(null);
  const [selectedBreakdown, setSelectedBreakdown] = useState(null);
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const [advForm, setAdvForm] = useState({ amount: '', reason: 'Khet / Crop Purchase Advance', notes: '' });
  const [submittingAdv, setSubmittingAdv] = useState(false);

  useEffect(() => {
    fetchPortalData();
  }, []);

  const fetchPortalData = async () => {
    setLoading(true);
    try {
      const resUser = await fetch('/api/auth/me');
      const dataUser = await resUser.json();

      if (!dataUser.success || !dataUser.user) {
        toast.error('Session expired. Please log in.');
        return;
      }

      setCurrentUser(dataUser.user);

      let partyId = dataUser.user.partyId;

      if (!partyId) {
        // Fallback: search party by phone or full name
        const searchQuery = dataUser.user.phone || dataUser.user.fullName;
        const resSearch = await fetch(`/api/parties?search=${encodeURIComponent(searchQuery)}&role=FARMER`);
        const dataSearch = await resSearch.json();
        const partyList = dataSearch.data || dataSearch.parties || [];

        if (dataSearch.success && partyList.length > 0) {
          const matchedParty = partyList[0];
          partyId = matchedParty.id;
          // Self-link partyId for future fast loads
          fetch(`/api/users/${dataUser.user.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ partyId: matchedParty.id }),
          }).catch(() => {});
        } else {
          // Auto-create a Farmer Party profile for this logged-in farmer account
          const resCreate = await fetch('/api/parties', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: dataUser.user.fullName || dataUser.user.username,
              phone: dataUser.user.phone || '',
              roles: ['FARMER'],
              openingBalance: 0,
              balanceType: 'RECEIVABLE',
            }),
          });
          const dataCreate = await resCreate.json();
          if (dataCreate.success && dataCreate.data) {
            partyId = dataCreate.data.id;
            fetch(`/api/users/${dataUser.user.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ partyId: dataCreate.data.id }),
            }).catch(() => {});
          }
        }
      }

      if (partyId) {
        const resParty = await fetch(`/api/parties/${partyId}`);
        const dataParty = await resParty.json();
        if (dataParty.success && dataParty.data) {
          setFarmer(dataParty.data);
        } else if (dataParty.success && dataParty.party) {
          setFarmer(dataParty.party);
        }

        // Fetch Farmer Advance Requests
        const resAdv = await fetch(`/api/farmer/advance-requests?partyId=${partyId}`);
        const dataAdv = await resAdv.json();
        if (dataAdv.success) {
          setAdvanceRequests(dataAdv.data || []);
        }
      }
    } catch (err) {
      toast.error('Failed to load farmer portal data');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAdvance = async (e) => {
    e.preventDefault();
    if (!advForm.amount || parseFloat(advForm.amount) <= 0) {
      toast.error('Please enter a valid advance amount');
      return;
    }

    setSubmittingAdv(true);
    try {
      const res = await fetch('/api/farmer/advance-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(advForm.amount),
          reason: advForm.reason,
          notes: advForm.notes,
          partyId: farmer?.id,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(data.message || '🎉 Khet Advance Request Submitted!');
        setShowAdvanceModal(false);
        setAdvForm({ amount: '', reason: 'Khet / Crop Purchase Advance', notes: '' });
        fetchPortalData();
      } else {
        toast.error(data.error || 'Failed to submit advance request');
      }
    } catch (err) {
      toast.error('Network error. Please try again.');
    } finally {
      setSubmittingAdv(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val || 0);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500 flex items-center justify-center gap-2 text-xs">
        <RefreshCw className="w-5 h-5 animate-spin text-amber-500" /> Loading your personal farmer portal...
      </div>
    );
  }

  if (!farmer) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="glass-card p-8 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Farmer Profile Not Linked</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Your user account (@{currentUser?.username}) is not yet linked to an official Farmer profile. Please contact Nawaz Traders to link your profile in User Management.
          </p>
        </div>
      </main>
    );
  }

  const totalCropPurchased = farmer.purchases?.reduce((sum, p) => sum + parseFloat(p.netAmount || 0), 0) || 0;
  const totalPaymentsReceived = farmer.payments?.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0) || 0;

  return (
    <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bahi-card p-6 border border-slate-200/60 dark:border-slate-800/60 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-emerald-500 to-emerald-600 flex items-center justify-center text-white text-xl font-extrabold shadow-lg">
            <Wheat className="w-7 h-7 text-slate-950" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 mb-1 font-outfit">
              <Award className="w-3 h-3" /> Kisan Digital Bahi Portal
            </div>
            <h1 className="font-extrabold text-2xl text-slate-900 dark:text-white font-outfit tracking-tight">
              {farmer.name}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
              Party Code: <strong className="font-mono text-slate-900 dark:text-white">{farmer.partyCode}</strong> • Village: {farmer.address || 'Local Mandi'}
            </p>
          </div>
        </div>

        {/* 2-Card Summary */}
        <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
          <div className="p-3.5 bg-slate-50/90 dark:bg-slate-950/80 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 text-center shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-500 block font-outfit tracking-wider">Total Crop Sold Value</span>
            <span className="text-base sm:text-xl font-extrabold text-amber-500 font-bahi">{formatCurrency(totalCropPurchased)}</span>
          </div>

          <div className="p-3.5 bg-slate-50/90 dark:bg-slate-950/80 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 text-center shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-500 block font-outfit tracking-wider">Payments Received</span>
            <span className="text-base sm:text-xl font-extrabold text-emerald-600 dark:text-emerald-400 font-bahi">{formatCurrency(totalPaymentsReceived)}</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between gap-2 overflow-x-auto pb-0.5">
        <div className="flex gap-2">
          {[
            { id: 'purchases', label: 'My Crop Purchases & Bills', icon: Wheat },
            { id: 'ledger', label: 'Financial Khaata Statement', icon: Receipt },
            { id: 'payments', label: 'Payment Vouchers & Receipts', icon: CreditCard },
            { id: 'advances', label: `Khet Advance Requests (${advanceRequests.length})`, icon: Landmark },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500 to-emerald-600 text-slate-950 shadow-md'
                    : 'bg-slate-100/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setShowAdvanceModal(true)}
          className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition whitespace-nowrap shrink-0"
        >
          <Landmark className="w-4 h-4" /> Request Khet Advance
        </button>
      </div>

      {/* TAB 1: CROP PURCHASES & SLIPS */}
      {activeTab === 'purchases' && (
        <div className="glass-card rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-xl overflow-hidden">
          <div className="p-5 border-b border-slate-200/60 dark:border-slate-800/60 bg-amber-500/10 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Wheat className="w-4 h-4 text-amber-500" /> Grain Sales Receipts & Mandi Weighment Logs
            </h3>
          </div>

          {!farmer.purchases || farmer.purchases.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs font-normal">
              No crop purchases recorded for your profile yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 font-semibold uppercase border-b border-slate-200/60 dark:border-slate-800/60">
                  <tr>
                    <th className="p-3">Voucher No</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Commodity / Crop</th>
                    <th className="p-3">Quantity & Rate</th>
                    <th className="p-3 text-right">Bill Total</th>
                    <th className="p-3 text-right">Advance Paid</th>
                    <th className="p-3 text-right">Due Balance</th>
                    <th className="p-3 text-center">Parchi Scan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60 font-medium">
                  {farmer.purchases.map((pur) => {
                    const item = pur.items?.[0];

                    return (
                      <tr key={pur.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">{pur.purchaseNo}</td>
                        <td className="p-3 text-slate-600 dark:text-slate-400">{new Date(pur.date).toLocaleDateString('en-IN')}</td>
                        <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400">
                          {item?.commodity?.localName || item?.commodity?.name || 'Crop'}
                        </td>
                        <td className="p-3 font-bold text-slate-900 dark:text-white">
                          {item ? `${item.displayQuantity} ${item.unit?.code || 'QTL'}` : '-'}
                          {item?.ratePerUnit && <span className="block text-[10px] text-slate-500 font-normal">@ ₹{item.ratePerUnit}/unit</span>}
                        </td>
                        <td className="p-3 text-right font-bold text-slate-900 dark:text-white">
                          {formatCurrency(pur.netAmount)}
                        </td>
                        <td className="p-3 text-right text-emerald-600 dark:text-emerald-400 font-bold">
                          {formatCurrency(pur.paidAmount)}
                        </td>
                        <td className="p-3 text-right font-bold text-amber-500">
                          {formatCurrency(pur.dueAmount)}
                        </td>
                        <td className="p-3 text-center flex items-center justify-center gap-2">
                          <button
                            onClick={() => setSelectedBreakdown(pur)}
                            className="px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold hover:bg-emerald-100 transition"
                          >
                            Full Breakdown
                          </button>

                          {pur.parchiUrl && (
                            <button
                              onClick={() => setDocPreview({ url: pur.parchiUrl, title: `Parchi Slip — ${pur.purchaseNo}` })}
                              className="inline-flex items-center gap-1 text-[11px] text-amber-600 font-semibold hover:underline"
                            >
                              <Eye className="w-3.5 h-3.5" /> Slip
                            </button>
                          )}
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

      {/* TAB 2: FINANCIAL KHAATA */}
      {activeTab === 'ledger' && (
        <div className="glass-card rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-xl overflow-hidden">
          <div className="p-5 border-b border-slate-200/60 dark:border-slate-800/60 bg-slate-100/80 dark:bg-slate-900/60 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Personal Khaata Statement & Debit/Credit Ledger</h3>
          </div>

          {!farmer.ledgerEntries || farmer.ledgerEntries.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs font-normal">
              No financial transactions logged yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 font-semibold uppercase border-b border-slate-200/60 dark:border-slate-800/60">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Voucher No</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Narration</th>
                    <th className="p-3 text-right text-emerald-600 dark:text-emerald-400">Debit (Paid/Advance)</th>
                    <th className="p-3 text-right text-rose-600 dark:text-rose-400">Credit (Crop Value)</th>
                    <th className="p-3 text-right">Running Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60 font-medium">
                  {farmer.ledgerEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="p-3 text-slate-600 dark:text-slate-400">
                        {new Date(entry.date).toLocaleDateString('en-IN')}
                      </td>
                      <td className="p-3 font-semibold text-slate-900 dark:text-white font-mono">{entry.voucherNo}</td>
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
                      <td className="p-3 text-right font-extrabold text-slate-900 dark:text-white">
                        {formatCurrency(entry.runningBalance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PAYMENTS */}
      {activeTab === 'payments' && (
        <div className="glass-card rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-xl overflow-hidden">
          <div className="p-5 border-b border-slate-200/60 dark:border-slate-800/60 bg-slate-100/80 dark:bg-slate-900/60 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Payment Vouchers & Cash/Bank Receipts</h3>
          </div>

          {!farmer.payments || farmer.payments.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs font-normal">No payment receipts logged yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 font-semibold uppercase border-b border-slate-200/60 dark:border-slate-800/60">
                  <tr>
                    <th className="p-3">Payment No</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Payment Mode</th>
                    <th className="p-3">Reference No</th>
                    <th className="p-3 text-right">Amount Received</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60 font-medium">
                  {farmer.payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">{p.paymentNo}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">{new Date(p.date).toLocaleDateString('en-IN')}</td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white uppercase">{p.paymentMode}</td>
                      <td className="p-3 text-slate-500 font-mono">{p.referenceNo || '-'}</td>
                      <td className="p-3 text-right font-extrabold text-emerald-600 dark:text-emerald-400">{formatCurrency(p.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: ADVANCES (KHET ADVANCE REQUESTS & HISTORY) */}
      {activeTab === 'advances' && (
        <div className="glass-card rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-xl overflow-hidden space-y-0">
          <div className="p-5 border-b border-slate-200/60 dark:border-slate-800/60 bg-emerald-500/10 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Landmark className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Khet / Crop Advance Requests & Status
              </h3>
              <p className="text-[11px] text-slate-500 font-normal">Track your advance requests sent to Mandi Accountant</p>
            </div>
            <button
              onClick={() => setShowAdvanceModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition"
            >
              + New Request
            </button>
          </div>

          {advanceRequests.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
                <Landmark className="w-6 h-6" />
              </div>
              <p className="text-xs text-slate-500">You have no active or past advance requests.</p>
              <button
                onClick={() => setShowAdvanceModal(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition"
              >
                Request Khet Advance
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 font-semibold uppercase border-b border-slate-200/60 dark:border-slate-800/60">
                  <tr>
                    <th className="p-3">Request No</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Reason / Crop</th>
                    <th className="p-3 text-right">Requested Amount</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3">Disbursed Mode</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60 font-medium">
                  {advanceRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">{req.requestNo}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">{new Date(req.createdAt).toLocaleDateString('en-IN')}</td>
                      <td className="p-3 font-semibold text-slate-900 dark:text-white">{req.reason}</td>
                      <td className="p-3 text-right font-extrabold text-amber-500 font-bahi">{formatCurrency(req.amount)}</td>
                      <td className="p-3 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${
                            req.status === 'APPROVED'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                              : req.status === 'REJECTED'
                              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                          }`}
                        >
                          {req.status === 'APPROVED' ? '✓ Approved' : req.status === 'REJECTED' ? '✕ Rejected' : '⏳ Pending Approval'}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-400 font-semibold uppercase">{req.disbursedMode || 'CASH'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Document Lightbox Preview Modal */}
      {docPreview && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-2xl rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-2xl overflow-hidden">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
              <h4 className="font-bold text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" /> {docPreview.title}
              </h4>
              <button onClick={() => setDocPreview(null)} className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs">
                ✕ Close
              </button>
            </div>
            <div className="p-4 bg-slate-950 flex items-center justify-center">
              <img src={docPreview.url} alt={docPreview.title} className="max-h-[70vh] rounded-2xl object-contain shadow-lg" />
            </div>
          </div>
        </div>
      )}

      {/* Itemized Math Breakdown Modal */}
      {selectedBreakdown && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden text-slate-900 dark:text-white font-outfit">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
              <div>
                <h4 className="font-bold text-sm text-emerald-400">Crop Purchase Full Breakdown</h4>
                <p className="text-[11px] text-slate-400 font-mono">Voucher No: {selectedBreakdown.purchaseNo}</p>
              </div>
              <button onClick={() => setSelectedBreakdown(null)} className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs">
                ✕ Close
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300 font-medium">
                ✓ Full breakdown SMS & WhatsApp update was automatically sent to your mobile.
              </div>

              <div className="space-y-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                  <span>Gross Crop Value ({selectedBreakdown.items?.[0]?.displayQuantity || 0} QTL @ ₹{selectedBreakdown.items?.[0]?.ratePerUnit}):</span>
                  <span>{formatCurrency(selectedBreakdown.grossAmount)}</span>
                </div>
                {parseFloat(selectedBreakdown.labourCharges) > 0 && (
                  <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-bold">
                    <span>+ Palledari / Labour Pay:</span>
                    <span>+₹{parseFloat(selectedBreakdown.labourCharges).toFixed(2)}</span>
                  </div>
                )}
                {parseFloat(selectedBreakdown.gstAmount) > 0 && (
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>+ Mandi Tax / GST:</span>
                    <span>+₹{parseFloat(selectedBreakdown.gstAmount).toFixed(2)}</span>
                  </div>
                )}
                {parseFloat(selectedBreakdown.totalDeductions) > 0 && (
                  <div className="flex justify-between text-rose-600 dark:text-rose-400">
                    <span>- Deductions (Moisture/Katta):</span>
                    <span>-₹{parseFloat(selectedBreakdown.totalDeductions).toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="p-3 rounded-xl bg-slate-900 text-white flex justify-between items-center font-bold">
                <span>Net Payable Amount:</span>
                <span className="text-emerald-400 text-sm">{formatCurrency(selectedBreakdown.netAmount)}</span>
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-slate-600 dark:text-slate-400 font-semibold">
                  <span>Advance Amount Paid:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(selectedBreakdown.paidAmount)}</span>
                </div>
                <div className="flex justify-between font-bold text-rose-600 dark:text-rose-400 text-sm">
                  <span>Remaining Balance Due:</span>
                  <span>{formatCurrency(selectedBreakdown.dueAmount)}</span>
                </div>
                {selectedBreakdown.promisedDate && (
                  <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold pt-1">
                    🗓️ Promised Payment Date: {new Date(selectedBreakdown.promisedDate).toLocaleDateString('en-IN')}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Request Khet Advance Modal */}
      {showAdvanceModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden text-slate-900 dark:text-white font-outfit animate-in fade-in duration-200">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <Landmark className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-white">Request Khet Advance</h4>
                  <p className="text-[10px] text-slate-400">Directly notifies Mandi Accountant for quick disbursement</p>
                </div>
              </div>
              <button
                onClick={() => setShowAdvanceModal(false)}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-white text-xs flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRequestAdvance} className="p-6 space-y-4 text-xs">
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-400 font-medium leading-relaxed">
                💡 Requested advance will be reviewed by Mandi Accountant and credited directly to your cash/bank account upon approval.
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Requested Advance Amount (₹) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="100"
                  required
                  placeholder="e.g. 25000"
                  value={advForm.amount}
                  onChange={(e) => setAdvForm({ ...advForm, amount: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Purpose / Crop Details
                </label>
                <select
                  value={advForm.reason}
                  onChange={(e) => setAdvForm({ ...advForm, reason: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="Khet / Crop Purchase Advance">🌾 Khet / Crop Purchase Advance (धान / गेहूँ फसल)</option>
                  <option value="Fertilizer & Seeds Expenses">🌱 Seeds & Fertilizer Expenses (बीज व खाद)</option>
                  <option value="Labour & Harvesting Advance">🚜 Harvesting / Labour Expenses (कटाई व पल्लेदारी)</option>
                  <option value="Emergency Household Expense">🏠 Personal / Household Emergency</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Additional Notes / Repayment Target (Optional)
                </label>
                <textarea
                  rows="3"
                  placeholder="e.g. Repayment from upcoming Gehu harvest expected next week"
                  value={advForm.notes}
                  onChange={(e) => setAdvForm({ ...advForm, notes: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdvanceModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAdv}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition"
                >
                  {submittingAdv ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Submitting...
                    </>
                  ) : (
                    'Submit Advance Request'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
