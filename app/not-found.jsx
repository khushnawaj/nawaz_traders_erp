'use client';

import './globals.css';
import Link from 'next/link';
import { FileQuestion, Home, ArrowLeft, Wheat, Users, Building2, ShoppingBag, Truck } from 'lucide-react';

export default function NotFound() {
  return (
    <div 
      className="min-h-[80vh] flex items-center justify-center p-4 sm:p-6 text-center"
      style={{ backgroundColor: 'var(--background, #020617)', color: 'var(--foreground, #f8fafc)' }}
    >
      <div 
        className="max-w-lg w-full p-8 rounded-3xl border shadow-2xl space-y-6 relative overflow-hidden"
        style={{
          background: 'rgba(15, 23, 42, 0.95)',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          color: '#ffffff',
        }}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        
        {/* Icon Badge */}
        <div 
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto border shadow-sm"
          style={{ background: 'rgba(245, 158, 11, 0.15)', borderColor: 'rgba(245, 158, 11, 0.3)', color: '#f59e0b' }}
        >
          <FileQuestion className="w-8 h-8 text-amber-400" />
        </div>

        {/* Text Content */}
        <div className="space-y-2">
          <span 
            className="text-[11px] font-mono font-bold uppercase px-3 py-1 rounded-full border inline-block"
            style={{ background: 'rgba(245, 158, 11, 0.15)', borderColor: 'rgba(245, 158, 11, 0.3)', color: '#fbbf24' }}
          >
            Error 404 • Page or Record Not Found
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-outfit pt-1 text-white">
            Looking for something in Nawaz Traders ERP?
          </h2>
          <p className="text-xs text-slate-300 font-normal leading-relaxed">
            The page, voucher, or party profile you are looking for does not exist or may have been updated.
          </p>
        </div>

        {/* Quick Module Shortcuts Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs pt-2">
          <Link
            href="/farmers"
            className="p-2.5 rounded-xl border border-slate-700/60 bg-slate-900/80 hover:bg-slate-800 text-slate-200 transition flex items-center justify-center gap-2 text-center"
          >
            <Wheat className="w-3.5 h-3.5 text-amber-400" /> Farmers Directory
          </Link>

          <Link
            href="/parties"
            className="p-2.5 rounded-xl border border-slate-700/60 bg-slate-900/80 hover:bg-slate-800 text-slate-200 transition flex items-center justify-center gap-2 text-center"
          >
            <Users className="w-3.5 h-3.5 text-emerald-400" /> Parties & Udhaar
          </Link>

          <Link
            href="/sales"
            className="p-2.5 rounded-xl border border-slate-700/60 bg-slate-900/80 hover:bg-slate-800 text-slate-200 transition flex items-center justify-center gap-2 text-center"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-blue-400" /> Sales Vouchers
          </Link>

          <Link
            href="/purchases"
            className="p-2.5 rounded-xl border border-slate-700/60 bg-slate-900/80 hover:bg-slate-800 text-slate-200 transition flex items-center justify-center gap-2 text-center"
          >
            <Wheat className="w-3.5 h-3.5 text-emerald-400" /> Crop Purchases
          </Link>
        </div>

        {/* Quick Action Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-2xl text-xs font-semibold shadow-lg transition-all font-outfit"
          >
            <Home className="w-4 h-4" /> Go to Dashboard
          </Link>
          <button
            onClick={() => window.history.back()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-800 text-slate-200 px-6 py-2.5 rounded-2xl text-xs font-semibold hover:bg-slate-700 transition-all font-outfit border border-slate-700"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
        </div>

        <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 font-outfit flex items-center justify-center gap-1.5">
          <Wheat className="w-3.5 h-3.5 text-amber-500" />
          <span>Nawaz Traders ERP • Krishi Upaj Mandi, Sehore</span>
        </div>
      </div>
    </div>
  );
}
