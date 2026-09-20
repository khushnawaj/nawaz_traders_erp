'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Wheat, 
  Truck, 
  Bike, 
  Users, 
  Scale, 
  Receipt, 
  Calendar, 
  Printer, 
  PieChart, 
  ShieldCheck, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter,
  CheckCircle2
} from 'lucide-react';
import Breadcrumb from '@/components/layout/Breadcrumb';
import Loader from '@/components/common/Loader';
import ProfitLossBarChart from '@/components/reports/ProfitLossBarChart';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function ProfitLossReportPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [timePreset, setTimePreset] = useState('ALL'); // 'ALL' | 'THIS_MONTH' | 'THIS_YEAR'

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const res = await fetch(`/api/reports/profit-loss?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setReport(json.data);
      } else {
        throw new Error(json.error || 'Failed to fetch report');
      }
    } catch (err) {
      console.error('Error fetching P&L report:', err);
      toast.error('Failed to load Profit & Loss statement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [startDate, endDate]);

  const handlePresetChange = (preset) => {
    setTimePreset(preset);
    const now = new Date();
    if (preset === 'THIS_MONTH') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const today = now.toISOString().split('T')[0];
      setStartDate(firstDay);
      setEndDate(today);
    } else if (preset === 'THIS_YEAR') {
      const firstDay = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
      const today = now.toISOString().split('T')[0];
      setStartDate(firstDay);
      setEndDate(today);
    } else {
      setStartDate('');
      setEndDate('');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading && !report) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <Loader text="Calculating Profit & Loss..." subtext="Summing revenue, grain purchases, labour, fuel & salaries" size="lg" />
      </div>
    );
  }

  const { revenue, cogs, expenses, summary } = report || {
    revenue: {},
    cogs: {},
    expenses: {},
    summary: {},
  };

  return (
    <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-200">
      {/* Breadcrumb Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <Breadcrumb items={[{ label: 'Profit & Loss Statement' }]} />

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" /> Print P&L Statement
          </button>
        </div>
      </div>

      {/* Header Banner Card */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <PieChart className="w-3 h-3" /> Real-time Financial Ledger
            </span>
          </div>
          <h1 className="font-semibold text-2xl sm:text-3xl text-slate-900 dark:text-white flex items-center gap-2">
            Profit & Loss Statement
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
            Nawaz Traders grain trading net margin after accounting for purchases, labour, vehicle fuel (truck/bike), repairs, salaries & mandi tax
          </p>
        </div>

        {/* Date Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 relative z-10 bg-slate-100/80 dark:bg-slate-900/80 p-2 rounded-2xl border border-slate-200/60 dark:border-slate-800/60">
          <button
            onClick={() => handlePresetChange('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              timePreset === 'ALL'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            All Time
          </button>
          <button
            onClick={() => handlePresetChange('THIS_MONTH')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              timePreset === 'THIS_MONTH'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => handlePresetChange('THIS_YEAR')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              timePreset === 'THIS_YEAR'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            This Year
          </button>
        </div>
      </div>

      {/* 4-Card Executive Financial Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales Revenue */}
        <div className="glass-card p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">1. Grain Sales Revenue</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(summary.totalSalesRevenue)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-normal flex items-center justify-between">
            <span>Sales Invoices: {revenue.salesCount || 0}</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Received: {formatCurrency(revenue.totalSalesReceived)}</span>
          </div>
        </div>

        {/* Grain Procurement Cost */}
        <div className="glass-card p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">2. Grain Purchase Cost</span>
            <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-500/20">
              <Wheat className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {formatCurrency(cogs.totalProcurementCost)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-normal">
            From {cogs.purchasesCount || 0} Farmer Procurement Slips
          </div>
        </div>

        {/* Total Operating & Field Expenses */}
        <div className="glass-card p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">3. Field & Operating Costs</span>
            <div className="p-2 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl border border-rose-500/20">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
            {formatCurrency(expenses.totalOperatingExpenses)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-normal">
            Labour, Freight, Fuel, Repairs, Salaries, Tax
          </div>
        </div>

        {/* NET PROFIT / NET LOSS */}
        <div className={`glass-card p-5 rounded-2xl border shadow-md relative overflow-hidden ${
          summary.isProfit
            ? 'border-emerald-500/40 bg-emerald-500/5'
            : 'border-rose-500/40 bg-rose-500/5'
        }`}>
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
              4. NET {summary.isProfit ? 'PROFIT' : 'LOSS'}
            </span>
            <div className={`p-2 rounded-xl border ${
              summary.isProfit ? 'bg-emerald-500/20 text-emerald-600 border-emerald-500/30' : 'bg-rose-500/20 text-rose-600 border-rose-500/30'
            }`}>
              {summary.isProfit ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
            </div>
          </div>
          <div className={`text-2xl font-black ${
            summary.isProfit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
          }`}>
            {formatCurrency(summary.netProfitOrLoss)}
          </div>
          <div className="text-xs font-semibold mt-1 flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400">Margin:</span>
            <span className={summary.isProfit ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-rose-600 dark:text-rose-400 font-bold'}>
              {summary.profitMarginPercent}%
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Bar Chart Section */}
      <ProfitLossBarChart
        revenue={revenue}
        cogs={cogs}
        expenses={expenses}
        summary={summary}
      />

      {/* DETAILED EXPENSES BREAKDOWN GRID */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Receipt className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Detailed Cost & Expense Breakdown
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">Nawaz Traders Mandi ERP</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 1. Grain Procurement Cost */}
          <div className="glass-card p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
                  <Wheat className="w-4 h-4" />
                </div>
                <span className="font-semibold text-slate-900 dark:text-white text-xs">Crop Procurement Cost</span>
              </div>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{formatCurrency(cogs.totalProcurementCost)}</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
              Gross procurement value paid/payable directly to farmers for Wheat, Paddy, Gram, and Soyabean.
            </p>
          </div>

          {/* 2. Hamali / Labour Charges */}
          <div className="glass-card p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl">
                  <Users className="w-4 h-4" />
                </div>
                <span className="font-semibold text-slate-900 dark:text-white text-xs">Labour & Hamali</span>
              </div>
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400">{formatCurrency(expenses.labourCharges)}</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
              Palledari, bag unloading/loading labor wages per bag or per quintal paid during field procurement.
            </p>
          </div>

          {/* 3. Tractor / Truck Freight */}
          <div className="glass-card p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <Truck className="w-4 h-4" />
                </div>
                <span className="font-semibold text-slate-900 dark:text-white text-xs">Freight & Transport</span>
              </div>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{formatCurrency(expenses.freightCharges)}</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
              Freight charges for transporting grain from farmer fields to godowns or direct delivery to Rice Mills.
            </p>
          </div>

          {/* 4. Vehicle Fuel Expenses (Diesel & Petrol for Trucks, Pickups & Bikes) */}
          <div className="glass-card p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
                  <Bike className="w-4 h-4" />
                </div>
                <span className="font-semibold text-slate-900 dark:text-white text-xs">Vehicle Fuel</span>
              </div>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{formatCurrency(expenses.fuelCost)}</span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1 font-normal">
              <div className="flex justify-between">
                <span>Total Fleet Fuel (Tractors, Trucks, Pickups & Bikes):</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{formatCurrency(expenses.fuelCost)}</span>
              </div>
              {expenses.bikeFuelCost > 0 && (
                <div className="flex justify-between text-amber-600 dark:text-amber-400">
                  <span>Bike & Scooter Travel Fuel:</span>
                  <span className="font-semibold">{formatCurrency(expenses.bikeFuelCost)}</span>
                </div>
              )}
            </div>
          </div>

          {/* 5. Vehicle Maintenance & Repairs */}
          <div className="glass-card p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl">
                  <Truck className="w-4 h-4" />
                </div>
                <span className="font-semibold text-slate-900 dark:text-white text-xs">Vehicle Repairs</span>
              </div>
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400">{formatCurrency(expenses.vehicleMaintenance)}</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
              Workshop mechanics, spare parts, oil filter replacement, and tyre maintenance for fleet & personal bikes.
            </p>
          </div>

          {/* 6. Employee Salaries & Wages */}
          <div className="glass-card p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
                  <Users className="w-4 h-4" />
                </div>
                <span className="font-semibold text-slate-900 dark:text-white text-xs">Staff Salaries</span>
              </div>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(expenses.employeeSalaries)}</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
              Monthly, daily, and per-trip salaries for Drivers, Loaders, Managers, Mandi Supervisors, and Accountants.
            </p>
          </div>

          {/* 7. Mandi Tax & GST */}
          <div className="glass-card p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
                  <Scale className="w-4 h-4" />
                </div>
                <span className="font-semibold text-slate-900 dark:text-white text-xs">Mandi Tax & GST</span>
              </div>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{formatCurrency(expenses.mandiTaxGst)}</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
              Krishi Upaj Mandi cess, government tax, and statutory levies added to crop procurement vouchers.
            </p>
          </div>

          {/* 8. Vehicle Taxes & Permits */}
          <div className="glass-card p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="font-semibold text-slate-900 dark:text-white text-xs">Vehicle Taxes & Permits</span>
              </div>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{formatCurrency(expenses.vehicleTaxInsurance)}</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
              Annual road tax, vehicle fitness certificates, commercial insurance, and inter-state Mandi permits.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
