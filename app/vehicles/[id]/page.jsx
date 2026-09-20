'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  Truck, 
  Fuel, 
  Gauge, 
  UserCheck, 
  ArrowLeft, 
  Plus, 
  Calendar, 
  Trash2, 
  DollarSign, 
  Scale, 
  Wrench,
  ShieldCheck,
  FileText,
  Bike
} from 'lucide-react';
import Breadcrumb from '@/components/layout/Breadcrumb';
import Loader from '@/components/common/Loader';
import toast from 'react-hot-toast';
import FuelExpenseModal from '@/components/vehicles/FuelExpenseModal';

export default function VehicleDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFuelModalOpen, setIsFuelModalOpen] = useState(false);

  const fetchVehicleDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/vehicles/${id}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch vehicle');

      setVehicle(json.data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchVehicleDetails();
  }, [id]);

  const handleDeleteVehicle = async () => {
    if (!confirm(`Are you sure you want to delete vehicle "${vehicle?.vehicleNumber}"?`)) return;

    try {
      const res = await fetch(`/api/vehicles/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to delete vehicle');

      toast.success('Vehicle deleted successfully');
      router.push('/vehicles');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <Loader text="Loading Vehicle Fleet Details..." subtext="Syncing diesel logs and assigned driver" size="lg" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <Truck className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Vehicle Not Found</h2>
        <Link href="/vehicles" className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Vehicles Directory
        </Link>
      </div>
    );
  }

  const assignedDriver = vehicle.employees?.[0];
  const fuelLogs = vehicle.fuelExpenses || [];
  const totalLiters = fuelLogs.reduce((acc, f) => acc + (parseFloat(f.quantityLtr) || 0), 0);
  const totalFuelCost = fuelLogs.reduce((acc, f) => acc + (parseFloat(f.totalAmount) || 0), 0);

  const isBikeType = vehicle.vehicleType.toLowerCase().includes('bike') || vehicle.vehicleType.toLowerCase().includes('scooter') || vehicle.vehicleType.toLowerCase().includes('motorcycle');

  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-200">
      {/* Breadcrumb Navigation & Delete Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <Breadcrumb items={[{ label: 'Fleet & Vehicles', href: '/vehicles' }, { label: vehicle.vehicleNumber }]} />

        <button
          onClick={handleDeleteVehicle}
          className="px-3.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-semibold flex items-center gap-1.5 transition"
        >
          <Trash2 className="w-4 h-4" /> Delete Vehicle
        </button>
      </div>

      {/* Vehicle Profile Hero Card */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-xl relative overflow-hidden space-y-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-3xl border border-amber-500/20 shadow-sm">
              {isBikeType ? <Bike className="w-8 h-8" /> : <Truck className="w-8 h-8" />}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white tracking-tight">
                  {vehicle.vehicleNumber}
                </h1>
                <span className="px-3 py-1 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 uppercase">
                  {vehicle.ownership}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-normal">
                {vehicle.vehicleType} {vehicle.model ? `• ${vehicle.model}` : ''}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsFuelModalOpen(true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-semibold px-4 py-2.5 rounded-2xl text-xs shadow-md transition transform hover:-translate-y-0.5"
          >
            <Fuel className="w-4 h-4 text-slate-950" /> Record Fuel Entry
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
          <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/50 dark:border-slate-800/50">
            <span className="text-[10px] font-medium uppercase text-slate-500 dark:text-slate-400 block">Assigned Driver</span>
            <span className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5 mt-1">
              <UserCheck className="w-4 h-4 text-amber-500" />
              {assignedDriver ? assignedDriver.fullName : 'Unassigned'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/50 dark:border-slate-800/50">
            <span className="text-[10px] font-medium uppercase text-slate-500 dark:text-slate-400 block">Odometer Reading</span>
            <span className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5 mt-1">
              <Gauge className="w-4 h-4 text-emerald-500" />
              {parseFloat(vehicle.currentKm || 0).toLocaleString('en-IN')} KM
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/50 dark:border-slate-800/50">
            <span className="text-[10px] font-medium uppercase text-slate-500 dark:text-slate-400 block">Total Diesel Consumed</span>
            <span className="text-sm font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 mt-1">
              <Fuel className="w-4 h-4" />
              {totalLiters.toFixed(2)} Liters
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/50 dark:border-slate-800/50">
            <span className="text-[10px] font-medium uppercase text-slate-500 dark:text-slate-400 block">Total Diesel Bill</span>
            <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mt-1">
              {formatCurrency(totalFuelCost)}
            </span>
          </div>
        </div>
      </div>

      {/* Fuel Filling History Ledger Table */}
      <div className="glass-card p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-xl space-y-4">
        <h3 className="font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <Fuel className="w-4 h-4 text-amber-500" /> Fuel Filling Ledger
        </h3>

        <div className="overflow-x-auto rounded-2xl border border-slate-200/60 dark:border-slate-800/60">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 font-semibold uppercase border-b border-slate-200/60 dark:border-slate-800/60">
              <tr>
                <th className="px-4 py-3">Date & Expense No</th>
                <th className="px-4 py-3">Driver</th>
                <th className="px-4 py-3">Fuel Pump Vendor</th>
                <th className="px-4 py-3 text-right">Liters</th>
                <th className="px-4 py-3 text-right">Rate / Ltr</th>
                <th className="px-4 py-3 text-right">Total Cost</th>
                <th className="px-4 py-3 text-right">Odometer KM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60 text-slate-900 dark:text-white font-medium">
              {fuelLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400 font-normal">
                    No fuel filling logs recorded for this vehicle.
                  </td>
                </tr>
              ) : (
                fuelLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold">{new Date(log.date).toLocaleDateString('en-IN')}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{log.expenseNo} {log.receiptNo ? `• ${log.receiptNo}` : ''}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{log.driver?.fullName || '—'}</td>
                    <td className="px-4 py-3 text-emerald-600 dark:text-emerald-400 font-semibold">{log.vendor?.name || 'Cash Fuel'}</td>
                    <td className="px-4 py-3 text-right font-semibold text-amber-600 dark:text-amber-400">
                      {parseFloat(log.quantityLtr).toFixed(2)} Ltr
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">₹{parseFloat(log.ratePerLtr).toFixed(2)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(log.totalAmount)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-500">
                      {log.odometerKm ? `${parseFloat(log.odometerKm).toLocaleString('en-IN')} KM` : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <FuelExpenseModal
        isOpen={isFuelModalOpen}
        onClose={() => setIsFuelModalOpen(false)}
        defaultVehicleId={vehicle.id}
        onSuccess={fetchVehicleDetails}
      />
    </div>
  );
}

