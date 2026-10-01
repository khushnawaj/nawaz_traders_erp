'use client';

import { X, Printer, Share2, CheckCircle2, Building, Phone, Calendar } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function PartyVoucherReceiptModal({ isOpen, onClose, voucher, party }) {
  if (!isOpen || !voucher || !party) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const isDebit = voucher.debit > 0;
    const typeLabel = isDebit ? 'DEBIT / UDHAAR' : 'CREDIT / JAMA';
    const amountStr = formatCurrency(isDebit ? voucher.debit : voucher.credit);
    
    const message = `*NAWAZ TRADERS - VOUCHER RECEIPT*\n*Party Name:* ${party.name}\n*Voucher No:* ${voucher.voucherNo}\n*Voucher Type:* ${voucher.voucherType}\n*Date:* ${new Date(voucher.date).toLocaleDateString('en-IN')}\n*Transaction:* ${typeLabel} - ${amountStr}\n*Running Balance:* ${formatCurrency(voucher.runningBalance)} (${voucher.balanceType === 'RECEIVABLE' ? 'DR' : 'CR'})\n*Narration:* ${voucher.narration || 'N/A'}\n\nThank you for doing business with Nawaz Traders!`;
    const cleanPhone = party.phone ? party.phone.replace(/[^0-9]/g, '') : '';
    const phoneParam = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const url = `https://wa.me/${phoneParam}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const isDebit = parseFloat(voucher.debit || 0) > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="glass-modal w-full max-w-xl rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-2xl p-6 space-y-6 relative overflow-hidden bg-white dark:bg-slate-900">
        
        {/* Modal Controls (Hidden in Print) */}
        <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-4 print:hidden">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              Voucher Receipt Slip
            </span>
            <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
              {voucher.voucherNo}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShareWhatsApp}
              className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition text-xs font-semibold flex items-center gap-1"
              title="Share on WhatsApp"
            >
              <Share2 className="w-4 h-4" /> Share
            </button>
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition text-xs font-semibold flex items-center gap-1"
              title="Print Receipt Slip"
            >
              <Printer className="w-4 h-4" /> Print
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE RECEIPT CONTAINER */}
        <div className="p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-950/50 space-y-6">
          
          {/* Header & Brand */}
          <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h1 className="text-xl font-bold text-emerald-950 dark:text-emerald-400 tracking-tight font-outfit uppercase">
                NAWAZ TRADERS
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Krishi Upaj Mandi, Sehore (M.P.) - 466001
              </p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
                GRAINS TODAY • A STRONGER TOMORROW
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs font-mono font-bold text-slate-900 dark:text-white block">
                {voucher.voucherNo}
              </span>
              <span className="text-[11px] text-slate-500 font-medium block">
                Date: {new Date(voucher.date).toLocaleDateString('en-IN')}
              </span>
              <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase border ${
                isDebit
                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-600 border-rose-500/30'
              }`}>
                {voucher.voucherType}
              </span>
            </div>
          </div>

          {/* Party Info */}
          <div className="grid grid-cols-2 gap-4 text-xs bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-medium block">Party / Customer Name</span>
              <strong className="text-slate-900 dark:text-white text-sm font-semibold block">{party.name}</strong>
              <span className="text-[10px] text-slate-500 font-mono">{party.partyCode}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-medium block">Mobile & Address</span>
              <span className="text-slate-800 dark:text-slate-200 font-medium block">{party.phone || 'N/A'}</span>
              <span className="text-[10px] text-slate-500 block truncate">{party.address || 'Sehore'}</span>
            </div>
          </div>

          {/* Transaction Amount Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <div>
                <span className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300 block">
                  {isDebit ? 'Amount Debited (Udhaar / Charge)' : 'Amount Credited (Jama / Payment Received)'}
                </span>
                <span className="text-[11px] text-slate-500 font-normal">
                  {voucher.narration || 'Voucher transaction'}
                </span>
              </div>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                {formatCurrency(isDebit ? voucher.debit : voucher.credit)}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs p-3 bg-slate-100 dark:bg-slate-900 rounded-xl">
              <span className="text-slate-500 font-medium">Running Balance After Transaction:</span>
              <span className="font-bold text-slate-900 dark:text-white font-mono">
                {formatCurrency(voucher.runningBalance)} ({voucher.balanceType === 'RECEIVABLE' ? 'DR - Lene hain' : 'CR - Dene hain'})
              </span>
            </div>
          </div>

          {/* Signatures */}
          <div className="flex items-end justify-between pt-8 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-500">
            <div className="text-center space-y-1">
              <div className="w-32 border-b border-slate-300 dark:border-slate-700 mb-1" />
              <span>Customer Signature</span>
            </div>
            <div className="text-center space-y-1">
              <div className="w-32 border-b border-slate-300 dark:border-slate-700 mb-1" />
              <span className="font-bold text-emerald-800 dark:text-emerald-400">For NAWAZ TRADERS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
