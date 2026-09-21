'use client';

import { useState, useEffect } from 'react';
import { 
  X, 
  Landmark, 
  Percent, 
  Calendar, 
  CreditCard, 
  Phone, 
  Mail, 
  MapPin, 
  FileText, 
  Calculator,
  Building2,
  UserCheck,
  Coins
} from 'lucide-react';
import { useAppDispatch } from '@/lib/redux/hooks';
import { createInvestor, updateInvestor } from '@/lib/redux/slices/investorsSlice';
import toast from 'react-hot-toast';

export default function InvestorFormModal({ isOpen, onClose, investorToEdit = null }) {
  const dispatch = useAppDispatch();
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    category: 'INVESTOR',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    principalAmount: '',
    profitSharePercentage: '',
    annualInterestRate: '',
    interestType: 'SIMPLE',
    tenureMonths: '12',
    emiAmount: '',
    emiDueDateDay: '5',
    promisedDate: '',
    status: 'ACTIVE',
    notes: '',
    bankName: '',
    accountNo: '',
    ifscCode: '',
    panNo: '',
    aadhaarNo: '',
  });

  useEffect(() => {
    if (investorToEdit) {
      setFormData({
        name: investorToEdit.name || '',
        category: investorToEdit.category || 'INVESTOR',
        phone: investorToEdit.phone || '',
        email: investorToEdit.email || '',
        address: investorToEdit.address || '',
        city: investorToEdit.city || '',
        state: investorToEdit.state || '',
        principalAmount: investorToEdit.principalAmount ? investorToEdit.principalAmount.toString() : '',
        profitSharePercentage: investorToEdit.profitSharePercentage ? investorToEdit.profitSharePercentage.toString() : '',
        annualInterestRate: investorToEdit.annualInterestRate ? investorToEdit.annualInterestRate.toString() : '',
        interestType: investorToEdit.interestType || 'SIMPLE',
        tenureMonths: investorToEdit.tenureMonths ? investorToEdit.tenureMonths.toString() : '12',
        emiAmount: investorToEdit.emiAmount ? investorToEdit.emiAmount.toString() : '',
        emiDueDateDay: investorToEdit.emiDueDateDay ? investorToEdit.emiDueDateDay.toString() : '5',
        promisedDate: investorToEdit.promisedDate ? new Date(investorToEdit.promisedDate).toISOString().split('T')[0] : '',
        status: investorToEdit.status || 'ACTIVE',
        notes: investorToEdit.notes || '',
        bankName: investorToEdit.bankName || '',
        accountNo: investorToEdit.accountNo || '',
        ifscCode: investorToEdit.ifscCode || '',
        panNo: investorToEdit.panNo || '',
        aadhaarNo: investorToEdit.aadhaarNo || '',
      });
    } else {
      setFormData({
        name: '',
        category: 'INVESTOR',
        phone: '',
        email: '',
        address: '',
        city: '',
        state: '',
        principalAmount: '',
        profitSharePercentage: '',
        annualInterestRate: '',
        interestType: 'SIMPLE',
        tenureMonths: '12',
        emiAmount: '',
        emiDueDateDay: '5',
        promisedDate: '',
        status: 'ACTIVE',
        notes: '',
        bankName: '',
        accountNo: '',
        ifscCode: '',
        panNo: '',
        aadhaarNo: '',
      });
    }
  }, [investorToEdit, isOpen]);

  // Auto calculate monthly EMI if Principal, Interest Rate & Tenure are entered
  const calculateEstimatedEMI = () => {
    const P = parseFloat(formData.principalAmount);
    const R = parseFloat(formData.annualInterestRate) / 12 / 100;
    const N = parseInt(formData.tenureMonths, 10);

    if (P > 0 && R > 0 && N > 0) {
      const emi = (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1);
      setFormData((prev) => ({ ...prev, emiAmount: Math.round(emi).toString() }));
    } else if (P > 0 && N > 0) {
      // Simple division if interest is 0
      setFormData((prev) => ({ ...prev, emiAmount: Math.round(P / N).toString() }));
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Please enter name');
      return;
    }

    setSubmitting(true);
    try {
      if (investorToEdit) {
        await dispatch(updateInvestor({ id: investorToEdit.id, ...formData })).unwrap();
        toast.success('Investor details updated successfully');
      } else {
        await dispatch(createInvestor(formData)).unwrap();
        toast.success('New Investor / Lender added successfully');
      }
      onClose();
    } catch (err) {
      toast.error(err || 'Failed to save investor details');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="glass-modal rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-900 to-slate-900 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-outfit">
                {investorToEdit ? 'Edit Investor / Lender Profile' : 'Add New Investor or Bank Loan'}
              </h2>
              <p className="text-xs text-emerald-300 font-outfit">
                Manage capital investments, profit shares, interest rates & EMI terms
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

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[78vh] overflow-y-auto">
          {/* Section 1: Basic Info */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-3 flex items-center gap-2 font-outfit">
              <UserCheck className="w-4 h-4" /> Partner / Institution Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="app-label">Partner / Lender Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HDFC Bank, Ramesh Kumar, Capital Corp"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="app-input"
                />
              </div>

              <div>
                <label className="app-label">Category / Type *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="app-select font-outfit"
                >
                  <option value="INVESTOR">Equity Investor / Capital Partner</option>
                  <option value="BANK">Bank Loan / Credit Facility</option>
                  <option value="PRIVATE_FINANCIER">Private Financier</option>
                  <option value="INDIVIDUAL_LENDER">Individual Lender</option>
                </select>
              </div>

              <div>
                <label className="app-label">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    placeholder="+91 9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="app-input pl-9"
                  />
                </div>
              </div>

              <div>
                <label className="app-label">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="email"
                    placeholder="partner@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="app-input pl-9"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Capital, Share, Interest & EMI */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-2 font-outfit">
                <Coins className="w-4 h-4" /> Capital Amount, Share & EMI Terms
              </h3>
              <button
                type="button"
                onClick={calculateEstimatedEMI}
                className="text-xs font-semibold text-amber-500 hover:text-amber-400 flex items-center gap-1 font-outfit"
              >
                <Calculator className="w-3.5 h-3.5" /> Auto-Calculate EMI
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="app-label">Principal Amount (₹)</label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 1000000"
                  value={formData.principalAmount}
                  onChange={(e) => setFormData({ ...formData, principalAmount: e.target.value })}
                  className="app-input font-mono"
                />
              </div>

              <div>
                <label className="app-label">Profit / Equity Share (%)</label>
                <div className="relative">
                  <Percent className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 15.00"
                    value={formData.profitSharePercentage}
                    onChange={(e) => setFormData({ ...formData, profitSharePercentage: e.target.value })}
                    className="app-input font-mono pr-8"
                  />
                </div>
              </div>

              <div>
                <label className="app-label">Annual Interest Rate (% p.a.)</label>
                <div className="relative">
                  <Percent className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 9.50"
                    value={formData.annualInterestRate}
                    onChange={(e) => setFormData({ ...formData, annualInterestRate: e.target.value })}
                    className="app-input font-mono pr-8"
                  />
                </div>
              </div>

              <div>
                <label className="app-label">Interest Type</label>
                <select
                  value={formData.interestType}
                  onChange={(e) => setFormData({ ...formData, interestType: e.target.value })}
                  className="app-select font-outfit"
                >
                  <option value="SIMPLE">Simple Interest</option>
                  <option value="COMPOUND">Compound Interest</option>
                  <option value="FIXED_PROFIT">Fixed Profit Share Only</option>
                </select>
              </div>

              <div>
                <label className="app-label">Tenure (Months)</label>
                <input
                  type="number"
                  placeholder="e.g. 12 or 36"
                  value={formData.tenureMonths}
                  onChange={(e) => setFormData({ ...formData, tenureMonths: e.target.value })}
                  className="app-input font-mono"
                />
              </div>

              <div>
                <label className="app-label">Monthly EMI Amount (₹)</label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 85000"
                  value={formData.emiAmount}
                  onChange={(e) => setFormData({ ...formData, emiAmount: e.target.value })}
                  className="app-input font-mono"
                />
              </div>

              <div>
                <label className="app-label">EMI Due Date (Day of Month)</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  placeholder="e.g. 5th of every month"
                  value={formData.emiDueDateDay}
                  onChange={(e) => setFormData({ ...formData, emiDueDateDay: e.target.value })}
                  className="app-input font-mono"
                />
              </div>

              <div>
                <label className="app-label">Promised Payoff / Maturity Date</label>
                <input
                  type="date"
                  value={formData.promisedDate}
                  onChange={(e) => setFormData({ ...formData, promisedDate: e.target.value })}
                  className="app-input font-mono"
                />
              </div>

              <div>
                <label className="app-label">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="app-select font-outfit"
                >
                  <option value="ACTIVE font-bold text-emerald-600">Active</option>
                  <option value="INACTIVE font-bold text-slate-400">Inactive / Settled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Bank & KYC */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-3 flex items-center gap-2 font-outfit">
              <Building2 className="w-4 h-4" /> Bank Account & Tax Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="app-label">Bank Name</label>
                <input
                  type="text"
                  placeholder="e.g. SBI, HDFC, ICICI"
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  className="app-input"
                />
              </div>

              <div>
                <label className="app-label">Account Number</label>
                <input
                  type="text"
                  placeholder="e.g. 5010023491823"
                  value={formData.accountNo}
                  onChange={(e) => setFormData({ ...formData, accountNo: e.target.value })}
                  className="app-input font-mono"
                />
              </div>

              <div>
                <label className="app-label">IFSC Code</label>
                <input
                  type="text"
                  placeholder="e.g. HDFC0001234"
                  value={formData.ifscCode}
                  onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value.toUpperCase() })}
                  className="app-input font-mono uppercase"
                />
              </div>

              <div>
                <label className="app-label">PAN Card Number</label>
                <input
                  type="text"
                  placeholder="ABCDE1234F"
                  value={formData.panNo}
                  onChange={(e) => setFormData({ ...formData, panNo: e.target.value.toUpperCase() })}
                  className="app-input font-mono uppercase"
                />
              </div>

              <div>
                <label className="app-label">Aadhaar Card Number</label>
                <input
                  type="text"
                  placeholder="1234 5678 9012"
                  value={formData.aadhaarNo}
                  onChange={(e) => setFormData({ ...formData, aadhaarNo: e.target.value })}
                  className="app-input font-mono"
                />
              </div>

              <div>
                <label className="app-label">Notes & Agreement Remarks</label>
                <input
                  type="text"
                  placeholder="e.g. Loan Agreement #992 signed on stamp paper"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="app-input"
                />
              </div>
            </div>
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
              {submitting ? 'Saving...' : investorToEdit ? 'Update Partner Profile' : 'Save Investor / Bank Loan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
