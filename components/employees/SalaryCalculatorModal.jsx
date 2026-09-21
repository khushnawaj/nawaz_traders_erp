'use client';

import { useState, useEffect } from 'react';
import {
  X,
  DollarSign,
  Calculator,
  Calendar,
  Clock,
  Building2,
  CheckCircle,
  AlertCircle,
  Receipt,
  Sparkles,
  TrendingUp,
  Coins,
  Check
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function SalaryCalculatorModal({ isOpen, onClose, employee, onSuccess }) {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
  });

  // Calculation Parameters
  const [monthStandardDays, setMonthStandardDays] = useState(30); // 30, 26, or 31
  const [paidLeaveDays, setPaidLeaveDays] = useState(2); // 1 or 2 paid leaves allowed
  const [customPresentDays, setCustomPresentDays] = useState(null);
  const [bonusAmount, setBonusAmount] = useState(0);
  const [advanceDeduction, setAdvanceDeduction] = useState(0);

  // Disbursal Mode & Account
  const [disbursedMode, setDisbursedMode] = useState('CASH');
  const [accountName, setAccountName] = useState('Petty Cash Drawer');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Derive stats from employee attendance logs
  const attendances = employee?.attendances || [];
  const loggedPresentDays = attendances.filter((a) => a.status === 'PRESENT').length || 0;
  const loggedAbsentDays = attendances.filter((a) => a.status === 'ABSENT').length || 0;
  const loggedHalfDays = attendances.filter((a) => a.status === 'HALF_DAY' || a.status === 'LEAVE').length || 0;
  const loggedOvertimeHours = attendances.reduce((acc, a) => acc + (parseFloat(a.overtimeHr) || 0), 0);

  // Allow manual override or default to logged present days
  const activePresentDays = customPresentDays !== null ? parseFloat(customPresentDays || 0) : loggedPresentDays;

  // Advance Balance from ledgers
  const latestLedger = employee?.employeeLedgers && employee.employeeLedgers.length > 0
    ? employee.employeeLedgers[employee.employeeLedgers.length - 1]
    : null;
  const totalAdvanceBalance = latestLedger ? Math.abs(parseFloat(latestLedger.runningBalance || 0)) : 0;

  // Salary Calculations
  const baseSalaryNum = parseFloat(employee?.baseSalary || 30000);
  const totalMonthDaysNum = parseFloat(monthStandardDays || 30);
  
  // Daily Rate = Base Salary / Month Days
  const dailyRate = totalMonthDaysNum > 0 ? (baseSalaryNum / totalMonthDaysNum) : 0;
  const otHourlyRate = dailyRate / 8;

  // Total Payable Days = Present Days + Paid Leave Days + (Half Days * 0.5)
  const paidLeavesNum = parseFloat(paidLeaveDays || 0);
  const halfDaysNum = parseFloat(loggedHalfDays || 0);
  const totalPayableDays = activePresentDays + paidLeavesNum + (halfDaysNum * 0.5);

  // Final Amounts
  const baseEarnedSalary = dailyRate * totalPayableDays;
  const overtimeEarnings = loggedOvertimeHours * otHourlyRate;
  const grossSalary = baseEarnedSalary + overtimeEarnings + parseFloat(bonusAmount || 0);
  const maxAdvanceDeductible = Math.min(totalAdvanceBalance, grossSalary);

  useEffect(() => {
    setAdvanceDeduction(Math.max(0, maxAdvanceDeductible));
  }, [totalAdvanceBalance, grossSalary]);

  if (!isOpen || !employee) return null;

  const netPayable = Math.max(0, grossSalary - parseFloat(advanceDeduction || 0));

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(val || 0);
  };

  const handleDisbursePayroll = async (e) => {
    e.preventDefault();
    if (grossSalary <= 0) {
      toast.error('Calculated gross salary must be greater than zero.');
      return;
    }

    setSubmitting(true);
    try {
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      const [yStr, mStr] = selectedMonth.split('-');
      const monthLabel = `${monthNames[parseInt(mStr, 10) - 1]} ${yStr}`;

      const res = await fetch(`/api/employees/${employee.id}/payroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monthLabel,
          presentDays: activePresentDays,
          paidLeaveDays: paidLeavesNum,
          absentDays: loggedAbsentDays,
          halfDays: loggedHalfDays,
          totalPayableDays,
          overtimeHours: loggedOvertimeHours,
          baseEarnedSalary,
          overtimeEarnings,
          bonusAmount: parseFloat(bonusAmount || 0),
          grossSalary,
          advanceDeduction: parseFloat(advanceDeduction || 0),
          netPayable,
          disbursedMode,
          accountName,
          notes,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to process salary disbursement');
      }

      const payload = {
        monthLabel,
        presentDays: activePresentDays,
        paidLeaveDays: paidLeavesNum,
        absentDays: loggedAbsentDays,
        halfDays: loggedHalfDays,
        totalPayableDays,
        overtimeHours: loggedOvertimeHours,
        baseEarnedSalary,
        overtimeEarnings,
        bonusAmount: parseFloat(bonusAmount || 0),
        grossSalary,
        advanceDeduction: parseFloat(advanceDeduction || 0),
        netPayable,
        disbursedMode,
        accountName,
        voucherNo: json.data?.voucherNo || `SAL-${new Date().getFullYear()}-001`,
      };

      toast.success(json.message || '🎉 Monthly salary calculated & posted to Employee Ledger!');
      if (onSuccess) onSuccess(payload);
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto font-outfit">
      <div className="glass-modal rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-8 border border-slate-200/80 dark:border-slate-800 animate-in fade-in zoom-in duration-200 text-slate-900 dark:text-white max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-900 to-slate-900 text-white p-5 flex items-center justify-between border-b border-emerald-700/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-white flex items-center gap-2">
                Monthly Final Salary Calculator
              </h3>
              <p className="text-xs text-emerald-200/80 font-normal mt-0.5">
                Staff: <strong className="text-white">{employee.fullName}</strong> ({employee.employeeCode}) • Base Salary: {formatCurrency(employee.baseSalary)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition hover:scale-105 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleDisbursePayroll} className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* SECTION 1: Month & Calculation Parameters */}
          <div className="p-4 bg-purple-500/5 rounded-2xl border border-purple-500/20 space-y-3">
            <div className="flex items-center justify-between font-bold text-purple-700 dark:text-purple-300 text-xs border-b border-purple-500/20 pb-1.5">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-purple-500" /> 1. Month & Salary Days Configuration
              </span>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="app-input w-auto py-1 px-3 font-mono font-bold text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="app-label text-[10px]">Month Standard Days</label>
                <select
                  value={monthStandardDays}
                  onChange={(e) => setMonthStandardDays(parseFloat(e.target.value))}
                  className="app-select py-2 font-mono font-bold text-xs"
                >
                  <option value={30}>30 Days (Standard Month)</option>
                  <option value={26}>26 Working Days (Excl. Sundays)</option>
                  <option value={31}>31 Days (Full Month)</option>
                  <option value={28}>28 Days (February)</option>
                </select>
              </div>

              <div>
                <label className="app-label text-[10px]">Present Days (Attandence)</label>
                <input
                  type="number"
                  min="0"
                  max={monthStandardDays}
                  step="0.5"
                  value={activePresentDays}
                  onChange={(e) => setCustomPresentDays(e.target.value)}
                  className="app-input py-2 font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400"
                />
              </div>

              <div>
                <label className="app-label text-[10px]">Paid Leave Allowance</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.5"
                  value={paidLeaveDays}
                  onChange={(e) => setPaidLeaveDays(e.target.value)}
                  placeholder="e.g. 1 or 2 days"
                  className="app-input py-2 font-mono font-bold text-xs text-purple-600 dark:text-purple-400"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Live Calculation Formula Banner */}
          <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/30 space-y-2 text-xs">
            <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider flex items-center justify-between">
              <span>Formula Calculation Breakdown</span>
              <span className="font-mono">Daily Rate: {formatCurrency(dailyRate)}/day</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-mono">
              <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-emerald-500/20">
                <span className="text-[10px] text-slate-500 block font-sans">Total Payable Days</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  {activePresentDays} (Present) + {paidLeavesNum} (Paid Leave) = <span className="text-emerald-600">{totalPayableDays} Days</span>
                </span>
              </div>

              <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-emerald-500/20">
                <span className="text-[10px] text-slate-500 block font-sans">Base Earned Calculation</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  {formatCurrency(dailyRate)} × {totalPayableDays} Days
                </span>
              </div>

              <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-emerald-500/20">
                <span className="text-[10px] text-slate-500 block font-sans">Base Earned Salary</span>
                <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                  {formatCurrency(baseEarnedSalary)}
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 3: Overtime, Bonus & Gross Salary */}
          <div className="p-4 bg-slate-50/80 dark:bg-slate-950/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] border-b border-slate-200/60 dark:border-slate-800 pb-1.5 flex items-center justify-between">
              <span>Overtime & Performance Incentives</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-mono">OT Rate: {formatCurrency(otHourlyRate)}/hr</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-slate-500 block">Logged Overtime ({loggedOvertimeHours} Hrs)</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono text-sm">+{formatCurrency(overtimeEarnings)}</span>
                </div>
                <Clock className="w-5 h-5 text-indigo-500" />
              </div>

              <div>
                <label className="app-label text-[10px]">Performance Bonus / Incentive (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={bonusAmount}
                  onChange={(e) => setBonusAmount(e.target.value)}
                  placeholder="₹ Bonus amount"
                  className="app-input font-mono font-bold text-emerald-600 dark:text-emerald-400"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex justify-between items-center font-bold text-slate-900 dark:text-white text-sm">
              <span>Gross Earnings (Earned Base + OT + Bonus):</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono font-black text-base">{formatCurrency(grossSalary)}</span>
            </div>
          </div>

          {/* SECTION 4: Advance Recovery Adjustment */}
          <div className="p-4 bg-amber-500/5 rounded-2xl border border-amber-500/20 space-y-3">
            <div className="flex justify-between items-center text-xs font-bold text-amber-800 dark:text-amber-300">
              <span className="flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-amber-500" /> Advance Recovery Adjustment
              </span>
              <span className="font-mono">Outstanding Advance Balance: {formatCurrency(totalAdvanceBalance)}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div className="text-[11px] text-slate-600 dark:text-slate-400">
                Amount to deduct from this month&apos;s salary payout to settle staff advance balance:
              </div>
              <div>
                <input
                  type="number"
                  min="0"
                  max={grossSalary}
                  step="any"
                  value={advanceDeduction}
                  onChange={(e) => setAdvanceDeduction(e.target.value)}
                  placeholder="₹ Advance Deduction"
                  className="app-input font-mono font-bold text-rose-600 dark:text-rose-400 text-right"
                />
              </div>
            </div>
          </div>

          {/* SECTION 5: Final Net Payable Banner */}
          <div className="p-4 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 text-white rounded-2xl border border-emerald-500/30 shadow-lg flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 block">Final Net Payable Amount</span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono mt-0.5">{formatCurrency(netPayable)}</div>
            </div>
            <div className="text-right text-[11px] text-emerald-200/80 font-mono">
              <div>Base ({totalPayableDays} Days): {formatCurrency(baseEarnedSalary)}</div>
              {overtimeEarnings > 0 && <div>OT ({loggedOvertimeHours}h): +{formatCurrency(overtimeEarnings)}</div>}
              {advanceDeduction > 0 && <div>Advance Deducted: -{formatCurrency(advanceDeduction)}</div>}
            </div>
          </div>

          {/* SECTION 6: Payout Mode & Remarks */}
          <div className="space-y-3 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="app-label text-[10px]">Payment Disbursal Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => { setDisbursedMode('CASH'); setAccountName('Petty Cash Drawer'); }}
                    className={`py-2 px-3 rounded-2xl border text-xs font-bold transition cursor-pointer ${
                      disbursedMode === 'CASH'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    Cash Payment
                  </button>
                  <button
                    type="button"
                    onClick={() => { setDisbursedMode('BANK'); setAccountName('SBI Operational Account'); }}
                    className={`py-2 px-3 rounded-2xl border text-xs font-bold transition cursor-pointer ${
                      disbursedMode === 'BANK'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    Bank / UPI Transfer
                  </button>
                </div>
              </div>

              <div>
                <label className="app-label text-[10px]">Account Name / Payment Source</label>
                <input
                  type="text"
                  required
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="e.g. Petty Cash / HDFC Bank"
                  className="app-input text-xs font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="app-label text-[10px]">Manager Remarks / Voucher Narration</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional salary voucher remarks..."
                className="app-input text-xs"
              />
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bahi-btn-primary py-2.5 px-6 text-xs font-extrabold shadow-lg disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {submitting ? 'Posting Voucher...' : 'Confirm & Disburse Final Salary'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
