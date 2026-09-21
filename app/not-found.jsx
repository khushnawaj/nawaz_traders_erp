'use client';

import Link from 'next/link';
import { FileQuestion, Home, ArrowLeft, Wheat, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4 sm:p-6 text-center">
      <div className="max-w-md w-full glass-card p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        
        {/* Icon Badge */}
        <div className="w-16 h-16 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center mx-auto border border-amber-500/20 shadow-sm">
          <FileQuestion className="w-8 h-8" />
        </div>

        {/* Text Content */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono font-extrabold uppercase text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
            Error 404 • Page Not Found
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-outfit pt-1">
            Looking for something?
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-normal leading-relaxed">
            The page or record you are trying to access does not exist or may have been moved within the ERP system.
          </p>
        </div>

        {/* Quick Action Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white px-5 py-2.5 rounded-2xl text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all font-outfit"
          >
            <Home className="w-4 h-4" /> Go to Dashboard
          </Link>
          <button
            onClick={() => window.history.back()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-5 py-2.5 rounded-2xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all font-outfit border border-slate-200/80 dark:border-slate-700"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
        </div>

        <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-400 font-outfit flex items-center justify-center gap-1.5">
          <Wheat className="w-3.5 h-3.5 text-amber-500" />
          <span>Nawaz Traders ERP System</span>
        </div>
      </div>
    </div>
  );
}
