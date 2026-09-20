'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Lock, Mail, Phone, Shield, ArrowRight, Eye, EyeOff, Wheat } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('❌ Passwords do not match!');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'Registration failed');
      }

      toast.success(
        `🎉 Signup submitted for ${json.user?.fullName}! Account is pending activation by Owner/Admin.`,
        { duration: 5000 }
      );
      router.push('/login');
    } catch (err) {
      toast.error(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300 my-6">
      {/* Background Decorative Gradient Blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[450px] h-[450px] bg-emerald-600/10 dark:bg-emerald-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[450px] h-[450px] bg-amber-500/10 dark:bg-amber-500/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-lg w-full relative z-10 space-y-6">
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

        {/* Signup Card */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-emerald-500/20 shadow-2xl space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white font-outfit">Create New Account</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Enter your basic details. Account will be activated by Owner or Admin.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name & Username */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="app-label">
                  Full Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="app-input app-input-with-icon"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="app-label">
                  Username *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ramesh_kumar"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="app-input"
                />
              </div>
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="app-label">
                  Email (Optional)
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="ramesh@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="app-input app-input-with-icon"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="app-label">
                  Mobile Number *
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    placeholder="98260XXXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="app-input app-input-with-icon"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>
            </div>



            {/* Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="app-label">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="app-input app-input-with-icon"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="app-label">
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="app-input app-input-with-icon"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>
            </div>

            {/* Toggle show password */}
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-500 dark:text-slate-400 font-medium">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={() => setShowPassword(!showPassword)}
                  className="rounded border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 text-emerald-600 focus:ring-emerald-500"
                />
                Show Passwords
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="bahi-btn-primary w-full py-3 text-sm mt-2 font-outfit"
            >
              {loading ? (
                'Submitting Account Registration...'
              ) : (
                <>
                  <span>Submit Account Registration</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="text-center pt-2 border-t border-slate-200 dark:border-slate-800/80">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Already have an active account?{' '}
              <Link href="/login" className="text-amber-600 dark:text-amber-400 hover:underline font-bold">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
