'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Wheat } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
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
      {/* Background Decorative Gradient Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[450px] h-[450px] bg-emerald-600/10 dark:bg-emerald-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[450px] h-[450px] bg-amber-500/10 dark:bg-amber-500/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-md w-full relative z-10 space-y-6">
        {/* Brand Logo & Header */}
        <div className="text-center space-y-3 flex flex-col items-center justify-center">
          <img
            src="/images/nawaz-traders-stacked.png"
            alt="Nawaz Traders Logo — Grains Today, A Stronger Tomorrow"
            className="w-48 h-auto object-contain drop-shadow-xl"
          />
          <p className="text-[11px] font-extrabold tracking-widest text-amber-600 dark:text-amber-400 uppercase">
            GRAINS TODAY • A STRONGER TOMORROW
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-emerald-500/20 shadow-2xl space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Sign In to Your Account</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Enter your credentials to access the ERP dashboard</p>
          </div>

          {/* Quick Demo Credentials Banner */}
          <div className="p-3 bg-emerald-500/10 dark:bg-emerald-950/60 border border-emerald-500/20 dark:border-emerald-800/40 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
              <ShieldCheck className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <span>Demo Account Loaded</span>
            </div>
            <span className="text-[11px] font-mono text-amber-700 dark:text-amber-300 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
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
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-950/20 transition flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
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
              Don't have an account?{' '}
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

