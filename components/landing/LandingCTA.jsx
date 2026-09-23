'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, ShieldCheck, Zap } from 'lucide-react';
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
      toast.success('Live ERP Demo Activated.');
      router.push('/');
      router.refresh();
    } catch (err) {
      router.push('/login');
    } finally {
      setLoggingInDemo(false);
    }
  };

  return (
    <section className="py-8 font-outfit">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="p-8 sm:p-10 rounded-2xl bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm border border-slate-800">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Ready to Modernize Your Grain Trading?
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-normal max-w-lg">
              Launch the interactive demo desk instantly or sign in with your staff credentials.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
            <button
              onClick={handleLaunchDemo}
              disabled={loggingInDemo}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>{loggingInDemo ? 'Opening Demo...' : 'Explore Live Demo'}</span>
            </button>

            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs sm:text-sm border border-slate-700 transition"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Sign In</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
