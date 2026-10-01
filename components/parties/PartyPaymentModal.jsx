'use client';

import { useState } from 'react';
import { X, DollarSign, Calendar, CreditCard, FileText, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PartyPaymentModal({ isOpen, onClose, party, onSuccess }) {
  const [formData, setFormData] = useState({
    amount: '',
    paymentType: 'PAYMENT_RECEIVED', // PAYMENT_RECEIVED (Jama - from Udhaar customer) or PAYMENT_MADE (Naam - to vendor/farmer)
    paymentMode: 'CASH',
    accountName: 'Main Cash Account',
    referenceNo: '',
    notes: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !party) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partyId: party.id,
          amount: parseFloat(formData.amount),
          paymentType: formData.paymentType,
          paymentMode: formData.paymentMode,
          accountName: formData.accountName,
          referenceNo: formData.referenceNo,
          notes: formData.notes,
          date: formData.date,
        }),
      });

      const json = await res.json();
      if (json.success) {
        toast.success(
          formData.paymentType === 'PAYMENT_RECEIVED'
            ? `Jama Payment of ₹${formData.amount} recorded for ${party.name}!`
            : `Payment of ₹${formData.amount} recorded for ${party.name}!`
        );
        if (onSuccess) onSuccess();
        onClose();
        setFormData({
          amount: '',
          paymentType: 'PAYMENT_RECEIVED',
          paymentMode: 'CASH',
          accountName: 'Main Cash Account',
          referenceNo: '',
          notes: '',
          date: new Date().toISOString().split('T')[0],
        });
      } else {
        toast.error(json.error || 'Failed to record payment');
      }
    } catch (err) {
      console.error('Error submitting payment:', err);
      toast.error('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="glass-modal w-full max-w-lg rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-2xl p-6 space-y-6 relative overflow-hidden bg-white dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-4">
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Khaata Payment & Jama Entry
            </span>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
              Record Payment for {party.name}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Party Code: {party.partyCode} | Current Balance: ₹{parseFloat(party.openingBalance || 0).toLocaleString('en-IN')} ({party.balanceType === 'RECEIVABLE' ? 'DR - Lene hain' : 'CR - Dene hain'})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Transaction Type Radio */}
          <div className="space-y-1.5">
            <label className="app-label">Payment Direction / Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, paymentType: 'PAYMENT_RECEIVED' })}
                className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition ${
                  formData.paymentType === 'PAYMENT_RECEIVED'
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-semibold shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <span className="text-xs font-semibold">₹ PAYMENT RECEIVED (JAMA)</span>
                <span className="text-[10px] opacity-80 font-normal">Udhaar Customer se paise aaye</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, paymentType: 'PAYMENT_MADE' })}
                className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition ${
                  formData.paymentType === 'PAYMENT_MADE'
                    ? 'bg-rose-500/10 border-rose-500 text-rose-700 dark:text-rose-300 font-semibold shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <span className="text-xs font-semibold">₹ PAYMENT MADE (NAAM)</span>
                <span className="text-[10px] opacity-80 font-normal">Customer/Farmer ko paise diye</span>
              </button>
            </div>
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="app-label">Amount (₹)</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 5000"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="app-input font-semibold text-sm text-emerald-600 dark:text-emerald-400"
                />
              </div>
            </div>

            <div>
              <label className="app-label">Payment Date</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="app-input"
              />
            </div>
          </div>

          {/* Payment Mode & Bank Account */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="app-label">Payment Mode</label>
              <select
                value={formData.paymentMode}
                onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                className="app-select"
              >
                <option value="CASH">CASH (नकद)</option>
                <option value="UPI">UPI / GPay / PhonePe</option>
                <option value="BANK_TRANSFER">BANK TRANSFER (NEFT/RTGS)</option>
                <option value="CHEQUE">CHEQUE (चेक)</option>
              </select>
            </div>

            <div>
              <label className="app-label">Ledger Account</label>
              <select
                value={formData.accountName}
                onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                className="app-select"
              >
                <option value="Main Cash Account">Main Cash Account</option>
                <option value="SBI Bank A/C">SBI Bank A/C</option>
                <option value="HDFC Bank A/C">HDFC Bank A/C</option>
                <option value="Kirana Store Udhaar Counter">Kirana Store Counter</option>
              </select>
            </div>
          </div>

          {/* Reference No */}
          <div>
            <label className="app-label">UPI / Cheque / Ref Number (Optional)</label>
            <input
              type="text"
              placeholder="e.g. UTR-99882211 or Cheque #000124"
              value={formData.referenceNo}
              onChange={(e) => setFormData({ ...formData, referenceNo: e.target.value })}
              className="app-input font-mono"
            />
          </div>

          {/* Narration / Notes */}
          <div>
            <label className="app-label">Narration / Notes</label>
            <textarea
              rows="2"
              placeholder="e.g. Udhaar Jama against bill #1042"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="app-input"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200/60 dark:border-slate-800/60">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-sm transition flex items-center gap-2 disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{submitting ? 'Saving Voucher...' : 'Save Payment Voucher'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
