'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Wheat, 
  Users, 
  UserCheck, 
  Truck, 
  Warehouse, 
  ShoppingBag, 
  TrendingUp, 
  LogOut, 
  Menu, 
  X,
  Home,
  ShieldCheck,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from 'next-themes';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/farmers', label: 'Farmers (किसान)', icon: Wheat },
  { href: '/parties', label: 'Parties & Mills', icon: Users },
  { href: '/employees', label: 'Staff & Drivers', icon: UserCheck },
  { href: '/vehicles', label: 'Vehicles & Diesel', icon: Truck },
  { href: '/godowns', label: 'Godowns', icon: Warehouse },
  { href: '/purchases', label: 'Purchases', icon: ShoppingBag },
  { href: '/sales', label: 'Sales', icon: TrendingUp },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    setMounted(true);
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setUser(json.user);
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      toast.success('Signed out successfully');
      router.push('/login');
      router.refresh();
    } catch (err) {
      toast.error('Sign out failed');
    }
  };

  const currentTheme = resolvedTheme || theme;

  const toggleTheme = () => {
    setTheme(currentTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <>
      {/* Fixed Top Navigation Bar */}
      <header className="bg-white/95 dark:bg-emerald-950/90 text-slate-900 dark:text-white sticky top-0 z-50 border-b border-slate-200 dark:border-emerald-500/20 shadow-md dark:shadow-xl backdrop-blur-md transition-colors duration-200">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          {/* Logo Branding */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-900/80 text-slate-800 dark:text-white border border-slate-300 dark:border-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/50 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 shrink-0" /> : <Menu className="w-5 h-5 shrink-0" />}
            </button>

            <Link href="/" className="flex items-center gap-3 py-1">
              <img
                src="/images/nawaz-traders-icon.png"
                alt="Nawaz Traders Icon"
                className="w-10 h-10 object-contain rounded-xl shadow-md shrink-0 sm:hidden"
              />
              <img
                src={currentTheme === 'dark' ? '/images/nawaz-traders-dark.png' : '/images/nawaz-traders-primary.png'}
                alt="Nawaz Traders — Grains Today, A Stronger Tomorrow"
                className="hidden sm:block h-10 object-contain max-w-[220px] transition-all"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100 dark:bg-slate-900/60 p-1.5 rounded-2xl border border-slate-200 dark:border-white/5 backdrop-blur-md overflow-x-auto max-w-full">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-colors duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md shadow-emerald-900/40'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-300' : 'text-slate-400 dark:text-slate-400'}`} />
                  <span className="whitespace-nowrap">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Controls: Theme Switcher & User Profile */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Theme Toggle Button */}
            {mounted && (
              <button
                onClick={toggleTheme}
                title={`Switch to ${currentTheme === 'dark' ? 'Light' : 'Dark'} Mode`}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-amber-500 dark:text-amber-400 border border-slate-300 dark:border-white/10 transition-colors"
              >
                {currentTheme === 'dark' ? (
                  <Sun className="w-4 h-4 shrink-0 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 shrink-0 text-indigo-600" />
                )}
              </button>
            )}

            {/* User Profile Info & Logout */}
            {user ? (
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900/80 p-1.5 pl-3 rounded-2xl border border-slate-300 dark:border-white/10">
                <div className="hidden xl:block text-right pr-1 max-w-[140px]">
                  <div className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center justify-end gap-1 truncate" title={user.fullName}>
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-amber-500 dark:text-amber-400" />
                    <span className="truncate">{user.fullName}</span>
                  </div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold uppercase tracking-wider leading-none">
                    {user.role}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-950 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-300 dark:border-slate-700 hover:border-rose-400 dark:hover:border-rose-800 transition-colors"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-extrabold px-4 py-2 rounded-xl text-xs shadow-md shadow-amber-500/20 transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-md flex animate-in fade-in duration-150">
          <div className="w-72 bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-6 space-y-6 shadow-2xl h-full border-r border-slate-200 dark:border-emerald-500/20 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <img src="/images/nawaz-traders-icon.png" alt="NT Logo" className="w-8 h-8 object-contain shrink-0" />
                  <div>
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white block leading-tight">Nawaz Traders</span>
                    <span className="text-[9px] font-extrabold text-emerald-600 dark:text-amber-400 uppercase tracking-widest block">GRAINS TODAY</span>
                  </div>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                  <X className="w-5 h-5 shrink-0" />
                </button>
              </div>

              <nav className="space-y-1.5">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-extrabold transition-colors duration-150 ${
                        isActive
                          ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md shadow-emerald-900/40'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-300' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              {mounted && (
                <button
                  onClick={toggleTheme}
                  className="w-full py-2.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-amber-400 rounded-xl text-xs font-extrabold flex items-center justify-between transition-colors"
                >
                  <span>Theme: {currentTheme === 'dark' ? 'Dark Mode 🌙' : 'Light Mode ☀️'}</span>
                  {currentTheme === 'dark' ? <Sun className="w-4 h-4 shrink-0 text-amber-400" /> : <Moon className="w-4 h-4 shrink-0 text-indigo-600" />}
                </button>
              )}

              {user && (
                <div>
                  <div className="text-xs font-extrabold text-slate-900 dark:text-white truncate">{user.fullName}</div>
                  <div className="text-[10px] text-emerald-600 dark:text-amber-400 uppercase font-extrabold">{user.role}</div>
                  <button
                    onClick={handleLogout}
                    className="mt-3 w-full py-2.5 bg-rose-100 dark:bg-rose-950/80 hover:bg-rose-200 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-200 border border-rose-200 dark:border-rose-800/50 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-colors"
                  >
                    <LogOut className="w-4 h-4 shrink-0" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800/80 py-2 px-3 flex items-center justify-around z-30 shadow-2xl">
        {[
          { href: '/', label: 'Home', icon: Home },
          { href: '/farmers', label: 'Farmers', icon: Wheat },
          { href: '/parties', label: 'Parties', icon: Users },
          { href: '/employees', label: 'Staff', icon: UserCheck },
          { href: '/vehicles', label: 'Vehicles', icon: Truck },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl transition-colors duration-150 ${
                isActive
                  ? 'text-emerald-600 dark:text-amber-400 font-extrabold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold'
              }`}
            >
              <div className={`p-1 rounded-xl transition-colors ${
                isActive
                  ? 'bg-emerald-500/10 dark:bg-amber-400/10 text-emerald-600 dark:text-amber-400'
                  : 'text-slate-500 dark:text-slate-400'
              }`}>
                <Icon className="w-5 h-5 shrink-0 stroke-[2.2]" />
              </div>
              <span className="text-[11px] leading-none whitespace-nowrap">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
