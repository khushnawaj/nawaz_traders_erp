'use client';

import { Wheat, Sparkles, ShieldCheck } from 'lucide-react';

/**
 * Ultra-Premium Futuristic Loader Component for Nawaz Traders ERP.
 * Features multi-layered glowing orbit rings, 3D grain emblem, shimmer progress line, and glassmorphism.
 */
export default function Loader({ 
  text = 'Loading Nawaz Traders ERP...', 
  subtext = 'Synchronizing mandi rates, grain inventory & ledger accounts',
  size = 'md', 
  fullScreen = false,
  className = '' 
}) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32',
  };

  const badgeSize = {
    sm: 'w-5 h-5 text-[10px]',
    md: 'w-10 h-10 text-xs',
    lg: 'w-14 h-14 text-sm',
    xl: 'w-18 h-18 text-base',
  };

  const containerPadding = {
    sm: 'p-4',
    md: 'p-8',
    lg: 'p-12',
    xl: 'p-16',
  };

  const content = (
    <div className={`flex flex-col items-center justify-center text-center space-y-5 animate-in fade-in zoom-in-95 duration-300 ${className}`}>
      {/* Futuristic Orbit Ring Loader */}
      <div className="relative flex items-center justify-center">
        {/* Ambient Pulsing Glow Light */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-500 via-amber-400 to-emerald-600 blur-2xl opacity-50 animate-pulse" />

        {/* Outer Rotating Gradient Ring */}
        <div className={`${sizeClasses[size || 'md']} rounded-full p-0.5 bg-gradient-to-r from-emerald-500 via-amber-400 via-teal-400 to-emerald-600 animate-spin shadow-2xl`}>
          <div className="w-full h-full bg-slate-950/80 rounded-full backdrop-blur-md" />
        </div>

        {/* Inner Counter-Rotating Dash Ring */}
        <div className="absolute inset-1.5 rounded-full border-2 border-dashed border-amber-400/80 border-t-transparent border-l-transparent animate-spin-reverse" />

        {/* Third Inner Accent Ring */}
        <div className="absolute inset-3 rounded-full border border-emerald-400/40 border-b-transparent animate-ping opacity-30" />

        {/* Center Floating Grain Badge */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`${badgeSize[size || 'md']} rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-emerald-500 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/20 border border-white/20 animate-bounce`}>
            <Wheat className="w-1/2 h-1/2 text-slate-950" />
          </div>
        </div>
      </div>

      {/* Text & Shimmer Progress Bar */}
      {text && (
        <div className="space-y-2.5 max-w-sm">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white tracking-wide flex items-center justify-center gap-2">
              <span>{text}</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" />
            </h3>

            {subtext && (
              <p className="text-xs text-slate-500 dark:text-slate-400 font-normal leading-relaxed">
                {subtext}
              </p>
            )}
          </div>

          {/* Shimmering Progress Line */}
          <div className="w-48 h-1 mx-auto bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden relative">
            <div className="absolute inset-y-0 left-0 w-2/3 bg-gradient-to-r from-emerald-500 via-amber-400 via-teal-400 to-emerald-500 rounded-full animate-shimmer" />
          </div>
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 dark:bg-slate-950/90 backdrop-blur-2xl p-4">
        <div className="glass-card p-8 sm:p-12 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-2xl max-w-md w-full text-center relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full flex items-center justify-center ${containerPadding[size] || 'p-8'}`}>
      <div className="glass-card p-6 sm:p-10 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-xl max-w-md w-full text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        {content}
      </div>
    </div>
  );
}

/**
 * Small inline spinner for buttons & input triggers
 */
export function ButtonLoader({ className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white border-r-white animate-spin" />
    </span>
  );
}
