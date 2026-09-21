'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { useAppDispatch } from '@/lib/redux/hooks';
import { setUser } from '@/lib/redux/slices/authSlice';
import toast from 'react-hot-toast';

export default function LandingCTA() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [loggingInDemo, setLoggingInDemo] = useState(false);

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
    <section className="py-12 sm:py-16 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl border-2 border-emerald-500/50 shadow-2xl bg-gradient-to-tr from-emerald-950 via-slate-900 to-slate-950 text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden font-outfit">
          <div className="absolute top-0 left-0 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-3 relative z-10 max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold tracking-wider uppercase font-outfit">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>KRISHI UPAJ MANDI, SEHORE</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight text-white">
              Ready to Modernize Your Grain Trading Operations?
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 font-semibold leading-relaxed">
              Launch the interactive ERP demo desk instantly to explore live features without typing passwords, or sign in to your staff account.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 relative z-10 w-full md:w-auto">
            <button
              onClick={handleLaunchDemo}
              disabled={loggingInDemo}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 hover:from-amber-400 hover:to-emerald-300 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/30 transition transform hover:-translate-y-0.5 disabled:opacity-50"
            >
              <Zap className="w-4 h-4 text-slate-950 fill-current" />
              <span>{loggingInDemo ? 'Opening ERP Demo...' : 'Explore Live ERP (No Password)'}</span>
            </button>

            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-bold text-sm transition transform hover:-translate-y-0.5"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Sign In with Account</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
