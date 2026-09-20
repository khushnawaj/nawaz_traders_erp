'use client';

import { useState } from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  TrendingDown, 
  Wheat, 
  Users, 
  Truck, 
  Bike, 
  Scale, 
  ShieldCheck, 
  DollarSign 
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function ProfitLossBarChart({ revenue = {}, cogs = {}, expenses = {}, summary = {} }) {
  const [chartMode, setChartMode] = useState('OVERVIEW'); // 'OVERVIEW' | 'EXPENSES'

  const totalRevenue = parseFloat(summary.totalSalesRevenue || 0);
  const procurementCost = parseFloat(cogs.totalProcurementCost || 0);
  const operatingExpenses = parseFloat(expenses.totalOperatingExpenses || 0);
  const netProfit = parseFloat(summary.netProfitOrLoss || 0);

  // Overview Bar Items
  const overviewItems = [
    {
      label: 'Sales Revenue',
      value: totalRevenue,
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-500',
      lightBg: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      icon: TrendingUp,
    },
    {
      label: 'Procurement (COGS)',
      value: procurementCost,
      color: 'from-amber-500 to-orange-600',
      bgColor: 'bg-amber-500',
      lightBg: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      icon: Wheat,
    },
    {
      label: 'Operating Expenses',
      value: operatingExpenses,
      color: 'from-rose-500 to-pink-600',
      bgColor: 'bg-rose-500',
      lightBg: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
      icon: TrendingDown,
    },
    {
      label: summary.isProfit ? 'Net Profit' : 'Net Loss',
      value: Math.abs(netProfit),
      color: summary.isProfit ? 'from-emerald-600 to-teal-500' : 'from-rose-600 to-red-600',
      bgColor: summary.isProfit ? 'bg-emerald-600' : 'bg-rose-600',
      lightBg: summary.isProfit ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30' : 'bg-rose-500/15 text-rose-600 border-rose-500/30',
      icon: summary.isProfit ? TrendingUp : TrendingDown,
    },
  ];

  const maxOverviewVal = Math.max(...overviewItems.map(i => i.value), 1);

  // Operating Expense Items Breakdown
  const expenseCategories = [
    { key: 'labourCharges', label: 'Labour & Hamali', val: parseFloat(expenses.labourCharges || 0), icon: Users, color: 'bg-purple-500' },
    { key: 'freightCharges', label: 'Freight & Transport', val: parseFloat(expenses.freightCharges || 0), icon: Truck, color: 'bg-indigo-500' },
    { key: 'fuelCost', label: 'Vehicle Fuel (Fleet & Bikes)', val: parseFloat(expenses.fuelCost || 0), icon: Bike, color: 'bg-amber-500' },
    { key: 'vehicleMaintenance', label: 'Vehicle Repairs & Parts', val: parseFloat(expenses.vehicleMaintenance || 0), icon: Truck, color: 'bg-rose-500' },
    { key: 'employeeSalaries', label: 'Staff Salaries & Wages', val: parseFloat(expenses.employeeSalaries || 0), icon: Users, color: 'bg-emerald-500' },
    { key: 'mandiTaxGst', label: 'Mandi Tax & GST', val: parseFloat(expenses.mandiTaxGst || 0), icon: Scale, color: 'bg-blue-500' },
    { key: 'vehicleTaxInsurance', label: 'Vehicle Tax & Permits', val: parseFloat(expenses.vehicleTaxInsurance || 0), icon: ShieldCheck, color: 'bg-teal-500' },
  ];

  const maxExpenseVal = Math.max(...expenseCategories.map(e => e.val), 1);

  return (
    <div className="glass-card p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-xl space-y-6">
      {/* Chart Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/60 dark:border-slate-800/60 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white font-outfit">
              Profit & Loss Visual Bar Charts
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Interactive financial revenue, cost structure & expense distribution
            </p>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900/80 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 self-stretch sm:self-auto">
          <button
            onClick={() => setChartMode('OVERVIEW')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              chartMode === 'OVERVIEW'
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Financial Comparison Bar Chart
          </button>
          <button
            onClick={() => setChartMode('EXPENSES')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              chartMode === 'EXPENSES'
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Expense Breakdown Bar Chart
          </button>
        </div>
      </div>

      {/* MODE 1: OVERVIEW VERTICAL BAR CHART */}
      {chartMode === 'OVERVIEW' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="h-64 sm:h-72 w-full pt-8 pb-4 flex items-end justify-around gap-3 sm:gap-6 border-b border-slate-200 dark:border-slate-800">
            {overviewItems.map((item, idx) => {
              const heightPercent = Math.max(Math.round((item.value / maxOverviewVal) * 100), item.value > 0 ? 6 : 2);
              const Icon = item.icon;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                  {/* Tooltip on Hover */}
                  <div className="mb-2 opacity-90 group-hover:opacity-100 transition text-center space-y-0.5">
                    <span className="text-[10px] sm:text-xs font-black font-bahi block text-slate-900 dark:text-white">
                      {formatCurrency(item.value)}
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono block">
                      {totalRevenue > 0 ? `${((item.value / totalRevenue) * 100).toFixed(1)}% of Revenue` : ''}
                    </span>
                  </div>

                  {/* Bar Box */}
                  <div className="w-full max-w-[80px] sm:max-w-[110px] bg-slate-100 dark:bg-slate-900/60 rounded-t-2xl p-1 flex items-end justify-center h-full">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-t-xl bg-gradient-to-t ${item.color} shadow-lg transition-all duration-500 group-hover:scale-[1.02]`}
                    />
                  </div>

                  {/* Bottom Label */}
                  <div className="mt-3 text-center space-y-1">
                    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${item.lightBg}`}>
                      <Icon className="w-3 h-3" />
                      <span className="truncate max-w-[90px] sm:max-w-none">{item.label}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Sales Revenue</span>
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400 font-bahi">{formatCurrency(totalRevenue)}</span>
            </div>

            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Grain Procurement</span>
              <span className="font-extrabold text-amber-600 dark:text-amber-400 font-bahi">{formatCurrency(procurementCost)}</span>
            </div>

            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Operating Costs</span>
              <span className="font-extrabold text-rose-600 dark:text-rose-400 font-bahi">{formatCurrency(operatingExpenses)}</span>
            </div>

            <div className={`p-3 rounded-2xl border text-center ${
              summary.isProfit ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'
            }`}>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Net {summary.isProfit ? 'Profit' : 'Loss'}</span>
              <span className={`font-extrabold font-bahi ${
                summary.isProfit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}>
                {formatCurrency(summary.netProfitOrLoss)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: EXPENSES HORIZONTAL PROGRESS BAR CHART */}
      {chartMode === 'EXPENSES' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between font-semibold">
            <span>Operating Expense Category</span>
            <span>Amount (₹) & Distribution</span>
          </div>

          <div className="space-y-3">
            {expenseCategories.map((exp, idx) => {
              const percent = maxExpenseVal > 0 ? (exp.val / maxExpenseVal) * 100 : 0;
              const Icon = exp.icon;

              return (
                <div key={idx} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg text-white ${exp.color}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white font-outfit">{exp.label}</span>
                    </div>
                    <span className="font-extrabold text-slate-900 dark:text-white font-bahi text-sm">
                      {formatCurrency(exp.val)}
                    </span>
                  </div>

                  {/* Horizontal Bar Track */}
                  <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${Math.max(percent, exp.val > 0 ? 3 : 0)}%` }}
                      className={`h-full rounded-full ${exp.color} transition-all duration-500`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
