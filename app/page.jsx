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
  FileText,
  PlusCircle,
  Zap,
  ShieldCheck,
  Scale
} from 'lucide-react';

export default function HomePage() {
  return (
    <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner Card */}
      <div className="relative rounded-3xl p-6 sm:p-8 overflow-hidden bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 border border-emerald-500/20 shadow-2xl shadow-emerald-950/50 text-white">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex items-center gap-3">
            <img
              src="/images/nawaz-traders-dark.png"
              alt="Nawaz Traders Logo"
              className="h-12 sm:h-14 object-contain drop-shadow-md"
            />
            <span className="hidden sm:inline-block px-3 py-1 rounded-full text-[11px] font-extrabold bg-amber-400/10 text-amber-400 border border-amber-400/20 uppercase tracking-wider">
              GRAINS TODAY • A STRONGER TOMORROW
            </span>
          </div>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl">
            Complete agricultural trading management for Paddy (धान), Wheat (गेहूँ), Gram (चना), Maize (मक्का) & Mustard (सरसों). Track weighments, godown stock, party ledgers, drivers, and vehicles seamlessly.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link 
              href="/farmers" 
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 px-5 py-2.5 rounded-xl font-extrabold text-xs shadow-lg shadow-amber-500/20 transition-all transform hover:-translate-y-0.5"
            >
              <Wheat className="w-4 h-4" /> Farmers (किसान)
            </Link>
            <Link 
              href="/parties" 
              className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/90 dark:hover:bg-slate-800 text-slate-800 dark:text-white border border-slate-300 dark:border-slate-700 px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all"
            >
              <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Rice Mills & Customers
            </Link>
            <Link 
              href="/employees" 
              className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/90 dark:hover:bg-slate-800 text-slate-800 dark:text-white border border-slate-300 dark:border-slate-700 px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all"
            >
              <UserCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" /> Drivers & Staff
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden group hover:border-emerald-500/40 transition-all duration-300">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Today's Purchases</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-500/20 group-hover:scale-110 transition-transform">
              <Wheat className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">₹0.00</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium flex items-center gap-1">
            <Scale className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" /> 0.00 Quintal Procured
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden group hover:border-blue-500/40 transition-all duration-300">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Today's Sales</span>
            <div className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-500/20 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">₹0.00</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium flex items-center gap-1">
            <ShoppingBag className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" /> 0.00 Quintal Dispatched
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden group hover:border-amber-500/40 transition-all duration-300">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Party Receivables</span>
            <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-500/20 group-hover:scale-110 transition-transform">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">₹0.00</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">From Customers & Rice Mills</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden group hover:border-rose-500/40 transition-all duration-300">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Farmer Payables</span>
            <div className="p-2 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl border border-rose-500/20 group-hover:scale-110 transition-transform">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">₹0.00</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Pending Farmer Payments</div>
        </div>
      </div>

      {/* Commodity Tags Banner */}
      <div className="glass-card p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Commodities Handled:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { name: 'Paddy (धान)', color: 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/20' },
            { name: 'Wheat (गेहूँ)', color: 'bg-yellow-500/10 text-yellow-800 dark:text-yellow-300 border-yellow-500/20' },
            { name: 'Gram (चना)', color: 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/20' },
            { name: 'Maize (मक्का)', color: 'bg-orange-500/10 text-orange-800 dark:text-orange-300 border-orange-500/20' },
            { name: 'Mustard (सरसों)', color: 'bg-amber-600/10 text-amber-900 dark:text-amber-200 border-amber-600/20' },
          ].map((c) => (
            <span key={c.name} className={`px-3 py-1 rounded-xl text-xs font-extrabold border ${c.color}`}>
              {c.name}
            </span>
          ))}
        </div>
      </div>

      {/* Modules Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">ERP Core Modules</h3>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Nawaz Traders System</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <Link href="/farmers" className="glass-card glass-card-hover p-5 rounded-2xl border border-slate-200 dark:border-slate-800 block group">
            <div className="flex items-start gap-4">
              <div className="p-3.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl border border-amber-500/20 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all duration-300">
                <Wheat className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-slate-900 dark:text-white text-base group-hover:text-amber-600 dark:group-hover:text-amber-400 transition">
                  Farmer Directory (किसान)
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Village details, crop procurement logs, farmer khaata ledgers & field advances.
                </p>
              </div>
            </div>
          </Link>

          <Link href="/parties" className="glass-card glass-card-hover p-5 rounded-2xl border border-slate-200 dark:border-slate-800 block group">
            <div className="flex items-start gap-4">
              <div className="p-3.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all duration-300">
                <Users className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-slate-900 dark:text-white text-base group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                  Parties & Rice Mills
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Customers, Rice Mills, Suppliers & Diesel pump vendor accounts.
                </p>
              </div>
            </div>
          </Link>

          <Link href="/employees" className="glass-card glass-card-hover p-5 rounded-2xl border border-slate-200 dark:border-slate-800 block group">
            <div className="flex items-start gap-4">
              <div className="p-3.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-2xl border border-purple-500/20 group-hover:bg-purple-500 group-hover:text-slate-950 transition-all duration-300">
                <UserCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-slate-900 dark:text-white text-base group-hover:text-purple-600 dark:group-hover:text-purple-400 transition">
                  Employees & Drivers
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Attendance logs, salary ledgers, advance loans, drivers & labourers.
                </p>
              </div>
            </div>
          </Link>

          <Link href="/vehicles" className="glass-card glass-card-hover p-5 rounded-2xl border border-slate-200 dark:border-slate-800 block group">
            <div className="flex items-start gap-4">
              <div className="p-3.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-slate-950 transition-all duration-300">
                <Truck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-slate-900 dark:text-white text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                  Vehicles & Diesel
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Tractor/truck registry, fuel fillings, repairs, maintenance & trip costs.
                </p>
              </div>
            </div>
          </Link>

          <Link href="/godowns" className="glass-card glass-card-hover p-5 rounded-2xl border border-slate-200 dark:border-slate-800 block group">
            <div className="flex items-start gap-4">
              <div className="p-3.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-slate-950 transition-all duration-300">
                <Warehouse className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-slate-900 dark:text-white text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                  Godowns & Stock
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Mandi warehouse capacity, live stock movements in KG/Quintals.
                </p>
              </div>
            </div>
          </Link>

          <Link href="/purchases" className="glass-card glass-card-hover p-5 rounded-2xl border border-slate-200 dark:border-slate-800 block group">
            <div className="flex items-start gap-4">
              <div className="p-3.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-2xl border border-rose-500/20 group-hover:bg-rose-500 group-hover:text-slate-950 transition-all duration-300">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-slate-900 dark:text-white text-base group-hover:text-rose-600 dark:group-hover:text-rose-400 transition">
                  Procurement & Sales
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Weighbridge gross/tare slips, deductions, rates & invoices.
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}

