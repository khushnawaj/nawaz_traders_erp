'use client';

import './globals.css';
import { RefreshCw, ShieldAlert, Home } from 'lucide-react';

export default function GlobalError({ error, reset }) {
  return (
    <html lang="en">
      <body className="h-full antialiased bg-slate-950 text-white flex items-center justify-center p-4 font-sans">
        <div className="max-w-lg w-full glass-modal p-6 sm:p-8 rounded-3xl border border-rose-500/30 shadow-2xl text-center space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center mx-auto border border-rose-500/20 shadow-md">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-mono font-extrabold uppercase text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20 font-outfit">
              Fatal Layout Exception
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white font-outfit pt-1">
              Global Application Error
            </h2>
            <p className="text-xs text-slate-300 font-normal leading-relaxed">
              An unexpected system exception occurred. Click below to reload the application interface.
            </p>
            {error?.message && (
              <div className="p-3 bg-slate-900 text-rose-300 rounded-2xl text-xs font-mono text-left overflow-x-auto border border-rose-900/40 shadow-inner max-h-32">
                {error.message}
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => reset()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white px-6 py-3 rounded-2xl text-xs font-bold shadow-lg shadow-emerald-900/20 transition-all font-outfit"
            >
              <RefreshCw className="w-4 h-4" /> Reload System Interface
            </button>
            <a
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-800 text-slate-200 px-6 py-3 rounded-2xl text-xs font-bold hover:bg-slate-700 transition-all font-outfit border border-slate-700"
            >
              <Home className="w-4 h-4 text-amber-400" /> Go to Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
