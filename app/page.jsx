'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Wheat, 
  Warehouse, 
  Truck, 
  UserCheck, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  ShoppingBag,
  Zap,
  Scale,
  ShieldCheck,
  Receipt,
  PieChart,
  PlusCircle,
  Clock,
  CheckCircle,
  Layers,
  FileSpreadsheet
} from 'lucide-react';
import DashboardSlider from '@/components/dashboard/DashboardSlider';
import GrainCommodityShowcase from '@/components/dashboard/GrainCommodityShowcase';
import LandingHero from '@/components/landing/LandingHero';
import LandingFeatures from '@/components/landing/LandingFeatures';
import LandingMetrics from '@/components/landing/LandingMetrics';
import LandingCTA from '@/components/landing/LandingCTA';
import { formatCurrency } from '@/lib/utils';
import { useAppSelector } from '@/lib/redux/hooks';

export default function HomePage() {
  const { user, loading: authLoading } = useAppSelector((state) => state.auth);
  const [stats, setStats] = useState({
    purchasesTodayAmount: 0,
    purchasesTodayQuintal: 0,
    purchasesTodayCount: 0,
    salesTodayAmount: 0,
    salesTodayQuintal: 0,
    salesTodayCount: 0,
    totalReceivables: 0,
    totalPayables: 0,
    pendingAdvances: 0,
    warehouseCount: 0,
    vehicleCount: 0,
    staffCount: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (user) {
      if (user.role === 'FARMER') {
        window.location.href = '/portal/farmer';
      } else if (['EMPLOYEE', 'DRIVER'].includes(user.role)) {
        window.location.href = '/portal/employee';
      }
    }

    fetch('/api/dashboard/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.stats) {
          setStats(data.stats);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingStats(false));
  }, [user]);

  const role = user?.role || 'OPERATOR';

  return (
    <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-12 animate-in fade-in duration-200">
      {/* PUBLIC LANDING PAGE EXPERIENCE FOR GUESTS / UNAUTHENTICATED VISITORS */}
      {!user && (
        <div className="space-y-16">
          <LandingHero />
          <LandingMetrics />
          <LandingFeatures />
          <LandingCTA />
        </div>
      )}

      {/* Welcome Banner for Logged-In Staff */}
      {user && (
        <div className="bahi-card p-5 border border-slate-200/60 dark:border-slate-800/60 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-emerald-500 to-emerald-600 flex items-center justify-center text-white text-lg font-black shadow-md font-outfit">
              {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-outfit">
                <ShieldCheck className="w-3 h-3" /> {role} Dashboard
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white font-outfit">
                Welcome back, {user.fullName}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {stats.pendingAdvances > 0 && ['OWNER', 'CO_OWNER', 'ADMIN', 'MANAGER', 'ACCOUNTANT'].includes(role) && (
              <Link
                href="/employees"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold animate-pulse"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{stats.pendingAdvances} Advance Requests Pending</span>
              </Link>
            )}

            {['OWNER', 'CO_OWNER', 'ADMIN'].includes(role) && (
              <Link
                href="/settings/users"
                className="bahi-btn-primary py-2 px-3 text-xs"
              >
                <ShieldCheck className="w-4 h-4 text-amber-300" /> User Roles & Access
              </Link>
            )}
          </div>
        </div>
      )}

      {/* HERO SLIDER SHOWCASE (FOR LOGGED-IN USERS) */}
      {user && <DashboardSlider />}

      {/* 2. EXECUTIVE DASHBOARD (OWNER / CO_OWNER / ADMIN) */}
      {['OWNER', 'CO_OWNER', 'ADMIN'].includes(role) && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-outfit tracking-tight">
              Executive Financial & Operations Overview
            </h3>
            <span className="text-xs text-slate-500 font-mono">Live ERP Metrics</span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bahi-card-emerald p-4 border border-slate-200/60 dark:border-slate-800/60 shadow-sm relative overflow-hidden group hover:border-emerald-500/40 transition-all duration-300">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider font-outfit">Today&apos;s Procurement</span>
                <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-500/20">
                  <Wheat className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-bahi">
                {formatCurrency(stats.purchasesTodayAmount)}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium flex items-center gap-1">
                <Scale className="w-3.5 h-3.5 text-amber-500" /> {Number(stats.purchasesTodayQuintal || 0).toFixed(2)} Quintals ({stats.purchasesTodayCount} Receipts)
              </div>
            </div>

            <div className="glass-card p-4 rounded-3xl border-l-4 border-l-blue-500 border border-slate-200/60 dark:border-slate-800/60 shadow-sm relative overflow-hidden group hover:border-blue-500/40 transition-all duration-300">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider font-outfit">Today&apos;s Sales</span>
                <div className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-500/20">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-bahi">
                {formatCurrency(stats.salesTodayAmount)}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium flex items-center gap-1">
                <ShoppingBag className="w-3.5 h-3.5 text-blue-500" /> {Number(stats.salesTodayQuintal || 0).toFixed(2)} Quintals Dispatched
              </div>
            </div>

            <div className="bahi-card p-4 border border-slate-200/60 dark:border-slate-800/60 shadow-sm relative overflow-hidden group hover:border-amber-500/40 transition-all duration-300">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider font-outfit">Party Receivables (DR)</span>
                <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-500/20">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-bahi">
                {formatCurrency(stats.totalReceivables)}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">From Rice Mills & Buyers</div>
            </div>

            <div className="bahi-card-rose p-4 border border-slate-200/60 dark:border-slate-800/60 shadow-sm relative overflow-hidden group hover:border-rose-500/40 transition-all duration-300">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider font-outfit">Farmer Payables (CR)</span>
                <div className="p-2 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl border border-rose-500/20">
                  <ArrowDownRight className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-rose-600 dark:text-rose-400 font-bahi">
                {formatCurrency(stats.totalPayables)}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Pending Farmer Crop Dues</div>
            </div>
          </div>
        </div>
      )}

      {/* 3. ACCOUNTANT FINANCIAL DASHBOARD */}
      {role === 'ACCOUNTANT' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-outfit tracking-tight">
              Accounting & Cashflow Desk
            </h3>
            <span className="text-xs text-slate-500 font-mono">Double-Entry Ledger Status</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bahi-card p-5 border border-amber-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-outfit">Total Receivables (Lene Hain)</span>
                <ArrowUpRight className="w-5 h-5 text-amber-500" />
              </div>
              <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-bahi">
                {formatCurrency(stats.totalReceivables)}
              </div>
              <p className="text-xs text-slate-500 mt-1 font-medium">Rice Mills & Commercial Accounts</p>
            </div>

            <div className="bahi-card-rose p-5 border border-rose-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-outfit">Total Payables (Dene Hain)</span>
                <ArrowDownRight className="w-5 h-5 text-rose-500" />
              </div>
              <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 font-bahi">
                {formatCurrency(stats.totalPayables)}
              </div>
              <p className="text-xs text-slate-500 mt-1 font-medium">Farmer Paddy Accounts</p>
            </div>

            <div className="bahi-card-emerald p-5 border border-emerald-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-outfit">Financial Reports</span>
                <PieChart className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="text-lg font-bold text-slate-900 dark:text-white font-outfit">Profit & Loss / Trial Balance</div>
              <Link href="/reports/profit-loss" className="text-xs text-emerald-600 hover:underline font-extrabold block mt-2">
                Open Financial Statements ↗
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 4. MANAGER MANDI DASHBOARD */}
      {role === 'MANAGER' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-outfit tracking-tight">
              Mandi Yard Operations & Logistics Desk
            </h3>
            <span className="text-xs text-slate-500 font-mono">Godown & Logistics Controls</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bahi-card-emerald p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-outfit">Active Warehouses</span>
                <Warehouse className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-bahi">{stats.warehouseCount} Storage Sheds</div>
              <Link href="/godowns" className="text-xs text-emerald-600 hover:underline font-bold block mt-1">Manage Grain Stock ↗</Link>
            </div>

            <div className="bahi-card p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-outfit">Fleet Vehicles</span>
                <Truck className="w-5 h-5 text-indigo-500" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-bahi">{stats.vehicleCount} Vehicles</div>
              <Link href="/vehicles" className="text-xs text-indigo-600 hover:underline font-bold block mt-1">Log Fuel & Trips ↗</Link>
            </div>

            <div className="bahi-card p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-outfit">Staff & Drivers</span>
                <UserCheck className="w-5 h-5 text-purple-500" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-bahi">{stats.staffCount} Active Staff</div>
              <Link href="/employees" className="text-xs text-purple-600 hover:underline font-bold block mt-1">Mark Attendance & Advances ↗</Link>
            </div>
          </div>
        </div>
      )}

      {/* 5. GRAIN COMMODITIES SHOWCASE GALLERY */}
      <GrainCommodityShowcase />

      {/* 6. QUICK ACTION SHORTCUTS */}
      <div className="glass-card p-5 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-outfit">
            Quick Actions & Mandi Slips
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            href="/farmers"
            className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800/60 text-slate-800 dark:text-slate-200 font-bold text-xs transition flex flex-col items-center gap-2 text-center group font-outfit"
          >
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Wheat className="w-4 h-4" />
            </div>
            <span>Record Crop Purchase</span>
          </Link>

          <Link
            href="/parties"
            className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-800/60 border border-slate-200/60 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200 font-bold text-xs transition flex flex-col items-center gap-2 text-center group font-outfit"
          >
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Users className="w-4 h-4" />
            </div>
            <span>Add Party / Rice Mill</span>
          </Link>

          <Link
            href="/employees"
            className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-800/60 border border-slate-200/60 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200 font-bold text-xs transition flex flex-col items-center gap-2 text-center group font-outfit"
          >
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <UserCheck className="w-4 h-4" />
            </div>
            <span>Manage Staff & Advances</span>
          </Link>

          <Link
            href="/vehicles"
            className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800/60 text-slate-800 dark:text-slate-200 font-bold text-xs transition flex flex-col items-center gap-2 text-center group font-outfit"
          >
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Truck className="w-4 h-4" />
            </div>
            <span>Log Fuel Expense</span>
          </Link>
        </div>
      </div>

      {/* 7. ERP CORE MODULES GRID */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight font-outfit">ERP Core Modules</h3>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">Nawaz Traders</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/farmers" className="glass-card glass-card-hover p-4 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 block group">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl border border-amber-500/20">
                <Wheat className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white font-outfit group-hover:text-emerald-500 transition">
                  Farmer Directory & Purchases
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-normal leading-relaxed">
                  Manage village farmers, record crop procurement parchis, khet advances & document vaults
                </p>
              </div>
            </div>
          </Link>

          <Link href="/parties" className="glass-card glass-card-hover p-4 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 block group">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-500/20">
                <Users className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white font-outfit group-hover:text-emerald-500 transition">
                  Parties & Rice Mills
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-normal leading-relaxed">
                  Manage Rice Mill buyers, commercial traders, Khaata ledgers & bank accounts
                </p>
              </div>
            </div>
          </Link>

          <Link href="/godowns" className="glass-card glass-card-hover p-4 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 block group">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl border border-blue-500/20">
                <Warehouse className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white font-outfit group-hover:text-emerald-500 transition">
                  Godowns & Inventory
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-normal leading-relaxed">
                  Track Paddy, Wheat, Gram & Oilseeds live stock across Mandi storage sheds
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
