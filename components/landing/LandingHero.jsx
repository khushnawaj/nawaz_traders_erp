'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowRight, 
  ShieldCheck, 
  Zap,
  Wheat, 
  Warehouse, 
  Coins,
  Check
} from 'lucide-react';
import { useAppDispatch } from '@/lib/redux/hooks';
import { setUser } from '@/lib/redux/slices/authSlice';
import toast from 'react-hot-toast';

export default function LandingHero() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [loggingInDemo, setLoggingInDemo] = useState(false);

  // 1-Click Demo Login
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
      toast.success('Welcome! Live ERP Demo Activated.');
      router.push('/');
      router.refresh();
    } catch (err) {
      router.push('/login');
    } finally {
      setLoggingInDemo(false);
    }
  };

  return (
    <section className="pt-8 pb-12 sm:pb-16 font-outfit">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
        {/* Minimal Header & Hero Text */}
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>NAWAZ TRADERS ERP • KRISHI UPAJ MANDI</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Precision Grain Trading & Mandi Management
          </h1>

          <p className="text-base text-slate-600 dark:text-slate-400 font-normal leading-relaxed max-w-2xl mx-auto">
            A minimalist financial & inventory system built for Mandi grain merchants. Streamline crop purchases, Palledari charges, godown stock, and party ledgers.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handleLaunchDemo}
              disabled={loggingInDemo}
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>{loggingInDemo ? 'Loading Demo...' : 'Explore Live Demo'}</span>
            </button>

            <Link
              href="/login"
              className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold text-sm transition shadow-sm flex items-center gap-2"
            >
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Minimal Feature Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs font-medium text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-600" /> Exact Decimal Math</span>
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-600" /> Printable Slips</span>
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-600" /> Double-Entry Ledger</span>
          </div>
        </div>

        {/* Minimalist 3-Column Preview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                <Wheat className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-mono text-slate-500 font-semibold">PURCHASE VOUCHER</span>
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Crop Inward Entry</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Record weight in Quintals, Palledari charges, and farmer payable balance.</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs space-y-1.5 border border-slate-200/80 dark:border-slate-800/80 font-mono">
              <div className="flex justify-between text-slate-600 dark:text-slate-400"><span>Paddy (धान):</span><span className="font-bold text-slate-900 dark:text-white">150.00 QTL</span></div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400"><span>Rate/QTL:</span><span>₹2,200.00</span></div>
              <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-bold pt-1 border-t border-slate-200 dark:border-slate-800"><span>Net Amount:</span><span>₹3,30,000.00</span></div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                <Warehouse className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-mono text-slate-500 font-semibold">INVENTORY</span>
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Godown Stock Ledger</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Live stock tracking per grain commodity across all mandi storage sheds.</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs space-y-1.5 border border-slate-200/80 dark:border-slate-800/80 font-mono">
              <div className="flex justify-between text-slate-600 dark:text-slate-400"><span>Main Mandi Shed:</span><span className="font-bold text-emerald-600">1,450 MT</span></div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400"><span>Capacity:</span><span>2,000 MT</span></div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                <Coins className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-mono text-slate-500 font-semibold">LEDGERS</span>
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Party & Rice Mill Ledgers</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Real-time debit & credit tracking for buyers, suppliers, and investors.</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs space-y-1.5 border border-slate-200/80 dark:border-slate-800/80 font-mono">
              <div className="flex justify-between text-slate-600 dark:text-slate-400"><span>Receivables (DR):</span><span className="font-bold text-emerald-600">₹14,50,000</span></div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400"><span>Payables (CR):</span><span className="font-bold text-rose-600">₹8,20,000</span></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
