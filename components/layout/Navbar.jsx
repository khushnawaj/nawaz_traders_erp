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
  Moon,
  Search,
  ChevronDown,
  Plus,
  PieChart,
  Settings,
  User,
  Landmark
} from 'lucide-react';
import { useTheme } from 'next-themes';
import toast from 'react-hot-toast';
import GlobalSearchModal from './GlobalSearchModal';
import NotificationBell from './NotificationBell';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { fetchCurrentUser, logoutUser } from '@/lib/redux/slices/authSlice';

const CATEGORIZED_NAV = [
  {
    category: 'Procurement',
    items: [
      { href: '/farmers', label: 'Farmer Directory', icon: Wheat },
      { href: '/purchases', label: 'Crop Purchases', icon: ShoppingBag },
    ],
  },
  {
    category: 'Sales & Financials',
    items: [
      { href: '/parties', label: 'Parties & Rice Mills', icon: Users },
      { href: '/sales', label: 'Sales & Invoices', icon: TrendingUp },
      { href: '/investors', label: 'Capital & Investors', icon: Landmark },
      { href: '/reports/profit-loss', label: 'Profit & Loss Statement', icon: PieChart },
    ],
  },
  {
    category: 'Fleet & Stock',
    items: [
      { href: '/employees', label: 'Staff & Drivers', icon: UserCheck },
      { href: '/vehicles', label: 'Vehicles & Fuel', icon: Truck },
      { href: '/godowns', label: 'Godowns & Inventory', icon: Warehouse },
    ],
  },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, loading: authLoading } = useAppSelector((state) => state.auth);

  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    dispatch(fetchCurrentUser());

    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch]);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      toast.success('Signed out successfully');
      router.push('/login');
      router.refresh();
    } catch (err) {
      toast.error('Sign out failed');
    }
  };

  const currentTheme = resolvedTheme || theme;
  const role = user?.role || 'OPERATOR';

  const toggleTheme = () => {
    setTheme(currentTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <>
      {/* Fixed Top Navigation Bar */}
      <header className="bg-white/95 dark:bg-slate-950/90 text-slate-900 dark:text-white sticky top-0 z-40 border-b border-slate-200/80 dark:border-slate-800/80 shadow-sm backdrop-blur-md transition-colors duration-200">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          {/* Logo Branding */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-800 transition"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 shrink-0" /> : <Menu className="w-5 h-5 shrink-0" />}
            </button>

            <Link href="/" className="flex items-center gap-2.5 py-1 group">
              <img
                src="/images/nawaz-traders-brand-logo.jpg"
                alt="Nawaz Traders Logo"
                className="h-9 w-9 object-contain rounded-xl mix-blend-multiply dark:mix-blend-screen shrink-0"
              />
              <div className="flex flex-col">
                <span className="font-extrabold text-sm text-slate-900 dark:text-white tracking-tight leading-none font-outfit">
                  NAWAZ TRADERS
                </span>
                <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase leading-tight font-outfit mt-0.5">
                  GRAIN ERP
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Link Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-100/80 dark:bg-slate-900/60 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-md">
            {user?.role === 'EMPLOYEE' ? (
              <Link
                href="/portal/employee"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 text-white shadow-sm"
              >
                <UserCheck className="w-3.5 h-3.5" /> My Employee Portal
              </Link>
            ) : user?.role === 'FARMER' ? (
              <Link
                href="/portal/farmer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500 text-slate-950 shadow-sm"
              >
                <Wheat className="w-3.5 h-3.5" /> My Farmer Portal
              </Link>
            ) : (
              <>
                <Link
                  href="/"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    pathname === '/'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Home className="w-3.5 h-3.5" /> Dashboard
                </Link>

                {CATEGORIZED_NAV.map((cat) => {
                  const filteredItems = cat.items.filter((item) => {
                    if (['OWNER', 'CO_OWNER', 'ADMIN'].includes(role)) return true;
                    if (role === 'ACCOUNTANT') return ['/parties', '/sales', '/investors', '/reports/profit-loss', '/purchases', '/employees'].includes(item.href);
                    if (role === 'MANAGER') return ['/godowns', '/vehicles', '/employees', '/purchases', '/farmers'].includes(item.href);
                    if (role === 'OPERATOR') return ['/farmers', '/purchases', '/parties', '/sales'].includes(item.href);
                    return true;
                  });

                  if (filteredItems.length === 0) return null;

                  return (
                    <div key={cat.category} className="relative group">
                      <button className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition font-outfit">
                        <span>{cat.category}</span>
                        <ChevronDown className="w-3 h-3 text-slate-400 group-hover:rotate-180 transition-transform" />
                      </button>

                      {/* Dropdown Menu */}
                      <div className="absolute left-0 top-full pt-1 hidden group-hover:block z-50 w-52 animate-in fade-in zoom-in-95 duration-150">
                        <div className="glass-modal rounded-2xl p-2 shadow-2xl border border-slate-200/80 dark:border-slate-800 space-y-1">
                          {filteredItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                            return (
                              <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                                  isActive
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold'
                                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                                }`}
                              >
                                <Icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                <span>{item.label}</span>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </nav>

          {/* Controls: Search, Notifications & Profile */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Quick Search Button (Management Roles Only) */}
            {user && !['FARMER', 'EMPLOYEE', 'DRIVER'].includes(user.role) && (
              <button
                onClick={() => setSearchModalOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 text-xs font-medium transition"
                title="Search (Ctrl + K)"
              >
                <Search className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="hidden sm:inline">Search...</span>
                <kbd className="hidden sm:inline px-1.5 py-0.5 text-[10px] font-mono bg-slate-200 dark:bg-slate-800 text-slate-500 rounded border border-slate-300 dark:border-slate-700">
                  ⌘K
                </kbd>
              </button>
            )}

            {/* Notification Bell Component */}
            {user && <NotificationBell />}

            {/* User Profile Badge (Logged In) OR Single Sign In Button (Logged Out) */}
            {!mounted || authLoading ? (
              <div className="w-24 h-8 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
            ) : user ? (
              /* Logged In: Show ONLY User Profile Badge with dropdown */
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2.5 bg-slate-100 dark:bg-slate-900/90 p-1.5 pl-3 pr-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/50 transition-all text-left group"
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.fullName}
                      className="w-7 h-7 rounded-xl object-cover border border-emerald-500 shadow-sm"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-amber-500 flex items-center justify-center text-white text-xs font-black shadow-sm font-outfit">
                      {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  <div className="hidden sm:block text-left max-w-[130px]">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate font-outfit leading-tight">
                      {user.fullName}
                    </div>
                    <div className="text-[9px] font-extrabold text-amber-500 uppercase tracking-widest leading-none mt-0.5 font-outfit">
                      {user.role}
                    </div>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Profile Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="glass-modal rounded-3xl p-3 shadow-2xl border border-slate-200/80 dark:border-slate-800/80 space-y-2">
                      <div className="p-3 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/50 dark:border-slate-800/50">
                        <div className="font-extrabold text-xs text-slate-900 dark:text-white truncate font-outfit">{user.fullName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">@{user.username}</div>
                        <div className="mt-1.5 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <ShieldCheck className="w-3 h-3 text-amber-500" /> {user.role} Access
                        </div>
                      </div>

                      <div className="space-y-1 pt-1 text-xs font-semibold font-outfit">
                        <Link
                          href="/settings?tab=profile"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition"
                        >
                          <User className="w-4 h-4 text-emerald-500" />
                          <span>My Account Profile</span>
                        </Link>

                        {['OWNER', 'CO_OWNER', 'ADMIN'].includes(user?.role) && (
                          <Link
                            href="/settings?tab=roles"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition"
                          >
                            <ShieldCheck className="w-4 h-4 text-amber-500" />
                            <span>User Roles & Access</span>
                          </Link>
                        )}

                        <Link
                          href="/settings?tab=theme"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition"
                        >
                          <Settings className="w-4 h-4 text-indigo-500" />
                          <span>Theme & Preferences</span>
                        </Link>
                      </div>

                      <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            handleLogout();
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition text-xs font-bold font-outfit"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Logged Out: Show ONLY 1 single option to Sign In */
              <Link
                href="/login"
                className="bahi-btn-primary py-1.5 px-4 text-xs font-bold font-outfit shadow-sm"
              >
                <User className="w-3.5 h-3.5 text-amber-300" /> Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Global Search Modal */}
      <GlobalSearchModal isOpen={searchModalOpen} onClose={() => setSearchModalOpen(false)} />

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex animate-in fade-in duration-150">
          <div className="w-72 bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-6 space-y-6 shadow-2xl h-full border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <img src="/images/nawaz-traders-icon.png" alt="NT Logo" className="w-8 h-8 object-contain shrink-0" />
                  <div>
                    <span className="font-semibold text-sm text-slate-900 dark:text-white block leading-tight">Nawaz Traders</span>
                    <span className="text-[9px] font-medium text-emerald-600 dark:text-amber-400 uppercase tracking-widest block">GRAINS TODAY</span>
                  </div>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500">
                  <X className="w-5 h-5 shrink-0" />
                </button>
              </div>

              <div className="space-y-4">
                {user?.role === 'FARMER' ? (
                  <div className="space-y-2">
                    <Link
                      href="/portal/farmer"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 shadow-sm"
                    >
                      <Wheat className="w-4 h-4 shrink-0" /> My Farmer Portal
                    </Link>
                    <Link
                      href="/settings?tab=profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <User className="w-4 h-4 text-emerald-500 shrink-0" /> My Profile & Password
                    </Link>
                  </div>
                ) : ['EMPLOYEE', 'DRIVER'].includes(user?.role) ? (
                  <div className="space-y-2">
                    <Link
                      href="/portal/employee"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white shadow-sm"
                    >
                      <UserCheck className="w-4 h-4 shrink-0" /> My Employee Portal
                    </Link>
                    <Link
                      href="/settings?tab=profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <User className="w-4 h-4 text-emerald-500 shrink-0" /> My Profile & Password
                    </Link>
                  </div>
                ) : (
                  CATEGORIZED_NAV.map((cat) => (
                    <div key={cat.category} className="space-y-1">
                      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2">{cat.category}</div>
                      {cat.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition ${
                              isActive
                                ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            <Icon className="w-4 h-4 shrink-0" />
                            <span>{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              {mounted && (
                <button
                  onClick={toggleTheme}
                  className="w-full py-2 px-3 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-amber-400 rounded-xl text-xs font-medium flex items-center justify-between transition"
                >
                  <span>Theme: {currentTheme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
                  {currentTheme === 'dark' ? <Sun className="w-4 h-4 shrink-0 text-amber-400" /> : <Moon className="w-4 h-4 shrink-0 text-indigo-600" />}
                </button>
              )}
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800/80 py-2 px-3 flex items-center justify-around z-30 shadow-2xl">
        {user?.role === 'FARMER' ? (
          <>
            <Link href="/portal/farmer" className="flex flex-col items-center justify-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
              <Wheat className="w-5 h-5" /> Kisan Portal
            </Link>
            <Link href="/settings?tab=profile" className="flex flex-col items-center justify-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-400">
              <User className="w-5 h-5 text-emerald-500" /> Profile
            </Link>
          </>
        ) : ['EMPLOYEE', 'DRIVER'].includes(user?.role) ? (
          <>
            <Link href="/portal/employee" className="flex flex-col items-center justify-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              <UserCheck className="w-5 h-5" /> Staff Portal
            </Link>
            <Link href="/settings?tab=profile" className="flex flex-col items-center justify-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-400">
              <User className="w-5 h-5 text-emerald-500" /> Profile
            </Link>
          </>
        ) : (
          <>
            <Link href="/" className="flex flex-col items-center justify-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-400">
              <Home className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> Home
            </Link>

            <Link href="/farmers" className="flex flex-col items-center justify-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-400">
              <Wheat className="w-5 h-5 text-amber-500" /> Farmers
            </Link>

            {/* FAB Quick Action Trigger */}
            <button
              onClick={() => setFabOpen(!fabOpen)}
              className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-600/40 -mt-6 border-2 border-white dark:border-slate-950 transition transform hover:scale-105"
            >
              <Plus className={`w-6 h-6 transition-transform ${fabOpen ? 'rotate-45' : ''}`} />
            </button>

            <Link href="/parties" className="flex flex-col items-center justify-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-400">
              <Users className="w-5 h-5 text-emerald-500" /> Parties
            </Link>

            <Link href="/purchases" className="flex flex-col items-center justify-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-400">
              <ShoppingBag className="w-5 h-5 text-rose-500" /> Invoices
            </Link>
          </>
        )}
      </nav>

      {/* Mobile FAB Quick Drawer */}
      {fabOpen && (
        <div className="md:hidden fixed bottom-16 right-4 z-40 glass-modal p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-150">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2">Quick Actions</div>
          <Link
            href="/farmers"
            onClick={() => setFabOpen(false)}
            className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white"
          >
            <Wheat className="w-4 h-4 text-amber-500" /> Record Crop Purchase
          </Link>
          <Link
            href="/parties"
            onClick={() => setFabOpen(false)}
            className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white"
          >
            <Users className="w-4 h-4 text-emerald-500" /> Add Party / Mill
          </Link>
          <Link
            href="/employees"
            onClick={() => setFabOpen(false)}
            className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white"
          >
            <UserCheck className="w-4 h-4 text-purple-500" /> Add Staff / Driver
          </Link>
          <Link
            href="/vehicles"
            onClick={() => setFabOpen(false)}
            className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white"
          >
            <Truck className="w-4 h-4 text-indigo-500" /> Log Fuel Filling
          </Link>
        </div>
      )}
    </>
  );
}
