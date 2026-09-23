'use client';

import { useState } from 'react';
import { Landmark, CheckCircle, XCircle, AlertCircle, RefreshCw, CreditCard, Calendar, FileText, User } from 'lucide-react';
import toast from 'react-hot-toast';

export default function FarmerAdvanceProceedModal({ request, isOpen, onClose, onSuccess }) {
  const [disbursedMode, setDisbursedMode] = useState('CASH');
  const [accountName, setAccountName] = useState('Main Cash Account');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !request) return null;

  const isPending = request.status === 'PENDING';

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val || 0);
  };

  const handleProceedAction = async (action) => {
    setLoading(true);
    try {
      const res = await fetch('/api/farmer/advance-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: request.id,
          action, // 'APPROVE' or 'REJECT'
          disbursedMode,
          accountName,
          notes,
        }),
      });

      const json = await res.json();
      if (json.success) {
        toast.success(json.message || `Advance request ${action === 'APPROVE' ? 'approved & disbursed' : 'rejected'}!`);
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error(json.error || 'Failed to process advance request');
      }
    } catch (err) {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="glass-card w-full max-w-lg rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-2xl overflow-hidden font-outfit text-slate-900 dark:text-white">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white">Farmer Advance Details</h3>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
                  {request.requestNo}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Review request & record disbursement details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-white text-xs flex items-center justify-center transition"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          {/* Farmer & Amount Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-slate-900 dark:text-white font-bold text-sm">
                <User className="w-4 h-4 text-emerald-500" />
                {request.party?.name || 'Farmer'}
              </div>
              <p className="text-[11px] text-slate-500 font-normal">
                Code: <strong className="font-mono text-slate-700 dark:text-slate-300">{request.party?.partyCode || '-'}</strong>
                {request.party?.phone && ` • 📞 ${request.party.phone}`}
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Requested Amount</span>
              <span className="text-xl font-extrabold text-amber-500 font-bahi">{formatCurrency(request.amount)}</span>
            </div>
          </div>

          {/* Request Metadata Details */}
          <div className="space-y-2 border-y border-slate-200 dark:border-slate-800/80 py-3 text-xs">
            <div className="flex justify-between py-1">
              <span className="text-slate-500 font-semibold flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Request Date:
              </span>
              <span className="font-bold text-slate-900 dark:text-white">
                {new Date(request.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
              </span>
            </div>

            <div className="flex justify-between py-1">
              <span className="text-slate-500 font-semibold flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-400" /> Crop / Purpose:
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{request.reason || 'Khet Advance'}</span>
            </div>

            {request.notes && (
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                <strong className="text-slate-900 dark:text-white block mb-0.5">Farmer Notes:</strong>
                {request.notes}
              </div>
            )}

            <div className="flex justify-between py-1 items-center">
              <span className="text-slate-500 font-semibold">Current Status:</span>
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border ${
                  request.status === 'APPROVED'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                    : request.status === 'REJECTED'
                    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 animate-pulse'
                }`}
              >
                {request.status === 'APPROVED' ? '✓ Approved & Disbursed' : request.status === 'REJECTED' ? '✕ Rejected' : '⏳ Pending Management Approval'}
              </span>
            </div>
          </div>

          {/* If PENDING: Proceed & Disbursement Form */}
          {isPending ? (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-3">
              <h4 className="font-extrabold text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-emerald-500" /> Proceed Advance Disbursement Details
              </h4>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Disbursement Payment Mode
                </label>
                <select
                  value={disbursedMode}
                  onChange={(e) => setDisbursedMode(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="CASH">💵 Cash (Mandi Cash Register)</option>
                  <option value="BANK_TRANSFER">🏦 Bank Transfer (NEFT / RTGS)</option>
                  <option value="UPI">📱 UPI Direct Transfer</option>
                  <option value="CHEQUE">📝 Cheque Payment</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Cash / Bank Account Name
                </label>
                <select
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="Main Cash Account">Main Cash Account (Mandi Vault)</option>
                  <option value="HDFC Bank Main A/c">HDFC Bank Current Account</option>
                  <option value="SBI Mandi Branch A/c">SBI Mandi Branch Account</option>
                  <option value="ICICI Business A/c">ICICI Business Account</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Approval / Transaction Remarks (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Paid in cash at Mandi Shed #1 — Receipt #8821"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleProceedAction('REJECT')}
                  className="px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 font-bold hover:bg-rose-100 transition disabled:opacity-50"
                >
                  Reject
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleProceedAction('APPROVE')}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold shadow-lg shadow-emerald-600/20 flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" /> Approve & Disburse Advance
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Record Audit Details for Approved/Rejected Advances */
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">Record Audit & Financial Impact</h4>
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div>
                  <span className="text-slate-500 block">Disbursed Payment Mode:</span>
                  <strong className="text-slate-900 dark:text-white uppercase">{request.disbursedMode || 'CASH'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Source Account:</span>
                  <strong className="text-slate-900 dark:text-white">{request.accountName || 'Main Cash Account'}</strong>
                </div>
              </div>

              {request.status === 'APPROVED' && (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-medium text-[11px] mt-2">
                  ✓ Recorded in Farmer Khaata ledger under voucher reference <strong className="font-mono">{request.requestNo}</strong>.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
