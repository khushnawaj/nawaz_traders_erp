'use client';

import { useState, useEffect } from 'react';
import { 
  X, 
  Printer, 
  Landmark, 
  Calendar, 
  CreditCard, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Building2,
  TrendingDown,
  TrendingUp,
  Percent,
  Coins
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function InvestorLedgerModal({ isOpen, onClose, investorId }) {
  const [loading, setLoading] = useState(false);
  const [investor, setInvestor] = useState(null);

  useEffect(() => {
    if (investorId && isOpen) {
      fetchInvestorLedger();
    }
  }, [investorId, isOpen]);

  const fetchInvestorLedger = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/investors/${investorId}`);
      const json = await res.json();
      if (json.success) {
        setInvestor(json.data);
      } else {
        toast.error(json.error || 'Failed to load ledger');
      }
    } catch (err) {
      toast.error('Failed to load ledger');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200 printable-modal-overlay">
      <div className="glass-modal rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden my-4 sm:my-8 printable-modal-card">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-900 to-slate-900 p-6 text-white flex items-center justify-between print:bg-none print:text-black print:p-0 print:mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 print:hidden">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-outfit">
                {investor ? investor.name : 'Investor Statement'}
              </h2>
              <p className="text-xs text-emerald-300 font-mono print:text-slate-600">
                Code: {investor?.investorCode} • Statement of Accounts & EMI Ledger
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition font-outfit"
            >
              <Printer className="w-4 h-4" /> Print Ledger
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm animate-pulse font-outfit">
            Loading ledger statement...
          </div>
        ) : !investor ? (
          <div className="p-8 text-center text-rose-500 font-outfit">
            Ledger details not found
          </div>
        ) : (
          <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto print:max-h-none print:p-0">
            {/* Quick Overview Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-outfit">Principal Amount</div>
                <div className="text-base font-extrabold text-slate-900 dark:text-white font-mono mt-0.5">
                  ₹{parseFloat(investor.principalAmount || 0).toLocaleString('en-IN')}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-outfit">Outstanding Balance</div>
                <div className="text-base font-extrabold text-rose-600 dark:text-rose-400 font-mono mt-0.5">
                  ₹{parseFloat(investor.currentOutstandingBalance || 0).toLocaleString('en-IN')}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-outfit">Principal Repaid</div>
                <div className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                  ₹{parseFloat(investor.totalPaidPrincipal || 0).toLocaleString('en-IN')}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-outfit">Interest / Profit Paid</div>
                <div className="text-base font-extrabold text-amber-500 font-mono mt-0.5">
                  ₹{parseFloat(investor.totalPaidInterest || 0).toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Agreement Terms Details */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-500 font-medium block">Category:</span>
                <span className="font-bold text-slate-900 dark:text-white uppercase font-outfit">
                  {investor.category?.replace('_', ' ')}
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">Profit Share %:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  {parseFloat(investor.profitSharePercentage || 0)}%
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">Interest Rate:</span>
                <span className="font-bold text-amber-500 font-mono">
                  {parseFloat(investor.annualInterestRate || 0)}% ({investor.interestType})
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">Monthly EMI:</span>
                <span className="font-bold text-slate-900 dark:text-white font-mono">
                  ₹{parseFloat(investor.emiAmount || 0).toLocaleString('en-IN')} (Due {investor.emiDueDateDay || 5}th)
                </span>
              </div>
              {investor.promisedDate && (
                <div>
                  <span className="text-slate-500 font-medium block">Promised Payoff Date:</span>
                  <span className="font-bold text-amber-500 font-mono">
                    {new Date(investor.promisedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              )}
              {investor.bankName && (
                <div>
                  <span className="text-slate-500 font-medium block">Bank:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 font-outfit">
                    {investor.bankName} ({investor.accountNo ? `...${investor.accountNo.slice(-4)}` : 'N/A'})
                  </span>
                </div>
              )}
            </div>

            {/* Transactions Statement Table */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 font-outfit">
                Financial Transactions & EMI Vouchers
              </h3>

              {!investor.transactions || investor.transactions.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl">
                  No transactions recorded yet for this partner.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 dark:bg-slate-900/90 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider font-outfit border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Voucher #</th>
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3 text-right">Principal</th>
                        <th className="px-4 py-3 text-right">Interest</th>
                        <th className="px-4 py-3 text-right">Total Paid</th>
                        <th className="px-4 py-3 text-right">Balance</th>
                        <th className="px-4 py-3">Narration</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-outfit">
                      {investor.transactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                          <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-400">
                            {new Date(tx.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">
                            {tx.voucherNo}
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              {tx.type.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-slate-700 dark:text-slate-300">
                            ₹{parseFloat(tx.principalPaid || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-amber-500">
                            ₹{parseFloat(tx.interestPaid || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                            ₹{parseFloat(tx.totalAmount || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-bold text-rose-600 dark:text-rose-400">
                            ₹{parseFloat(tx.runningBalance || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="px-4 py-3 text-slate-500 max-w-[180px] truncate">
                            {tx.narration || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
