'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  ShoppingBag, 
  ArrowLeft, 
  Printer, 
  Wheat, 
  User, 
  Warehouse, 
  Calendar, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  CreditCard,
  FileText,
  Building2,
  Phone,
  Scale
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function PurchaseDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [purchase, setPurchase] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPurchaseDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/purchases/${id}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch purchase');

      setPurchase(json.data);
    } catch (err) {
      toast.error(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchPurchaseDetails();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm(`Delete purchase voucher "${purchase?.purchaseNo}"?`)) return;

    try {
      const res = await fetch(`/api/purchases/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to delete purchase');

      toast.success('Purchase voucher deleted');
      router.push('/purchases');
    } catch (err) {
      toast.error(`❌ ${err.message}`);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-slate-500 font-bold">
        Loading crop purchase voucher...
      </div>
    );
  }

  if (!purchase) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center space-y-4">
        <ShoppingBag className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Purchase Record Not Found</h2>
        <Link href="/purchases" className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Purchases Directory
        </Link>
      </div>
    );
  }

  const item = purchase.items?.[0];
  const commodityName = item?.commodity?.localName || item?.commodity?.name || 'Grain / Crop';
  const unitCode = item?.unit?.code || 'QTL';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6 print:p-0 print:max-w-none">
      {/* Top Action Bar (Hidden when printing) */}
      <div className="flex items-center justify-between print:hidden">
        <Link
          href="/purchases"
          className="inline-flex items-center gap-2 text-xs font-extrabold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Purchases Directory
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-700 hover:from-emerald-600 hover:to-emerald-500 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-emerald-950/20 transition-all transform hover:-translate-y-0.5"
          >
            <Printer className="w-4 h-4 text-amber-300" /> Print Purchase Slip (प्रिंट करें)
          </button>

          <button
            onClick={handleDelete}
            className="px-3.5 py-2.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-extrabold flex items-center gap-1.5 transition"
            title="Delete Purchase Voucher"
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      </div>

      {/* Printable Crop Purchase Voucher Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden text-slate-900 dark:text-white print-invoice-card print:border-none print:shadow-none print:bg-white print:text-black">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white p-6 sm:p-8 border-b-4 border-amber-400 print:bg-none print:bg-white print:text-black print:border-b-2 print:border-black">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img
                src="/images/nawaz-traders-stacked.png"
                alt="Nawaz Traders Logo"
                className="h-16 sm:h-20 object-contain rounded-2xl bg-white/10 p-2 border border-white/20 shrink-0 print:border-none print:p-0 print:bg-transparent print:h-16"
              />
              <div>
                <div className="text-2xl sm:text-3xl font-black text-white tracking-tight print:text-black">
                  NAWAZ TRADERS
                </div>
                <div className="text-xs font-black tracking-widest text-amber-400 print:text-gray-700">
                  GRAINS TODAY • A STRONGER TOMORROW
                </div>
                <div className="text-[11px] text-emerald-200/90 print:text-gray-600 mt-1">
                  Krishi Upaj Mandi, Sehore (M.P.) - 466001 | Mandi Lic: NT-MP-2026 | Ph: +91 94250 98765
                </div>
              </div>
            </div>

            <div className="text-left sm:text-right bg-white/10 dark:bg-slate-900/60 p-4 rounded-2xl border border-white/15 backdrop-blur-md shrink-0 print:bg-gray-100 print:border-gray-300 print:text-black">
              <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 mb-1">
                CROP PURCHASE VOUCHER
              </span>
              <div className="text-xl font-black text-white print:text-black">{purchase.purchaseNo}</div>
              <div className="text-xs text-emerald-200 font-bold print:text-gray-700">
                Date: {new Date(purchase.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </div>
              <div className="mt-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase ${
                    purchase.paymentStatus === 'PAID'
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                      : purchase.paymentStatus === 'PARTIAL'
                      ? 'bg-amber-400 text-slate-950 border-amber-300'
                      : 'bg-rose-500 text-white border-rose-400'
                  }`}
                >
                  Status: {purchase.paymentStatus}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Farmer & Storage Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs print:bg-gray-50 print:border-gray-300">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 mb-2 print:border-gray-300">
                <span className="text-[10px] font-extrabold uppercase text-emerald-700 dark:text-emerald-400 tracking-wider flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-amber-500" /> Farmer Information (किसान विवरण)
                </span>
                <span className="text-[10px] font-bold text-slate-400">Code: {purchase.party?.partyCode}</span>
              </div>

              <div className="text-base font-black text-slate-900 dark:text-white print:text-black">
                {purchase.party?.name}
              </div>

              {purchase.party?.phone && (
                <div className="text-slate-600 dark:text-slate-400 font-semibold flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-amber-500" /> Phone: {purchase.party.phone}
                </div>
              )}

              {purchase.party?.address && (
                <div className="text-slate-600 dark:text-slate-400">
                  Address: {purchase.party.address} {purchase.party.city ? `, ${purchase.party.city}` : ''}
                </div>
              )}
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs print:bg-gray-50 print:border-gray-300">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 mb-2 print:border-gray-300">
                <span className="text-[10px] font-extrabold uppercase text-amber-600 dark:text-amber-400 tracking-wider flex items-center gap-1">
                  <Warehouse className="w-3.5 h-3.5" /> Storage & Unloading Location
                </span>
                <span className="text-[10px] font-bold text-slate-400">{purchase.godown?.code}</span>
              </div>

              <div className="font-extrabold text-slate-900 dark:text-white print:text-black">
                Unloaded At: <span className="font-black text-emerald-700 dark:text-emerald-400">{purchase.godown?.name}</span>
              </div>

              {purchase.promisedDate && (
                <div className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1.5 pt-1">
                  📅 Promised Payment Date: {new Date(purchase.promisedDate).toLocaleDateString('en-IN')}
                </div>
              )}
            </div>
          </div>

          {/* Itemized Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800 print:border-gray-300">
            <table className="w-full text-left text-xs">
              <thead className="bg-emerald-950 text-white font-black uppercase text-[11px] print:bg-gray-200 print:text-black">
                <tr>
                  <th className="p-3.5">#</th>
                  <th className="p-3.5">Crop / Grain Description</th>
                  <th className="p-3.5 text-right">Procured Quantity</th>
                  <th className="p-3.5 text-right">Rate / Unit</th>
                  <th className="p-3.5 text-right">Gross Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-900 dark:text-white font-semibold print:divide-gray-300 print:text-black">
                <tr>
                  <td className="p-3.5 font-bold text-slate-400">01</td>
                  <td className="p-3.5">
                    <span className="font-black text-sm text-emerald-700 dark:text-emerald-400 print:text-black block">
                      {commodityName}
                    </span>
                    <span className="text-[10px] text-slate-400">Farmer Mandi Crop Procurement</span>
                  </td>
                  <td className="p-3.5 text-right font-black text-sm">
                    {parseFloat(item?.displayQuantity || 0).toFixed(2)} {unitCode}
                  </td>
                  <td className="p-3.5 text-right font-bold text-sm">
                    ₹{parseFloat(item?.ratePerUnit || 0).toFixed(2)}
                  </td>
                  <td className="p-3.5 text-right font-black text-sm text-slate-900 dark:text-white print:text-black">
                    {formatCurrency(purchase.grossAmount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Calculations Box */}
          <div className="flex justify-end pt-2">
            <div className="w-full sm:w-80 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400 font-bold">
                <span>Gross Crop Value:</span>
                <span className="font-black text-slate-900 dark:text-white print:text-black">{formatCurrency(purchase.grossAmount)}</span>
              </div>

              {parseFloat(purchase.labourCharges) > 0 && (
                <div className="flex justify-between text-amber-600 dark:text-amber-400 font-bold">
                  <span>+ Palledari / Labour Pay:</span>
                  <span className="font-black">+₹{parseFloat(purchase.labourCharges).toFixed(2)}</span>
                </div>
              )}

              {parseFloat(purchase.gstAmount) > 0 && (
                <div className="flex justify-between text-slate-600 dark:text-slate-400 font-bold">
                  <span>+ GST / Mandi Tax:</span>
                  <span className="font-black">+₹{parseFloat(purchase.gstAmount).toFixed(2)}</span>
                </div>
              )}

              {parseFloat(purchase.totalDeductions) > 0 && (
                <div className="flex justify-between text-rose-600 dark:text-rose-400 font-bold">
                  <span>- Deductions (Moisture/Bags):</span>
                  <span className="font-black">-₹{parseFloat(purchase.totalDeductions).toFixed(2)}</span>
                </div>
              )}

              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950 to-slate-900 text-white flex justify-between items-center shadow-lg print:bg-gray-200 print:text-black">
                <div>
                  <div className="text-[10px] font-black uppercase text-amber-400 print:text-gray-700">Total Purchase Voucher Bill</div>
                  <div className="text-xl font-black text-emerald-400 print:text-black">
                    {formatCurrency(purchase.netAmount)}
                  </div>
                </div>
              </div>

              <div className="flex justify-between text-slate-600 dark:text-slate-400 pt-1 font-bold">
                <span>Advance Paid:</span>
                <span className="font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(purchase.paidAmount)}</span>
              </div>

              <div className="flex justify-between font-black text-rose-600 dark:text-rose-400 border-t border-slate-200 dark:border-slate-800 pt-2 text-sm">
                <span>Farmer Payable Dues:</span>
                <span>{formatCurrency(purchase.dueAmount)}</span>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-10 grid grid-cols-2 gap-8 text-xs font-bold text-center">
            <div className="border-t-2 border-slate-300 dark:border-slate-700 print:border-black pt-2 text-slate-700 dark:text-slate-300 print:text-black">
              Farmer / Seller Signature
            </div>

            <div className="border-t-2 border-slate-300 dark:border-slate-700 print:border-black pt-2 text-slate-900 dark:text-white print:text-black flex flex-col items-center">
              <div className="w-16 h-16 rounded-full border-2 border-emerald-600/30 flex items-center justify-center text-[9px] font-black text-emerald-700 dark:text-emerald-400 uppercase mb-1 print:border-black print:text-black">
                OFFICIAL SEAL
              </div>
              <span>Authorized Signatory (Nawaz Traders)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
