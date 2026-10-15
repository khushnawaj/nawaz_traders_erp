'use client';

import { useState, useEffect } from 'react';
import { Wheat, Sparkles, Server, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';

export default function ServerWarmupLoader() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);
  const [progress, setProgress] = useState(12);
  const [statusMessage, setStatusMessage] = useState('Connecting to server...');
  const [isColdBoot, setIsColdBoot] = useState(false);

  useEffect(() => {
    // Check if the user already saw the startup loader in this browsing session
    const hasLoaded = sessionStorage.getItem('nt_startup_loaded');
    if (hasLoaded === 'true') {
      setVisible(false);
      return;
    }

    let progressInterval;
    let isMounted = true;
    let attempts = 0;

    // Simulate natural progressive ramp-up while actively pinging /api/health
    progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 40) return prev + 4;
        if (prev < 70) return prev + 2;
        if (prev < 90) return prev + 1;
        return prev;
      });
    }, 150);

    // Timeout trigger for cold boot detection (Render spinning up from sleep)
    const coldBootTimer = setTimeout(() => {
      if (isMounted) {
        setIsColdBoot(true);
        setStatusMessage('Waking up cloud server instance... thank you for your patience');
      }
    }, 4000);

    // Active health ping loop
    const pingServer = async () => {
      try {
        attempts++;
        if (attempts === 1) {
          setStatusMessage('Checking server health & database...');
        } else if (attempts === 2) {
          setStatusMessage('Synchronizing grain projects & mandi ledgers...');
        }

        const res = await fetch('/api/health', { cache: 'no-store' });
        if (res.ok && isMounted) {
          clearInterval(progressInterval);
          clearTimeout(coldBootTimer);
          setProgress(100);
          setStatusMessage('Your website is ready! Launching...');
          
          setTimeout(() => {
            if (isMounted) {
              setFading(true);
              sessionStorage.setItem('nt_startup_loaded', 'true');
              setTimeout(() => {
                if (isMounted) setVisible(false);
              }, 600);
            }
          }, 450);
          return;
        }
      } catch (err) {
        // Server still booting up (e.g. Render cold start)
      }

      // Retry ping every 1.5 seconds if not yet connected
      if (isMounted) {
        setTimeout(pingServer, 1500);
      }
    };

    pingServer();

    return () => {
      isMounted = false;
      clearInterval(progressInterval);
      clearTimeout(coldBootTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-xl px-4 transition-opacity duration-700 ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background Decorative Ambient Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-gradient-to-tr from-emerald-600/20 via-amber-500/15 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md mx-auto p-7 sm:p-9 rounded-3xl bg-slate-900/90 border border-emerald-500/30 shadow-2xl shadow-emerald-950/60 text-center flex flex-col items-center">
        {/* Animated Glowing Logo Orbit */}
        <div className="relative mb-6 flex items-center justify-center">
          {/* Ambient Glow */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-500 via-amber-400 to-emerald-600 blur-xl opacity-60 animate-pulse" />

          {/* Outer Rotating Gradient Ring */}
          <div className="w-20 h-20 rounded-full p-0.5 bg-gradient-to-r from-emerald-500 via-amber-400 via-teal-400 to-emerald-500 animate-spin shadow-2xl">
            <div className="w-full h-full bg-slate-950 rounded-full" />
          </div>

          {/* Inner Counter-Rotating Dash Ring */}
          <div className="absolute inset-2 rounded-full border-2 border-dashed border-amber-400/70 border-t-transparent animate-spin-reverse" />

          {/* Center Floating Grain Emblem */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-emerald-500 text-slate-950 flex items-center justify-center shadow-lg border border-white/20">
              <Wheat className="w-6 h-6 text-slate-950 animate-bounce" />
            </div>
          </div>
        </div>

        {/* Brand Titles */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold tracking-widest uppercase font-outfit mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Nawaz Traders ERP
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-white font-outfit tracking-tight">
          Please wait a moment...
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1.5 font-medium leading-relaxed">
          Your website is opening soon. Synchronizing services & grain projects.
        </p>

        {/* Progress Bar Container */}
        <div className="w-full mt-6 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono font-bold">
            <span className="text-emerald-400 flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              {statusMessage}
            </span>
            <span className="text-amber-400">{progress}%</span>
          </div>

          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden border border-slate-700/60 p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-400 transition-all duration-300 shadow-sm shadow-emerald-400/50"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Cold-boot reassurance banner if server takes a few moments */}
        {isColdBoot && (
          <div className="mt-4 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 font-medium leading-relaxed animate-in fade-in duration-300">
            <p className="flex items-center justify-center gap-1.5 font-bold mb-0.5 text-amber-400">
              <Server className="w-3.5 h-3.5" /> Cloud Server Warming Up
            </p>
            The hosting server was idle and is safely starting up. This only takes a moment.
          </div>
        )}

        {/* Skip / Bypass Button */}
        <button
          onClick={() => {
            sessionStorage.setItem('nt_startup_loaded', 'true');
            setFading(true);
            setTimeout(() => setVisible(false), 500);
          }}
          className="mt-6 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 transition"
        >
          <span>Open Website Directly</span>
          <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
        </button>

        {/* Trust Footer */}
        <div className="mt-5 flex items-center gap-2 text-[10px] text-slate-500 uppercase tracking-wider font-mono">
          <ShieldCheck className="w-3 h-3 text-emerald-500" />
          <span>Krishi Upaj Mandi • Sehore (M.P.)</span>
        </div>
      </div>
    </div>
  );
}
