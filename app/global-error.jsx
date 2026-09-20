'use client';

import './globals.css';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function GlobalError({ error, reset }) {
  return (
    <html lang="en">
      <body className="h-full antialiased bg-slate-950 text-white flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full glass-modal p-8 rounded-3xl border border-red-500/30 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mx-auto border border-red-500/20">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-black text-white">System Error Occurred</h2>
            <p className="text-xs text-slate-400">
              An unexpected application error occurred. Click below to reload the ERP interface.
            </p>
            {error?.message && (
              <div className="p-3 bg-red-950/40 text-red-400 rounded-xl text-[11px] font-mono text-left overflow-x-auto border border-red-800/40">
                {error.message}
              </div>
            )}
          </div>

          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-6 py-2.5 rounded-2xl text-xs font-extrabold shadow-lg hover:from-emerald-500 hover:to-emerald-400 transition-all w-full"
          >
            <RefreshCw className="w-4 h-4" /> Reload System Interface
          </button>
        </div>
      </body>
    </html>
  );
}
