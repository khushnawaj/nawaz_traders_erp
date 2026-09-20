'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Truck, 
  Fuel, 
  Plus, 
  Search, 
  Gauge, 
  UserCheck, 
  DollarSign, 
  ChevronRight, 
  ShieldCheck,
  Bike as BikeIcon,
  Filter,
  CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';
import VehicleFormModal from '@/components/vehicles/VehicleFormModal';
import FuelExpenseModal from '@/components/vehicles/FuelExpenseModal';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { formatCurrency } from '@/lib/utils';

const VEHICLE_CATEGORIES = [
  { id: 'ALL', label: 'All Fleet Vehicles', iconComponent: Truck },
  { id: 'Tractor', label: 'Tractors', iconComponent: Truck },
  { id: 'Truck', label: 'Trucks', iconComponent: Truck },
  { id: 'Bike', label: 'Bikes & Scooters', iconComponent: BikeIcon },
  { id: 'Pickup', label: 'Pickups & Trailers', iconComponent: Truck },
];

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [fuelExpenses, setFuelExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [activeTab, setActiveTab] = useState('VEHICLES'); // VEHICLES, DIESEL_LOGS

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
  const tractorCount = vehicles.filter((v) => v.vehicleType?.toLowerCase().includes('tractor')).length;
  const truckCount = vehicles.filter((v) => v.vehicleType?.toLowerCase().includes('truck') || v.vehicleType?.toLowerCase().includes('trailer')).length;
  const bikeCount = vehicles.filter((v) => v.vehicleType?.toLowerCase().includes('bike') || v.vehicleType?.toLowerCase().includes('scooter') || v.vehicleType?.toLowerCase().includes('motorcycle')).length;
  const pickupCount = vehicles.filter((v) => v.vehicleType?.toLowerCase().includes('pickup')).length;

  const totalLiters = fuelExpenses.reduce((acc, curr) => acc + (parseFloat(curr.quantityLtr) || 0), 0);
  const totalDieselCost = fuelExpenses.reduce((acc, curr) => acc + (parseFloat(curr.totalAmount) || 0), 0);
  const avgDieselRate = totalLiters > 0 ? totalDieselCost / totalLiters : 0;
  const assignedDriversCount = vehicles.filter((v) => v.employees?.length > 0).length;

  // Filter Vehicles by search and category tab
  const filteredVehicles = vehicles.filter((v) => {
    const query = search.toLowerCase();
    const matchesSearch = (
      v.vehicleNumber.toLowerCase().includes(query) ||
      v.vehicleType.toLowerCase().includes(query) ||
      (v.model && v.model.toLowerCase().includes(query)) ||
      (v.employees?.[0]?.fullName && v.employees[0].fullName.toLowerCase().includes(query))
    );

    if (!matchesSearch) return false;

    if (selectedCategory === 'ALL') return true;
    if (selectedCategory === 'Tractor') return v.vehicleType?.toLowerCase().includes('tractor');
    if (selectedCategory === 'Truck') return v.vehicleType?.toLowerCase().includes('truck') || v.vehicleType?.toLowerCase().includes('trailer');
    if (selectedCategory === 'Bike') return v.vehicleType?.toLowerCase().includes('bike') || v.vehicleType?.toLowerCase().includes('scooter') || v.vehicleType?.toLowerCase().includes('motorcycle');
    if (selectedCategory === 'Pickup') return v.vehicleType?.toLowerCase().includes('pickup');

    return true;
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

  const renderVehicleIcon = (type = '') => {
    const t = type.toLowerCase();
    if (t.includes('bike') || t.includes('scooter') || t.includes('motorcycle')) {
      return <BikeIcon className="w-5 h-5" />;
    }
    return <Truck className="w-5 h-5" />;
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Breadcrumb items={[{ label: 'Fleet & Vehicles' }]} />
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white tracking-tight">
            Fleet Vehicles & Fuel Logs
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
            Track Tractors, Trucks, Pickups, Bikes, Fuel Slips & Driver Assignments
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap w-full sm:w-auto">
          <button
            onClick={() => setIsFuelModalOpen(true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-semibold px-4 py-2.5 rounded-2xl text-xs shadow-md transition transform active:scale-95"
          >
            <Fuel className="w-4 h-4" /> Record Fuel Slip
          </button>

          <button
            onClick={() => setIsVehicleModalOpen(true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-semibold px-4 py-2.5 rounded-2xl text-xs shadow-md transition transform active:scale-95"
          >
            <Plus className="w-4 h-4 text-amber-300" /> Add Vehicle
          </button>
        </div>
      </div>

      {/* 4-Card Fleet Metric Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4 sm:p-5 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-lg space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">Total Fleet Size</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-500/20">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">
            {totalVehicles} <span className="text-xs font-normal text-slate-500">Vehicles</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-normal pt-1 border-t border-slate-200/50 dark:border-slate-800/50 flex-wrap">
            <span className="flex items-center gap-1"><Truck className="w-3 h-3 text-amber-500" /> {tractorCount} Tractors</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Truck className="w-3 h-3 text-indigo-500" /> {truckCount} Trucks</span>
            <span>•</span>
            <span className="flex items-center gap-1"><BikeIcon className="w-3 h-3 text-purple-500" /> {bikeCount} Bikes</span>
          </div>
        </div>

        <div className="glass-card p-4 sm:p-5 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-lg space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">Total Fuel Expense</span>
            <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl border border-amber-500/20">
              <Fuel className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-semibold text-amber-600 dark:text-amber-400">
            {formatCurrency(totalDieselCost)}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-normal pt-1 border-t border-slate-200/50 dark:border-slate-800/50">
            {totalLiters.toFixed(1)} Liters Consumed
          </p>
        </div>

        <div className="glass-card p-4 sm:p-5 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-lg space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">Avg. Fuel Price</span>
            <div className="p-2 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-2xl border border-purple-500/20">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">
            ₹{avgDieselRate > 0 ? avgDieselRate.toFixed(2) : '94.50'}<span className="text-xs font-normal text-slate-500">/Ltr</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-normal pt-1 border-t border-slate-200/50 dark:border-slate-800/50">
            Weighted Average Rate
          </p>
        </div>

        <div className="glass-card p-4 sm:p-5 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-lg space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">Driver Duty Status</span>
            <div className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-500/20">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-semibold text-indigo-600 dark:text-indigo-400">
            {assignedDriversCount} / {totalVehicles}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-normal pt-1 border-t border-slate-200/50 dark:border-slate-800/50">
            Vehicles with Assigned Drivers
          </p>
        </div>
      </div>

      {/* Category Filter Pills & Search Bar */}
      <div className="glass-card p-4 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-lg space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {VEHICLE_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              const IconComp = cat.iconComponent;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Input & View Mode Switcher */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-72">
              <input
                type="text"
                placeholder="Search number plate, driver, model..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="app-input app-input-with-icon"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>

            <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-800/60">
              <button
                onClick={() => setActiveTab('VEHICLES')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  activeTab === 'VEHICLES'
                    ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Fleet Grid
              </button>
              <button
                onClick={() => setActiveTab('DIESEL_LOGS')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  activeTab === 'DIESEL_LOGS'
                    ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Fuel Slips
              </button>
            </div>
          </div>
        </div>

        {/* TAB 1: FLEET VEHICLES GRID */}
        {activeTab === 'VEHICLES' && (
          <>
            {loading ? (
              <div className="py-16 text-center space-y-2">
                <div className="w-7 h-7 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">Loading fleet directory...</p>
              </div>
            ) : filteredVehicles.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <Truck className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
                <p className="text-sm font-semibold text-slate-900 dark:text-white">No vehicles found</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                  Try adjusting search filter or click "+ Add Vehicle" to register a tractor, truck, or bike.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                {filteredVehicles.map((v) => {
                  const assignedDriver = v.employees?.[0];
                  const totalVehicleFuelLtr = v.fuelExpenses?.reduce((acc, f) => acc + (parseFloat(f.quantityLtr) || 0), 0) || 0;
                  const totalVehicleFuelCost = v.fuelExpenses?.reduce((acc, f) => acc + (parseFloat(f.totalAmount) || 0), 0) || 0;
                  const vehicleIcon = getVehicleIcon(v.vehicleType);

                  return (
                    <div
                      key={v.id}
                      className="glass-card p-5 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-lg space-y-4 hover:border-emerald-500/40 transition-all duration-200 group flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        {/* Top Card Bar: Icon + Reg No + Ownership Badge */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-2xl border border-emerald-500/20 group-hover:scale-105 transition-transform">
                              {vehicleIcon}
                            </div>
                            <div>
                              <h3 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight uppercase font-mono">
                                {v.vehicleNumber}
                              </h3>
                              <span className="text-xs text-slate-500 dark:text-slate-400 font-normal block">
                                {v.vehicleType} {v.model ? `• ${v.model}` : ''}
                              </span>
                            </div>
                          </div>

                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 uppercase">
                            {v.ownership}
                          </span>
                        </div>

                        {/* Duty Info Details Box */}
                        <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-950/60 text-xs border border-slate-200/50 dark:border-slate-800/50">
                          <div>
                            <span className="text-[10px] text-slate-400 font-medium uppercase block">Assigned Driver</span>
                            <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1 truncate mt-0.5">
                              <UserCheck className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              {assignedDriver ? assignedDriver.fullName : 'Unassigned'}
                            </span>
                          </div>

                          <div>
                            <span className="text-[10px] text-slate-400 font-medium uppercase block">Odometer Log</span>
                            <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1 mt-0.5 font-mono">
                              <Gauge className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              {parseFloat(v.currentKm || 0).toLocaleString('en-IN')} KM
                            </span>
                          </div>
                        </div>

                        {/* Lifetime Fuel Stats */}
                        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/50 dark:border-slate-800/50">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-medium">Total Fuel Spent</span>
                            <div className="font-semibold text-amber-600 dark:text-amber-400 text-sm mt-0.5">
                              {formatCurrency(totalVehicleFuelCost)}
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 uppercase font-medium">Liters Consumed</span>
                            <div className="font-semibold text-slate-900 dark:text-white mt-0.5 font-mono">
                              {totalVehicleFuelLtr.toFixed(1)} Ltr
                            </div>
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
                          className="w-full py-2 px-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 rounded-2xl text-xs font-semibold border border-amber-500/20 transition flex items-center justify-center gap-1.5"
                        >
                          <Fuel className="w-3.5 h-3.5" /> + Fuel Entry
                        </button>

                        <Link
                          href={`/vehicles/${v.id}`}
                          className="py-2 px-3 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white rounded-2xl text-xs font-semibold transition flex items-center justify-center gap-1 shrink-0"
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
          <div className="overflow-x-auto rounded-3xl border border-slate-200/60 dark:border-slate-800/60">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 font-semibold uppercase border-b border-slate-200/60 dark:border-slate-800/60">
                <tr>
                  <th className="px-4 py-3">Date & Slip No</th>
                  <th className="px-4 py-3">Vehicle</th>
                  <th className="px-4 py-3">Driver</th>
                  <th className="px-4 py-3">Fuel Pump Vendor</th>
                  <th className="px-4 py-3 text-right">Liters (Ltr)</th>
                  <th className="px-4 py-3 text-right">Rate / Ltr</th>
                  <th className="px-4 py-3 text-right">Total Cost</th>
                  <th className="px-4 py-3 text-right">Odometer KM</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60 text-slate-900 dark:text-white font-medium">
                {filteredFuelLogs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-500 font-normal">
                      No diesel filling slips recorded yet.
                    </td>
                  </tr>
                ) : (
                  filteredFuelLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="px-4 py-3">
                        <div className="font-semibold">{new Date(log.date).toLocaleDateString('en-IN')}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{log.expenseNo} {log.receiptNo ? `• ${log.receiptNo}` : ''}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-amber-600 dark:text-amber-400 font-mono">{log.vehicle?.vehicleNumber}</span>
                        <span className="text-[10px] text-slate-400 block">{log.vehicle?.vehicleType}</span>
                      </td>
                      <td className="px-4 py-3">{log.driver?.fullName || '—'}</td>
                      <td className="px-4 py-3 text-emerald-600 dark:text-emerald-400 font-semibold">{log.vendor?.name || 'Cash Fuel'}</td>
                      <td className="px-4 py-3 text-right font-semibold text-amber-600 dark:text-amber-400 font-mono">
                        {parseFloat(log.quantityLtr).toFixed(2)} Ltr
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">₹{parseFloat(log.ratePerLtr).toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(log.totalAmount)}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-500 font-mono">
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
    </main>
  );
}
