'use client';

import { useState } from 'react';
import { X, DollarSign, CreditCard, Calendar, FileText, Hash } from 'lucide-react';
import toast from 'react-hot-toast';

export default function FarmerPaymentModal({ isOpen, onClose, farmerId, farmerName, onSuccess }) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    paymentType: 'PAYMENT_MADE', // PAYMENT_MADE (dene hain) or ADVANCE_GIVEN
    paymentMode: 'CASH', // CASH, BANK_TRANSFER, UPI, CHEQUE
    accountName: 'Main Cash Account',
    referenceNo: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Please enter a valid payment amount');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partyId: farmerId,
          date: formData.date,
          amount: parseFloat(formData.amount),
          paymentType: formData.paymentType,
          paymentMode: formData.paymentMode,
          accountName: formData.accountName,
          referenceNo: formData.referenceNo || null,
          notes: formData.notes || null,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to process payment');
      }

      toast.success(`Payment voucher of ₹${formData.amount} issued to ${farmerName}!`);
      onSuccess();
      onClose();

      setFormData({
        date: new Date().toISOString().split('T')[0],
        amount: '',
        paymentType: 'PAYMENT_MADE',
        paymentMode: 'CASH',
        accountName: 'Main Cash Account',
        referenceNo: '',
        notes: '',
      });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="glass-modal rounded-3xl max-w-md w-full shadow-2xl overflow-hidden my-8 border border-slate-200/80 dark:border-slate-800 animate-in fade-in zoom-in duration-200 text-slate-900 dark:text-white">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-900 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-emerald-700/40">
          <div>
            <h3 className="font-semibold text-base sm:text-lg flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-amber-400" /> Payment / Advance Voucher
            </h3>
            <p className="text-xs text-emerald-200/80 font-normal mt-0.5">Farmer: <span className="font-semibold text-white">{farmerName}</span></p>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all hover:scale-105"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[85vh] overflow-y-auto">
          {/* Voucher Date & Amount Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Date Input */}
            <div>
              <label className="app-label">
                <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Voucher Date *
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="app-input"
                />
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="app-label">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Amount (₹) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  placeholder="e.g. 50000"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="app-input pl-8 font-semibold text-emerald-600 dark:text-emerald-400"
                />
                <span className="absolute left-3 top-2.5 font-semibold text-slate-400">₹</span>
              </div>
            </div>
          </div>

          {/* Payment Type & Payment Mode Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="app-label">Voucher Type *</label>
              <select
                value={formData.paymentType}
                onChange={(e) => setFormData({ ...formData, paymentType: e.target.value })}
                className="app-select"
              >
                <option value="PAYMENT_MADE">CROP SETTLEMENT</option>
                <option value="ADVANCE_GIVEN">ADVANCE PAYMENT</option>
              </select>
            </div>

            <div>
              <label className="app-label">Payment Mode *</label>
              <select
                value={formData.paymentMode}
                onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                className="app-select"
              >
                <option value="CASH">CASH</option>
                <option value="BANK_TRANSFER">BANK TRANSFER (RTGS/NEFT)</option>
                <option value="UPI">UPI / PHONEPE / GPAY</option>
                <option value="CHEQUE">CHEQUE</option>
              </select>
            </div>
          </div>

          {/* Payment Account */}
          <div>
            <label className="app-label">
              <CreditCard className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Paying Account *
            </label>
            <select
              value={formData.accountName}
              onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
              className="app-select"
            >
              <option value="Main Cash Account">Main Cash Account</option>
              <option value="SBI Current Account">SBI Mandi Branch Current Account</option>
              <option value="HDFC Bank Account">HDFC Main Account</option>
            </select>
          </div>

          {/* Reference / UTR Number */}
          <div>
            <label className="app-label">
              <Hash className="w-3.5 h-3.5 text-slate-500" /> UTR / Cheque / Ref Number (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. UTR309482019 / CHQ-8849"
              value={formData.referenceNo}
              onChange={(e) => setFormData({ ...formData, referenceNo: e.target.value })}
              className="app-input"
            />
          </div>

          {/* Remarks / Narration (Optional) */}
          <div>
            <label className="app-label">
              <FileText className="w-3.5 h-3.5 text-slate-500" /> Remarks / Narration (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Advance paid for upcoming Soybean harvesting / Partial crop settlement"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="app-textarea resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-xs font-semibold bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white rounded-2xl shadow-md transition disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? 'Processing...' : 'Issue Payment Voucher'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
