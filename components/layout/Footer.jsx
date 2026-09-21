'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Wheat, 
  ShieldCheck, 
  MapPin, 
  Building2, 
  Truck, 
  Receipt,
  PieChart,
  Users,
  Warehouse,
  ShoppingBag,
  UserCheck,
  User,
  Calendar
} from 'lucide-react';

import { useAppSelector } from '@/lib/redux/hooks';

export default function Footer() {
  const user = useAppSelector((state) => state.auth.user);
  const role = user?.role;

  return (
    <footer className="w-full border-t border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-950/80 backdrop-blur-xl transition-colors duration-300 relative z-20 mt-12 pb-16 lg:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        {/* Top Footer Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-8 border-b border-slate-200/60 dark:border-slate-800/60">
          {/* Brand Info */}
          <div className="sm:col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-emerald-500 flex items-center justify-center shadow-lg text-slate-950">
                <Wheat className="w-5 h-5 text-slate-950" />
              </div>
              <div>
                <span className="font-bold text-slate-900 dark:text-white tracking-wider text-base uppercase block font-outfit">
                  NAWAZ TRADERS ERP
                </span>
                <span className="text-[10px] text-amber-500 font-semibold uppercase tracking-widest block font-outfit">
                  GRAINS TODAY • A STRONGER TOMORROW
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md font-normal leading-relaxed">
              Complete Agricultural Mandi ERP — Managing Farmer Procurement, Grain Commodity Stock, Rice Mill Processing, Commercial Sales, Fleet Fuel & Accounting.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-outfit">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Live Mandi System • FY 2026-27
              </span>

              {user && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[11px] font-bold uppercase">
                  <ShieldCheck className="w-3 h-3 text-amber-500" /> {user.role} Access
                </span>
              )}
            </div>
          </div>

          {/* Role-Specific Navigation Columns */}
          {role === 'FARMER' ? (
            <>
              {/* Farmer Column 1 */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5 font-outfit">
                  <Wheat className="w-3.5 h-3.5 text-amber-500" /> Kisan Digital Bahi
                </h4>
                <ul className="space-y-2 text-xs">
                  <li>
                    <Link href="/portal/farmer" className="text-slate-600 dark:text-slate-400 hover:text-amber-500 transition flex items-center gap-1.5">
                      <ShoppingBag className="w-3.5 h-3.5 text-slate-400" />
                      <span>Crop Purchases & Slips</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/portal/farmer" className="text-slate-600 dark:text-slate-400 hover:text-amber-500 transition flex items-center gap-1.5">
                      <Receipt className="w-3.5 h-3.5 text-slate-400" />
                      <span>Khaata Statement</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/portal/farmer" className="text-slate-600 dark:text-slate-400 hover:text-amber-500 transition flex items-center gap-1.5">
                      <Receipt className="w-3.5 h-3.5 text-slate-400" />
                      <span>Payment Vouchers</span>
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Farmer Column 2 */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5 font-outfit">
                  <User className="w-3.5 h-3.5 text-emerald-500" /> Personal Account
                </h4>
                <ul className="space-y-2 text-xs">
                  <li>
                    <Link href="/settings?tab=profile" className="text-slate-600 dark:text-slate-400 hover:text-emerald-500 transition flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Profile & Password</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/settings?tab=theme" className="text-slate-600 dark:text-slate-400 hover:text-emerald-500 transition flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                      <span>Theme & Display</span>
                    </Link>
                  </li>
                </ul>
              </div>
            </>
          ) : ['EMPLOYEE', 'DRIVER'].includes(role) ? (
            <>
              {/* Staff Column 1 */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5 font-outfit">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-500" /> Staff Portal
                </h4>
                <ul className="space-y-2 text-xs">
                  <li>
                    <Link href="/portal/employee" className="text-slate-600 dark:text-slate-400 hover:text-emerald-500 transition flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Attendance Calendar</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/portal/employee" className="text-slate-600 dark:text-slate-400 hover:text-emerald-500 transition flex items-center gap-1.5">
                      <Receipt className="w-3.5 h-3.5 text-slate-400" />
                      <span>Salary & Advance Khaata</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/portal/employee" className="text-slate-600 dark:text-slate-400 hover:text-emerald-500 transition flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-slate-400" />
                      <span>Assigned Trips</span>
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Staff Column 2 */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5 font-outfit">
                  <User className="w-3.5 h-3.5 text-emerald-500" /> Personal Account
                </h4>
                <ul className="space-y-2 text-xs">
                  <li>
                    <Link href="/settings?tab=profile" className="text-slate-600 dark:text-slate-400 hover:text-emerald-500 transition flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Profile & Password</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/settings?tab=theme" className="text-slate-600 dark:text-slate-400 hover:text-emerald-500 transition flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                      <span>Theme & Display</span>
                    </Link>
                  </li>
                </ul>
              </div>
            </>
          ) : (
            <>
              {/* Management Column 1 */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5 font-outfit">
                  <Wheat className="w-3.5 h-3.5 text-amber-500" /> Procurement & Mandi
                </h4>
                <ul className="space-y-2 text-xs">
                  <li>
                    <Link href="/farmers" className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>Farmer Directory</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/purchases" className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition flex items-center gap-1.5">
                      <ShoppingBag className="w-3.5 h-3.5 text-slate-400" />
                      <span>Crop Purchases</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/godowns" className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition flex items-center gap-1.5">
                      <Warehouse className="w-3.5 h-3.5 text-slate-400" />
                      <span>Godowns & Inventory</span>
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Management Column 2 */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5 font-outfit">
                  <Building2 className="w-3.5 h-3.5 text-emerald-500" /> Sales & Logistics
                </h4>
                <ul className="space-y-2 text-xs">
                  <li>
                    <Link href="/parties" className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>Parties & Rice Mills</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/sales" className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition flex items-center gap-1.5">
                      <Receipt className="w-3.5 h-3.5 text-slate-400" />
                      <span>Sales Invoices</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/reports/profit-loss" className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition flex items-center gap-1.5">
                      <PieChart className="w-3.5 h-3.5 text-amber-500" />
                      <span>Profit & Loss Statement</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/employees" className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                      <span>Staff & Drivers</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/vehicles" className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-slate-400" />
                      <span>Fleet & Diesel Logs</span>
                    </Link>
                  </li>
                </ul>
              </div>
            </>
          )}
        </div>

        {/* Bottom copyright & status bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400 font-normal text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} <strong>Nawaz Traders</strong>. All rights reserved.</span>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 sm:gap-4 text-[11px]">
            <span className="flex items-center gap-1 text-slate-500">
              <MapPin className="w-3 h-3 text-amber-500" /> Mandi Region, MP / UP
            </span>
            <span className="hidden sm:inline text-slate-400">•</span>
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" /> 256-Bit Encrypted Data Vault
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
