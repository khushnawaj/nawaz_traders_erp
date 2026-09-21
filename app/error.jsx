'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, RefreshCw, Home, Copy, Check, ShieldAlert, Wheat } from 'lucide-react';
import Link from 'next/link';

export default function ErrorPage({ error, reset }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    console.error('Application Error Encountered:', error);
  }, [error]);

  const handleCopyError = () => {
    if (error?.message) {
      navigator.clipboard.writeText(error.message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4 sm:p-6 text-center">
      <div className="max-w-lg w-full glass-card p-6 sm:p-8 rounded-3xl border border-rose-500/30 shadow-2xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Icon Badge */}
        <div className="w-16 h-16 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mx-auto border border-rose-500/20 shadow-md">
          <ShieldAlert className="w-8 h-8" />
        </div>

        {/* Header Text */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono font-extrabold uppercase text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20 font-outfit">
            System Error Trapped
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-outfit pt-1">
            An Unexpected Exception Occurred
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 font-normal leading-relaxed">
            The ERP system caught this error safely to protect your database transactions.
          </p>
        </div>

        {/* Error Trace Display */}
        {error?.message && (
          <div className="relative group">
            <div className="p-3.5 bg-slate-950 text-rose-300 rounded-2xl text-xs font-mono text-left overflow-x-auto border border-rose-900/40 shadow-inner max-h-40">
              <span className="text-[10px] text-slate-500 block pb-1 border-b border-slate-800 font-sans font-semibold">
                Trace details:
              </span>
              <p className="pt-1.5 whitespace-pre-wrap leading-relaxed">{error.message}</p>
            </div>
            <button
              onClick={handleCopyError}
              className="absolute top-2.5 right-2.5 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-mono flex items-center gap-1 transition"
              title="Copy error message"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        )}

        {/* Recovery Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white px-6 py-3 rounded-2xl text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all font-outfit"
          >
            <RefreshCw className="w-4 h-4" /> Reset Module & Try Again
          </button>
          
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-6 py-3 rounded-2xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all font-outfit border border-slate-200/80 dark:border-slate-700"
          >
            <Home className="w-4 h-4 text-amber-500" /> Return to Dashboard
          </Link>
        </div>

        <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800/80 text-[11px] text-slate-400 font-outfit flex items-center justify-center gap-1.5">
          <Wheat className="w-3.5 h-3.5 text-amber-500" />
          <span>Nawaz Traders ERP • Secure Error Recovery</span>
        </div>
      </div>
    </div>
  );
}
