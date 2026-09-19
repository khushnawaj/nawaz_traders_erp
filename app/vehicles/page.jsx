'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Truck, 
  Fuel, 
  Wrench, 
  Plus, 
  Search, 
  Gauge, 
  UserCheck, 
  ArrowUpRight, 
  Calendar,
  FileText,
  DollarSign,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import VehicleFormModal from '@/components/vehicles/VehicleFormModal';
import FuelExpenseModal from '@/components/vehicles/FuelExpenseModal';

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [fuelExpenses, setFuelExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('VEHICLES'); // VEHICLES, DIESEL_LOGS, MAINTENANCE

  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [isFuelModalOpen, setIsFuelModalOpen] = useState(false);
  const [selectedVehicleForFuel, setSelectedVehicleForFuel] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [vehRes, fuelRes] = await Promise.all([
        fetch('/api/vehicles').then((r) => r.json()),
        fetch('/api/fuel-expenses').then((r) => r.json()),
      ]);

      if (vehRes.success) setVehicles(vehRes.data || []);
      if (fuelRes.success) setFuelExpenses(fuelRes.data || []);
    } catch (err) {
      toast.error('Failed to load vehicle directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Stats Calculations
  const totalVehicles = vehicles.length;
  const totalLiters = fuelExpenses.reduce((acc, curr) => acc + (parseFloat(curr.quantityLtr) || 0), 0);
  const totalDieselCost = fuelExpenses.reduce((acc, curr) => acc + (parseFloat(curr.totalAmount) || 0), 0);
  const avgDieselRate = totalLiters > 0 ? totalDieselCost / totalLiters : 0;

  const filteredVehicles = vehicles.filter((v) => {
    const query = search.toLowerCase();
    return (
      v.vehicleNumber.toLowerCase().includes(query) ||
      v.vehicleType.toLowerCase().includes(query) ||
      (v.model && v.model.toLowerCase().includes(query)) ||
      (v.employees?.[0]?.fullName && v.employees[0].fullName.toLowerCase().includes(query))
    );
  });

  const filteredFuelLogs = fuelExpenses.filter((f) => {
    const query = search.toLowerCase();
    return (
      f.vehicle?.vehicleNumber.toLowerCase().includes(query) ||
      (f.driver?.fullName && f.driver.fullName.toLowerCase().includes(query)) ||
      (f.vendor?.name && f.vendor.name.toLowerCase().includes(query)) ||
      (f.receiptNo && f.receiptNo.toLowerCase().includes(query))
    );
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  return (
    <div className="max-w-[1550px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 mb-1">
            <Truck className="w-3.5 h-3.5" /> Fleet & Transport Operations
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Vehicles & Diesel Management (वाहन & डीजल प्रबंधन)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track Tractors, Trucks, Pickups, Diesel Fillings & Odometer Logs
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsFuelModalOpen(true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black px-4 py-2.5 rounded-2xl text-xs shadow-lg shadow-amber-950/20 transition-all transform hover:-translate-y-0.5"
          >
            <Fuel className="w-4 h-4" /> Record Diesel (डीजल पर्ची)
          </button>

          <button
            onClick={() => setIsVehicleModalOpen(true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-extrabold px-4 py-2.5 rounded-2xl text-xs shadow-lg shadow-emerald-950/20 transition-all transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4 text-amber-300" /> Add Vehicle (गाड़ी जोड़ें)
          </button>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xl relative overflow-hidden group hover:border-emerald-500/40 transition-all duration-300">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">Fleet Vehicles</span>
            <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-500/20 group-hover:scale-110 transition-transform">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">{totalVehicles}</div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Active Tractors, Trucks & Trailers</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xl relative overflow-hidden group hover:border-amber-500/40 transition-all duration-300">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">Total Diesel Expenses</span>
            <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-500/20 group-hover:scale-110 transition-transform">
              <Fuel className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
            {formatCurrency(totalDieselCost)}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {totalLiters.toFixed(2)} Liters Consumed
          </p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xl relative overflow-hidden group hover:border-emerald-500/40 transition-all duration-300">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">Avg. Diesel Price</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-500/20 group-hover:scale-110 transition-transform">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            ₹{avgDieselRate > 0 ? avgDieselRate.toFixed(2) : '94.50'}/Ltr
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Weighted Mandi Fuel Rate</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xl relative overflow-hidden group hover:border-purple-500/40 transition-all duration-300">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">Active Drivers</span>
            <div className="p-2 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl border border-purple-500/20 group-hover:scale-110 transition-transform">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {vehicles.filter((v) => v.employees?.length > 0).length}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Vehicles with Assigned Drivers</p>
        </div>
      </div>

      {/* Main Directory & Log Tabs Container */}
      <div className="glass-card p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl space-y-6">
        {/* Controls: Search Bar & Tabs Switcher */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search vehicle number, type, driver..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="app-input app-input-with-icon"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {[
              { id: 'VEHICLES', label: 'Fleet Vehicles (वाहन सूचि)' },
              { id: 'DIESEL_LOGS', label: 'Diesel Filling Logs (डीजल पर्ची)' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-colors duration-150 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* TAB 1: VEHICLES GRID */}
        {activeTab === 'VEHICLES' && (
          <>
            {loading ? (
              <div className="py-16 text-center text-slate-500 dark:text-slate-400 text-sm">Loading vehicles...</div>
            ) : filteredVehicles.length === 0 ? (
              <div className="py-16 text-center text-slate-500 dark:text-slate-400 space-y-3">
                <Truck className="w-12 h-12 text-emerald-500/30 mx-auto" />
                <p className="text-base font-extrabold text-slate-900 dark:text-white">No vehicles found</p>
                <p className="text-xs">Click "+ Add Vehicle" to register your first tractor or truck.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredVehicles.map((v) => {
                  const assignedDriver = v.employees?.[0];
                  const totalVehicleFuelLtr = v.fuelExpenses?.reduce((acc, f) => acc + (parseFloat(f.quantityLtr) || 0), 0) || 0;
                  const totalVehicleFuelCost = v.fuelExpenses?.reduce((acc, f) => acc + (parseFloat(f.totalAmount) || 0), 0) || 0;

                  return (
                    <div
                      key={v.id}
                      className="p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/40 transition-all duration-200 space-y-4 shadow-md group"
                    >
                      {/* Top Header Card info */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-xl border border-emerald-500/20 group-hover:scale-105 transition-transform">
                            {v.vehicleType.includes('Tractor') ? '🚜' : v.vehicleType.includes('Pickup') ? '🛻' : '🚛'}
                          </div>
                          <div>
                            <span className="text-base font-black text-slate-900 dark:text-white block uppercase tracking-tight">
                              {v.vehicleNumber}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block">
                              {v.vehicleType} {v.model ? `• ${v.model}` : ''}
                            </span>
                          </div>
                        </div>

                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                          {v.ownership}
                        </span>
                      </div>

                      {/* Info details */}
                      <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 text-xs border border-slate-200/50 dark:border-slate-800/60">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Assigned Driver</span>
                          <span className="font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                            <UserCheck className="w-3.5 h-3.5 text-amber-500" />
                            {assignedDriver ? assignedDriver.fullName : 'Unassigned'}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Odometer Meter</span>
                          <span className="font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                            <Gauge className="w-3.5 h-3.5 text-emerald-500" />
                            {parseFloat(v.currentKm || 0).toLocaleString('en-IN')} KM
                          </span>
                        </div>
                      </div>

                      {/* Fuel Summary Stats */}
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold">Total Fuel Cost:</span>
                          <div className="font-black text-amber-600 dark:text-amber-400 text-sm">
                            {formatCurrency(totalVehicleFuelCost)}
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 uppercase font-bold">Total Liters:</span>
                          <div className="font-bold text-slate-800 dark:text-slate-200">
                            {totalVehicleFuelLtr.toFixed(1)} Ltr
                          </div>
                        </div>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="flex items-center justify-between gap-2 pt-2">
                        <button
                          onClick={() => {
                            setSelectedVehicleForFuel(v.id);
                            setIsFuelModalOpen(true);
                          }}
                          className="w-full py-2 px-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 rounded-xl text-xs font-extrabold border border-amber-500/20 transition flex items-center justify-center gap-1"
                        >
                          <Fuel className="w-3.5 h-3.5" /> + Diesel Entry
                        </button>

                        <Link
                          href={`/vehicles/${v.id}`}
                          className="py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-1 shrink-0"
                        >
                          Details <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* TAB 2: DIESEL FILLING LOGS TABLE */}
        {activeTab === 'DIESEL_LOGS' && (
          <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-950/80 text-slate-700 dark:text-slate-300 font-extrabold uppercase border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3.5">Date & Slip No</th>
                  <th className="px-4 py-3.5">Vehicle</th>
                  <th className="px-4 py-3.5">Driver</th>
                  <th className="px-4 py-3.5">Fuel Pump Vendor</th>
                  <th className="px-4 py-3.5 text-right">Liters (Ltr)</th>
                  <th className="px-4 py-3.5 text-right">Rate / Ltr</th>
                  <th className="px-4 py-3.5 text-right">Total Cost</th>
                  <th className="px-4 py-3.5 text-right">Odometer KM</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60 text-slate-900 dark:text-white font-semibold">
                {filteredFuelLogs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                      No diesel filling slips recorded yet.
                    </td>
                  </tr>
                ) : (
                  filteredFuelLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-extrabold">{new Date(log.date).toLocaleDateString('en-IN')}</div>
                        <div className="text-[10px] text-slate-400 font-bold">{log.expenseNo} {log.receiptNo ? `• ${log.receiptNo}` : ''}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-black text-amber-600 dark:text-amber-400">{log.vehicle?.vehicleNumber}</span>
                        <span className="text-[10px] text-slate-400 block">{log.vehicle?.vehicleType}</span>
                      </td>
                      <td className="px-4 py-3">{log.driver?.fullName || '—'}</td>
                      <td className="px-4 py-3 text-emerald-600 dark:text-emerald-400 font-bold">{log.vendor?.name || 'Cash Fuel'}</td>
                      <td className="px-4 py-3 text-right font-black text-amber-600 dark:text-amber-400">
                        {parseFloat(log.quantityLtr).toFixed(2)} Ltr
                      </td>
                      <td className="px-4 py-3 text-right font-bold">₹{parseFloat(log.ratePerLtr).toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-black text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(log.totalAmount)}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-slate-500">
                        {log.odometerKm ? `${parseFloat(log.odometerKm).toLocaleString('en-IN')} KM` : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <VehicleFormModal
        isOpen={isVehicleModalOpen}
        onClose={() => setIsVehicleModalOpen(false)}
        onSuccess={loadData}
      />

      <FuelExpenseModal
        isOpen={isFuelModalOpen}
        onClose={() => {
          setIsFuelModalOpen(false);
          setSelectedVehicleForFuel(null);
        }}
        defaultVehicleId={selectedVehicleForFuel}
        onSuccess={loadData}
      />
    </div>
  );
}
