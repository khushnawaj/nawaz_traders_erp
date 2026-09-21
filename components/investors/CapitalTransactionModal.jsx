'use client';

import { useState, useEffect } from 'react';
import { 
  X, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Calendar, 
  CreditCard, 
  Receipt, 
  FileText,
  DollarSign,
  Coins
} from 'lucide-react';
import { useAppDispatch } from '@/lib/redux/hooks';
import { recordInvestorTransaction } from '@/lib/redux/slices/investorsSlice';
import toast from 'react-hot-toast';

export default function CapitalTransactionModal({ isOpen, onClose, investor }) {
  const dispatch = useAppDispatch();
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    type: 'EMI_PAYMENT',
    principalPaid: '',
    interestPaid: '',
    totalAmount: '',
    paymentMode: 'BANK_TRANSFER',
    accountName: 'HDFC Bank Account',
    referenceNo: '',
    narration: '',
  });

  useEffect(() => {
    if (investor) {
      const emi = investor.emiAmount ? parseFloat(investor.emiAmount) : 0;
      const rate = investor.annualInterestRate ? parseFloat(investor.annualInterestRate) : 0;
      const principal = investor.currentOutstandingBalance ? parseFloat(investor.currentOutstandingBalance) : 0;

      // Estimate monthly interest = (Principal * Rate / 100) / 12
      const estInterest = Math.round((principal * (rate / 100)) / 12);
      const estPrincipal = Math.max(0, emi - estInterest);

      setFormData({
        type: 'EMI_PAYMENT',
        principalPaid: estPrincipal > 0 ? estPrincipal.toString() : '',
        interestPaid: estInterest > 0 ? estInterest.toString() : '',
        totalAmount: emi > 0 ? emi.toString() : '',
        paymentMode: 'BANK_TRANSFER',
        accountName: 'HDFC Bank Account',
        referenceNo: '',
        narration: `EMI Payment for ${investor.name}`,
      });
    }
  }, [investor, isOpen]);

  // Handle principal/interest input changes to keep total in sync
  const handlePrincipalChange = (val) => {
    const p = parseFloat(val) || 0;
    const i = parseFloat(formData.interestPaid) || 0;
    setFormData((prev) => ({
      ...prev,
      principalPaid: val,
      totalAmount: (p + i).toString(),
    }));
  };

  const handleInterestChange = (val) => {
    const p = parseFloat(formData.principalPaid) || 0;
    const i = parseFloat(val) || 0;
    setFormData((prev) => ({
      ...prev,
      interestPaid: val,
      totalAmount: (p + i).toString(),
    }));
  };

  if (!isOpen || !investor) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const tot = parseFloat(formData.totalAmount || 0);
    if (tot <= 0) {
      toast.error('Please enter a valid transaction amount greater than ₹0');
      return;
    }

    setSubmitting(true);
    try {
      await dispatch(
        recordInvestorTransaction({
          investorId: investor.id,
          type: formData.type,
          principalPaid: parseFloat(formData.principalPaid || 0),
          interestPaid: parseFloat(formData.interestPaid || 0),
          totalAmount: tot,
          paymentMode: formData.paymentMode,
          accountName: formData.accountName,
          referenceNo: formData.referenceNo,
          narration: formData.narration,
        })
      ).unwrap();

      toast.success('Financial transaction posted successfully!');
      onClose();
    } catch (err) {
      toast.error(err || 'Failed to record transaction');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="glass-modal rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-900 to-slate-900 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-outfit">Record Loan EMI or Payment</h2>
              <p className="text-xs text-emerald-300 font-outfit truncate max-w-[260px]">
                {investor.name} ({investor.investorCode})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Balance Pill */}
        <div className="bg-slate-100 dark:bg-slate-900 px-6 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium font-outfit">Current Outstanding:</span>
          <span className="text-sm font-extrabold text-rose-600 dark:text-rose-400 font-mono">
            ₹{parseFloat(investor.currentOutstandingBalance || 0).toLocaleString('en-IN')}
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="app-label">Transaction Type *</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="app-select font-outfit"
            >
              <option value="EMI_PAYMENT">Monthly EMI Payment (Principal + Interest)</option>
              <option value="PRINCIPAL_REPAYMENT">Principal Repayment Only</option>
              <option value="INTEREST_PAYMENT">Interest Payment Only</option>
              <option value="PROFIT_PAYOUT">Equity Profit Distribution Payout</option>
              <option value="PRINCIPAL_RECEIVED">Additional Capital / Loan Received</option>
              <option value="CAPITAL_WITHDRAWAL">Investor Capital Withdrawal</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="app-label">Principal Amount (₹)</label>
              <input
                type="number"
                step="any"
                placeholder="0.00"
                value={formData.principalPaid}
                onChange={(e) => handlePrincipalChange(e.target.value)}
                className="app-input font-mono"
              />
            </div>

            <div>
              <label className="app-label">Interest / Profit (₹)</label>
              <input
                type="number"
                step="any"
                placeholder="0.00"
                value={formData.interestPaid}
                onChange={(e) => handleInterestChange(e.target.value)}
                className="app-input font-mono"
              />
            </div>
          </div>

          <div>
            <label className="app-label">Total Amount Paid / Transacted (₹) *</label>
            <input
              type="number"
              step="any"
              required
              placeholder="0.00"
              value={formData.totalAmount}
              onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
              className="app-input font-mono font-bold text-emerald-600 dark:text-emerald-400 text-base"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="app-label">Payment Mode</label>
              <select
                value={formData.paymentMode}
                onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                className="app-select font-outfit"
              >
                <option value="BANK_TRANSFER">Bank NEFT / RTGS</option>
                <option value="UPI">UPI Payment</option>
                <option value="CHEQUE">Bank Cheque</option>
                <option value="CASH">Cash Payment</option>
              </select>
            </div>

            <div>
              <label className="app-label">Account / Source</label>
              <input
                type="text"
                placeholder="e.g. Main Cash, HDFC Bank"
                value={formData.accountName}
                onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                className="app-input"
              />
            </div>
          </div>

          <div>
            <label className="app-label">Reference No / UTR / Cheque #</label>
            <input
              type="text"
              placeholder="e.g. UTR-98127391823"
              value={formData.referenceNo}
              onChange={(e) => setFormData({ ...formData, referenceNo: e.target.value })}
              className="app-input font-mono"
            />
          </div>

          <div>
            <label className="app-label">Narration & Remarks</label>
            <input
              type="text"
              placeholder="e.g. EMI installment for month of Sept 2026"
              value={formData.narration}
              onChange={(e) => setFormData({ ...formData, narration: e.target.value })}
              className="app-input"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition font-outfit"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bahi-btn-primary px-6 py-2.5 text-xs font-bold font-outfit disabled:opacity-50"
            >
              {submitting ? 'Posting...' : 'Post Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
