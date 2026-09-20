'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error('Unhandled Application Error:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full glass-card p-8 rounded-3xl border border-red-500/20 shadow-2xl space-y-6">
        <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mx-auto border border-red-500/20">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            System Error Occurred
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            An unexpected error occurred while processing your transaction. The system recorded this event safely.
          </p>
          {error?.message && (
            <div className="p-3 bg-red-950/30 text-red-400 rounded-xl text-[11px] font-mono text-left overflow-x-auto border border-red-800/40">
              {error.message}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-5 py-2.5 rounded-2xl text-xs font-extrabold shadow-lg shadow-emerald-950/20 hover:from-emerald-500 hover:to-emerald-400 transition-all"
          >
            <RefreshCw className="w-4 h-4" /> Try Again
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-800 text-slate-200 px-5 py-2.5 rounded-2xl text-xs font-extrabold hover:bg-slate-700 transition-all"
          >
            <Home className="w-4 h-4" /> Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
