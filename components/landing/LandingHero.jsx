'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Wheat, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  TrendingUp, 
  Warehouse, 
  CheckCircle2,
  Share2,
  Zap,
  Coins
} from 'lucide-react';
import { useAppDispatch } from '@/lib/redux/hooks';
import { setUser } from '@/lib/redux/slices/authSlice';
import toast from 'react-hot-toast';

export default function LandingHero() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [loggingInDemo, setLoggingInDemo] = useState(false);

  // 1-Click Demo Login without typing passwords
  const handleLaunchDemo = async () => {
    setLoggingInDemo(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'owner', password: 'owner123' }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Demo login failed');

      dispatch(setUser(json.user));
      toast.success('🎉 Welcome! Live ERP Demo Activated.');
      router.push('/');
      router.refresh();
    } catch (err) {
      toast.error('Redirecting to sign-in page...');
      router.push('/login');
    } finally {
      setLoggingInDemo(false);
    }
  };

  return (
    <section className="relative overflow-hidden pt-4 pb-12 sm:pb-16 lg:pb-20">
      {/* Background Glow Blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[750px] bg-gradient-to-tr from-emerald-500/25 via-amber-500/20 to-teal-500/20 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* Top Tagline Pill */}
        <div className="flex flex-col items-center text-center space-y-6 font-outfit">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 text-emerald-400 border-2 border-emerald-500/50 text-xs font-black tracking-wider uppercase shadow-2xl">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>GRAINS TODAY • A STRONGER TOMORROW</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-950 dark:text-white tracking-tight leading-tight max-w-4xl">
            Precision Grain Procurement &{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-500">
              Mandi ERP Management
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-slate-800 dark:text-slate-200 max-w-2xl font-semibold leading-relaxed">
            All-in-one Enterprise ERP for Krishi Upaj Mandi traders. Seamlessly manage Paddy & Wheat weighment slips, Palledari pay, multi-godown inventory, Rice Mill ledgers, and Capital Investors.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {/* 1-CLICK DEMO BUTTON (NO LOGIN REQUIRED) */}
            <button
              onClick={handleLaunchDemo}
              disabled={loggingInDemo}
              className="inline-flex items-center gap-2.5 px-6 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-black text-sm sm:text-base shadow-2xl shadow-amber-500/30 transition transform hover:-translate-y-0.5 disabled:opacity-50"
            >
              <Zap className="w-5 h-5 fill-current text-slate-950" />
              <span>{loggingInDemo ? 'Opening ERP Demo...' : 'Explore Live ERP (No Password Required)'}</span>
            </button>

            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm sm:text-base shadow-xl shadow-emerald-600/30 transition transform hover:-translate-y-0.5 font-outfit"
            >
              <span>Sign In to ERP</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm border-2 border-slate-700 shadow-md transition transform hover:-translate-y-0.5 font-outfit"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Create Account</span>
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4 text-xs font-black font-outfit">
            <div className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-slate-900 text-emerald-400 border border-slate-800 shadow-md">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Zero Floating-Point Math Errors</span>
            </div>
            <div className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-slate-900 text-amber-400 border border-slate-800 shadow-md">
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              <span>Printable Mandi Parchis</span>
            </div>
            <div className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-slate-900 text-emerald-400 border border-slate-800 shadow-md">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Double-Entry Party Ledgers</span>
            </div>
          </div>
        </div>

        {/* Floating Glassmorphism Hero Preview Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 font-outfit">
          {/* Card 1: Weighment Slip Widget */}
          <div className="bg-slate-900 text-white p-6 rounded-3xl border-2 border-slate-800 shadow-2xl space-y-4 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
                <Wheat className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-black uppercase text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded-xl border border-emerald-500/30">
                Voucher #PUR-8902
              </span>
            </div>

            <div>
              <h3 className="text-base font-black text-white">Crop Procurement Receipt</h3>
              <p className="text-xs text-slate-300 font-semibold mt-0.5">Ramesh Kumar (Sehore Village)</p>
            </div>

            <div className="p-3.5 bg-slate-950 text-white rounded-2xl space-y-2 border border-slate-800 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Commodity:</span>
                <span className="font-bold text-white">Paddy (धान - Kranti)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Net Weight:</span>
                <span className="font-bold text-amber-400">142.50 Quintals (285 Bags)</span>
              </div>
              <div className="flex justify-between pt-1.5 border-t border-slate-800">
                <span className="text-slate-400">Net Payable:</span>
                <span className="font-extrabold text-emerald-400 font-mono text-sm">₹3,27,750.00</span>
              </div>
            </div>
          </div>

          {/* Card 2: Live Stock & Godown Indicator */}
          <div className="bg-slate-900 text-white p-6 rounded-3xl border-2 border-slate-800 shadow-2xl space-y-4 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
                <Warehouse className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-black uppercase text-amber-400 bg-amber-500/20 px-2.5 py-1 rounded-xl border border-amber-500/30">
                Live Capacity
              </span>
            </div>

            <div>
              <h3 className="text-base font-black text-white">Main Mandi Godown #1</h3>
              <p className="text-xs text-slate-300 font-semibold mt-0.5">Krishi Upaj Mandi Shed A</p>
            </div>

            <div className="space-y-2 pt-1">
              <div className="flex justify-between text-xs font-extrabold text-white">
                <span>Storage Occupancy</span>
                <span className="text-emerald-400 font-mono">1,450 MT / 2,000 MT (72%)</span>
              </div>
              <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-amber-500 rounded-full w-[72%]" />
              </div>
              <p className="text-[11px] text-slate-400 font-bold">Paddy: 920 MT • Wheat: 530 MT</p>
            </div>
          </div>

          {/* Card 3: Capital & Investor Desk Preview */}
          <div className="bg-slate-900 text-white p-6 rounded-3xl border-2 border-slate-800 shadow-2xl space-y-4 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-2xl border border-blue-500/30">
                <Coins className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-black uppercase text-blue-400 bg-blue-500/20 px-2.5 py-1 rounded-xl border border-blue-500/30">
                Capital Desk
              </span>
            </div>

            <div>
              <h3 className="text-base font-black text-white">Investors & Bank Loans</h3>
              <p className="text-xs text-slate-300 font-semibold mt-0.5">Capital Shares, Interest & EMI Terms</p>
            </div>

            <div className="p-3.5 bg-slate-950 text-white rounded-2xl flex items-center justify-between border border-slate-800 text-xs">
              <div>
                <span className="text-xs font-bold text-white block">Active Loans & Equity</span>
                <span className="text-[11px] text-emerald-400 font-mono">15.0% Profit Share • 9.5% p.a. EMI</span>
              </div>
              <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
                <Share2 className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
