'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Wheat } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppDispatch } from '@/lib/redux/hooks';
import { setUser } from '@/lib/redux/slices/authSlice';

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState({
    username: 'admin',
    password: 'admin123',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'Login failed');
      }

      if (json.user) {
        dispatch(setUser(json.user));
      }

      toast.success(`Welcome back, ${json.user?.fullName || 'Admin'}! 👋`);
      router.push('/');
      router.refresh();
    } catch (err) {
      toast.error(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
      <div className="max-w-md w-full relative z-10 space-y-6">
        {/* Brand Logo & Header */}
        <div className="text-center space-y-2 flex flex-col items-center justify-center">
          <img
            src="/images/nawaz-traders-brand-logo.jpg"
            alt="Nawaz Traders Logo"
            className="w-20 h-20 object-contain rounded-2xl mix-blend-multiply dark:mix-blend-screen shadow-sm"
          />
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight font-outfit">
              NAWAZ TRADERS
            </h1>
            <p className="text-[10px] font-bold tracking-widest text-emerald-600 dark:text-emerald-400 uppercase font-outfit mt-0.5">
              GRAINS TODAY • A STRONGER TOMORROW
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="glass-card p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Sign In to Your Account</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Enter your credentials to access the ERP dashboard</p>
          </div>

          {/* Quick Demo Credentials Banner */}
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Demo Account Loaded</span>
            </div>
            <span className="text-[11px] font-mono text-emerald-900 dark:text-emerald-200 font-bold bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-700">
              admin / admin123
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Input */}
            <div>
              <label className="app-label">
                Username or Email
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="admin"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="app-input app-input-with-icon"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="app-label">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="app-input app-input-with-icon pr-10"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50 mt-2 cursor-pointer"
            >
              {loading ? (
                'Signing in...'
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="text-center pt-2 border-t border-slate-200 dark:border-slate-800/80">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-amber-600 dark:text-amber-400 hover:underline font-bold">
                Create Staff Account
              </Link>
            </p>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-[11px] text-center text-slate-500 dark:text-slate-500">
          © 2026 Nawaz Traders — Secure Financial ERP System
        </p>
      </div>
    </div>
  );
}

