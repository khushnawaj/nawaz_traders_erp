'use client';

import { useRef } from 'react';
import { 
  X, 
  Printer, 
  Share2, 
  DollarSign, 
  Building2, 
  CheckCircle2, 
  ShieldCheck, 
  User,
  Calendar,
  Briefcase,
  Phone,
  CreditCard,
  Landmark,
  Clock,
  Award,
  TrendingUp,
  TrendingDown,
  Sparkles,
  FileText,
  QrCode,
  Lock
} from 'lucide-react';
import { formatCurrency, numberToWordsINR } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function PayslipReceiptModal({ isOpen, onClose, payrollData, employee }) {
  const printableRef = useRef(null);

  if (!isOpen || !employee || !payrollData) return null;

  const handlePrint = () => {
    const printContent = printableRef.current;
    if (!printContent) {
      window.print();
      return;
    }

    // Isolated pop-up print window guarantees 100% clean PDF/Print rendering on mobile, desktop, and all browsers
    const printWindow = window.open('', '_blank', 'width=900,height=1000');
    if (!printWindow) {
      window.print();
      return;
    }

    const logoUrl = window.location.origin + '/images/nawaz-traders-primary.png';
    const watermarkUrl = window.location.origin + '/images/circular logo.png';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payslip - ${employee.fullName} (${payrollData.monthLabel || 'Salary Voucher'})</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
            body { font-family: 'Outfit', sans-serif; background: #ffffff; color: #0f172a; margin: 0; padding: 24px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            @media print {
              body { padding: 0; }
              @page { size: A4 portrait; margin: 10mm; }
            }
          </style>
        </head>
        <body>
          <div style="max-width: 800px; margin: 0 auto; position: relative;">
            ${printContent.innerHTML}
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleShareWhatsApp = () => {
    const message = `*NAWAZ TRADERS — MONTHLY SALARY SLIP*\n*Employee Name:* ${employee.fullName}\n*Employee Code:* ${employee.employeeCode}\n*Month:* ${payrollData.monthLabel || 'Current Month'}\n*Present Days:* ${payrollData.presentDays} Days (+ ${payrollData.paidLeaveDays || 0} Paid Leave)\n*Gross Salary:* ${formatCurrency(payrollData.grossSalary)}\n*Advance Deductions:* -${formatCurrency(payrollData.advanceDeduction)}\n*Net Paid Payout:* ${formatCurrency(payrollData.netPayable)}\n*Amount in Words:* ${numberToWordsINR(payrollData.netPayable)}\n\nThank you for working with Nawaz Traders!`;
    const cleanPhone = employee.phone ? employee.phone.replace(/[^0-9]/g, '') : '';
    const phoneParam = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const url = `https://wa.me/${phoneParam}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const netPayableWords = numberToWordsINR(payrollData.netPayable);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto font-outfit printable-modal-overlay">
      <div className="glass-modal rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden my-4 sm:my-8 border border-slate-200/80 dark:border-slate-800 animate-in fade-in zoom-in duration-200 text-slate-900 dark:text-white flex flex-col max-h-[92vh] printable-modal-card">
        
        {/* Top Control Bar */}
        <div className="bg-slate-900 text-white p-3 sm:p-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 print:hidden shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-bold text-xs sm:text-sm">Official Corporate Payslip & Salary Voucher</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-2xl flex items-center gap-1.5 transition cursor-pointer active:scale-95 shadow-sm"
            >
              <Share2 className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Share</span> WhatsApp
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-2xl flex items-center gap-1.5 transition cursor-pointer active:scale-95 shadow-md"
            >
              <Printer className="w-3.5 h-3.5" /> Print / Save PDF
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Payslip Body */}
        <div 
          ref={printableRef} 
          className="p-4 sm:p-8 bg-white text-slate-900 space-y-4 sm:space-y-5 overflow-y-auto flex-1 font-sans printable-content-area relative"
        >
          {/* Background Watermark Image */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 opacity-[0.04] overflow-hidden">
            <img 
              src="/images/circular logo.png" 
              alt="Watermark Logo" 
              className="w-96 h-96 object-contain"
            />
          </div>

          <div className="relative z-10 space-y-4 sm:space-y-5">
            {/* Top Corporate Legal Header */}
            <div className="bg-slate-900 text-slate-200 px-4 py-1.5 rounded-xl flex items-center justify-between text-[10px] font-mono tracking-wider font-semibold">
              <div className="flex items-center gap-3">
                <span>GSTIN: <strong className="text-emerald-400">23AABCN9921F1Z8</strong></span>
                <span className="hidden sm:inline">|</span>
                <span className="hidden sm:inline">MANDI LIC NO: <strong className="text-emerald-400">SEH/MP/2024-8891</strong></span>
              </div>
              <div>ISO 9001:2015 CERTIFIED GRAIN MANDI</div>
            </div>

            {/* Main Header Banner with Image Logo */}
            <div className="border-b-2 border-emerald-600 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <img 
                  src="/images/circular logo.png" 
                  alt="Nawaz Traders Logo" 
                  className="w-14 h-14 sm:w-16 sm:h-16 object-contain shrink-0 rounded-2xl bg-emerald-950 p-1 shadow-sm"
                />
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-emerald-950 font-outfit uppercase tracking-tight flex items-center gap-2">
                    NAWAZ TRADERS
                  </h1>
                  <p className="text-xs text-slate-700 font-bold tracking-wide">Grain Merchants, Mandi Procurement & Cold Warehousing</p>
                  <p className="text-[11px] text-slate-500 font-medium">Head Office: Main Mandi Yard, Gate No. 2, Sehore / Bhopal, Madhya Pradesh</p>
                  <p className="text-[10px] text-slate-500">Helpline: +91 98260 12345 • Email: hr@nawaztraders.com</p>
                </div>
              </div>

              <div className="text-left sm:text-right shrink-0 bg-emerald-50/80 p-3 rounded-2xl border border-emerald-200">
                <span className="px-3 py-1 bg-emerald-700 text-white font-outfit font-black text-xs rounded-lg uppercase inline-flex items-center gap-1.5 shadow-sm">
                  <FileText className="w-3.5 h-3.5" /> SALARY SLIP VOUCHER
                </span>
                <div className="text-xs text-slate-700 font-mono mt-1.5 font-extrabold">
                  Voucher No: <span className="text-emerald-900">{payrollData.voucherNo || `SAL-${new Date().getFullYear()}-001`}</span>
                </div>
                <div className="text-[11px] text-slate-500 font-medium flex items-center justify-start sm:justify-end gap-1 mt-0.5">
                  <Calendar className="w-3 h-3 text-emerald-600" /> Issue Date: {new Date().toLocaleDateString('en-IN')}
                </div>
              </div>
            </div>

            {/* Employee Profile & Payroll Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/90 text-xs shadow-xs">
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Employee Name</span>
                    <strong className="text-slate-900 text-sm font-outfit">{employee.fullName}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center font-bold shrink-0">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Employee Code & Role</span>
                    <strong className="text-slate-900 font-mono">{employee.employeeCode}</strong> • <span className="text-slate-700 font-medium">{employee.role}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center font-bold shrink-0">
                    <Phone className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Contact Phone</span>
                    <span className="font-mono text-slate-800 font-semibold">{employee.phone || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-left sm:text-right">
                <div className="flex items-center sm:justify-end gap-2.5">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Payroll Period</span>
                    <strong className="text-emerald-800 font-outfit text-sm">{payrollData.monthLabel || 'Current Month'}</strong>
                  </div>
                  <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                </div>

                <div className="flex items-center sm:justify-end gap-2.5">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Monthly Base Salary</span>
                    <span className="font-mono font-bold text-slate-900">{formatCurrency(employee.baseSalary)} / {employee.salaryType}</span>
                  </div>
                  <div className="w-7 h-7 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center font-bold shrink-0">
                    <DollarSign className="w-4 h-4 text-emerald-700" />
                  </div>
                </div>

                <div className="flex items-center sm:justify-end gap-2.5">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Bank Account & IFSC</span>
                    <span className="font-mono text-slate-800 font-semibold">{employee.accountNo || 'Cash Disbursal'} ({employee.ifscCode || 'N/A'})</span>
                  </div>
                  <div className="w-7 h-7 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center font-bold shrink-0">
                    <Landmark className="w-4 h-4 text-emerald-700" />
                  </div>
                </div>
              </div>
            </div>

            {/* Attendance Summary Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2.5 bg-emerald-50/90 rounded-2xl border border-emerald-200/80 shadow-2xs">
                <div className="flex items-center justify-center gap-1 text-[10px] text-emerald-800 font-bold uppercase mb-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Present Days
                </div>
                <strong className="text-emerald-950 text-xs sm:text-sm font-mono font-black">{payrollData.presentDays || 0} Days</strong>
              </div>

              <div className="p-2.5 bg-purple-50/90 rounded-2xl border border-purple-200/80 shadow-2xs">
                <div className="flex items-center justify-center gap-1 text-[10px] text-purple-800 font-bold uppercase mb-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" /> Paid Leave
                </div>
                <strong className="text-purple-950 text-xs sm:text-sm font-mono font-black">{payrollData.paidLeaveDays || 0} Days</strong>
              </div>

              <div className="p-2.5 bg-amber-50/90 rounded-2xl border border-amber-200/80 shadow-2xs">
                <div className="flex items-center justify-center gap-1 text-[10px] text-amber-800 font-bold uppercase mb-0.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" /> Total Paid Days
                </div>
                <strong className="text-amber-950 text-xs sm:text-sm font-mono font-black">{payrollData.totalPayableDays || (payrollData.presentDays + (payrollData.paidLeaveDays || 0))} Days</strong>
              </div>

              <div className="p-2.5 bg-indigo-50/90 rounded-2xl border border-indigo-200/80 shadow-2xs">
                <div className="flex items-center justify-center gap-1 text-[10px] text-indigo-800 font-bold uppercase mb-0.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-600" /> Overtime
                </div>
                <strong className="text-indigo-950 text-xs sm:text-sm font-mono font-black">{payrollData.overtimeHours || 0} Hrs</strong>
              </div>
            </div>

            {/* Earnings & Deductions Executive Table */}
            <div className="border border-slate-300 rounded-2xl overflow-x-auto text-xs shadow-xs">
              <table className="w-full text-left border-collapse min-w-[520px]">
                <thead className="bg-slate-900 text-white font-bold border-b border-slate-300">
                  <tr>
                    <th className="p-3 border-r border-slate-800">
                      <div className="flex items-center gap-1.5 text-emerald-400 uppercase tracking-wider text-[11px]">
                        <TrendingUp className="w-4 h-4" /> Earnings Breakdown
                      </div>
                    </th>
                    <th className="p-3 border-r border-slate-800 text-right whitespace-nowrap text-[11px] uppercase tracking-wider">Amount (₹)</th>
                    <th className="p-3 border-r border-slate-800">
                      <div className="flex items-center gap-1.5 text-rose-400 uppercase tracking-wider text-[11px]">
                        <TrendingDown className="w-4 h-4" /> Deductions / Recoveries
                      </div>
                    </th>
                    <th className="p-3 text-right whitespace-nowrap text-[11px] uppercase tracking-wider">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium text-slate-700 bg-white">
                  <tr>
                    <td className="p-3 border-r border-slate-300">
                      <div className="flex items-center gap-2 font-semibold text-slate-900">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Earned Base Salary ({payrollData.totalPayableDays || payrollData.presentDays} Days)
                      </div>
                    </td>
                    <td className="p-3 border-r border-slate-300 text-right font-mono font-bold text-slate-900 whitespace-nowrap">{formatCurrency(payrollData.baseEarnedSalary)}</td>
                    <td className="p-3 border-r border-slate-300">
                      <div className="flex items-center gap-2 font-semibold text-rose-700">
                        <div className="w-2 h-2 rounded-full bg-rose-500"></div> Advance Salary Recovery Adjustment
                      </div>
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-rose-600 whitespace-nowrap">-{formatCurrency(payrollData.advanceDeduction)}</td>
                  </tr>
                  <tr>
                    <td className="p-3 border-r border-slate-300">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-indigo-500"></div> Overtime Earnings ({payrollData.overtimeHours || 0} Hrs)
                      </div>
                    </td>
                    <td className="p-3 border-r border-slate-300 text-right font-mono text-emerald-700 font-bold whitespace-nowrap">+{formatCurrency(payrollData.overtimeEarnings)}</td>
                    <td className="p-3 border-r border-slate-300 text-slate-400">Other Statutory / PF / ESI Deductions</td>
                    <td className="p-3 text-right font-mono text-slate-400 whitespace-nowrap">-₹0.00</td>
                  </tr>
                  {parseFloat(payrollData.bonusAmount || 0) > 0 && (
                    <tr>
                      <td className="p-3 border-r border-slate-300">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-amber-500"></div> Performance Bonus / Mandi Incentive
                        </div>
                      </td>
                      <td className="p-3 border-r border-slate-300 text-right font-mono text-emerald-700 font-bold whitespace-nowrap">+{formatCurrency(payrollData.bonusAmount)}</td>
                      <td className="p-3 border-r border-slate-300"></td>
                      <td className="p-3 text-right font-mono"></td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-slate-100 font-extrabold text-slate-900 border-t-2 border-slate-300">
                  <tr>
                    <td className="p-3 border-r border-slate-300 uppercase text-[11px] tracking-wider">Total Gross Earnings</td>
                    <td className="p-3 border-r border-slate-300 text-right font-mono text-emerald-800 text-sm whitespace-nowrap">{formatCurrency(payrollData.grossSalary)}</td>
                    <td className="p-3 border-r border-slate-300 uppercase text-[11px] tracking-wider">Total Deductions</td>
                    <td className="p-3 text-right font-mono text-rose-700 text-sm whitespace-nowrap">-{formatCurrency(payrollData.advanceDeduction)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Net Salary Disbursed Highlight Banner with Amount in Words */}
            <div className="p-4 bg-emerald-900 text-white rounded-2xl border-2 border-emerald-600 shadow-md space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-500 text-slate-950 rounded-xl shrink-0">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-300 block tracking-wider">NET DISBURSED SALARY PAYOUT</span>
                    <div className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight">{formatCurrency(payrollData.netPayable)}</div>
                  </div>
                </div>

                <div className="text-left sm:text-right text-xs text-emerald-200 font-semibold bg-emerald-950/70 p-2.5 rounded-xl border border-emerald-700/60">
                  <div>Payment Mode: <strong className="text-white uppercase">{payrollData.disbursedMode || 'CASH'}</strong></div>
                  <div className="text-[11px] text-emerald-400">{payrollData.accountName || 'Petty Cash Drawer'}</div>
                </div>
              </div>

              {/* Amount in Words Row */}
              <div className="pt-2 border-t border-emerald-800/80 text-xs text-emerald-200 font-medium flex items-center gap-2">
                <span className="font-bold text-emerald-400 uppercase text-[10px] shrink-0">Amount in Words:</span>
                <span className="font-outfit italic font-semibold text-white tracking-wide">{netPayableWords}</span>
              </div>
            </div>

            {/* Corporate Executive Footer */}
            <div className="pt-6 sm:pt-8 space-y-6">
              <div className="grid grid-cols-3 gap-4 items-end text-xs text-slate-600 font-medium">
                {/* Employee Signature */}
                <div className="text-center space-y-4">
                  <div className="w-32 border-b-2 border-slate-400 mx-auto"></div>
                  <div className="text-slate-900 font-bold text-[11px] uppercase">
                    Employee Signature
                  </div>
                </div>

                {/* Verification QR Code Graphic */}
                <div className="text-center flex flex-col items-center justify-center space-y-1">
                  <div className="p-1.5 bg-white border border-slate-300 rounded-xl shadow-xs">
                    <QrCode className="w-10 h-10 text-slate-800" />
                  </div>
                  <span className="text-[9px] text-slate-500 font-mono tracking-tighter uppercase font-semibold">Scan to verify online</span>
                </div>

                {/* Manager Sign & Official Stamp Graphic */}
                <div className="text-center space-y-4">
                  <div className="relative inline-block">
                    <div className="w-36 border-b-2 border-slate-400 mx-auto"></div>
                    {/* Seal Stamp Graphic Overlay */}
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 pointer-events-none opacity-80">
                      <div className="w-16 h-16 rounded-full border-2 border-dashed border-emerald-700 text-emerald-800 flex flex-col items-center justify-center text-[8px] font-black uppercase tracking-tighter leading-tight bg-emerald-50/60 rotate-[-12deg]">
                        <span>NAWAZ TRADERS</span>
                        <span>SEHORE</span>
                        <span className="text-[6px] text-emerald-600">★ VERIFIED ★</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-slate-900 font-bold text-[11px] uppercase">
                    Authorized Stamp & Sign<br/>
                    <span className="text-[10px] text-slate-500 font-normal">Nawaz Traders Management</span>
                  </div>
                </div>
              </div>

              {/* Bottom Fine Print Footer */}
              <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-500 font-mono gap-1">
                <div className="flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-emerald-700" /> Confidential Computer-Generated Pay Slip • Nawaz Traders HR & Payroll Engine
                </div>
                <div>Document Ref: {payrollData.voucherNo || 'SAL-2026'} • Page 1 of 1</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


