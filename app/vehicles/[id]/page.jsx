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
  FileText
} from 'lucide-react';
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
      toast.error(`❌ ${err.message}`);
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
      toast.error(`❌ ${err.message}`);
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
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500 dark:text-slate-400">
        Loading vehicle details...
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <Truck className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Vehicle Not Found</h2>
        <Link href="/vehicles" className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Vehicles List
        </Link>
      </div>
    );
  }

  const assignedDriver = vehicle.employees?.[0];
  const fuelLogs = vehicle.fuelExpenses || [];
  const totalLiters = fuelLogs.reduce((acc, f) => acc + (parseFloat(f.quantityLtr) || 0), 0);
  const totalFuelCost = fuelLogs.reduce((acc, f) => acc + (parseFloat(f.totalAmount) || 0), 0);

  return (
    <div className="max-w-[1550px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <Link
          href="/vehicles"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Vehicles Directory
        </Link>

        <button
          onClick={handleDeleteVehicle}
          className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-extrabold flex items-center gap-1.5 transition"
        >
          <Trash2 className="w-4 h-4" /> Delete Vehicle
        </button>
      </div>

      {/* Vehicle Profile Hero Card */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black text-3xl border border-amber-500/20 shadow-inner">
              {vehicle.vehicleType.includes('Tractor') ? '🚜' : vehicle.vehicleType.includes('Pickup') ? '🛻' : '🚛'}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {vehicle.vehicleNumber}
                </h1>
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                  {vehicle.ownership}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-bold">
                {vehicle.vehicleType} {vehicle.model ? `• ${vehicle.model}` : ''}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsFuelModalOpen(true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black px-5 py-2.5 rounded-2xl text-xs shadow-lg shadow-amber-950/20 transition-all transform hover:-translate-y-0.5"
          >
            <Fuel className="w-4 h-4" /> Record Diesel Entry (डीजल पर्ची)
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Assigned Driver</span>
            <span className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5 mt-1">
              <UserCheck className="w-4 h-4 text-amber-500" />
              {assignedDriver ? assignedDriver.fullName : 'Unassigned'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Odometer Reading</span>
            <span className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5 mt-1">
              <Gauge className="w-4 h-4 text-emerald-500" />
              {parseFloat(vehicle.currentKm || 0).toLocaleString('en-IN')} KM
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Total Diesel Consumed</span>
            <span className="text-sm font-black text-amber-600 dark:text-amber-400 flex items-center gap-1.5 mt-1">
              <Fuel className="w-4 h-4" />
              {totalLiters.toFixed(2)} Liters
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Total Diesel Bill</span>
            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mt-1">
              {formatCurrency(totalFuelCost)}
            </span>
          </div>
        </div>
      </div>

      {/* Fuel Filling History Ledger Table */}
      <div className="glass-card p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl space-y-4">
        <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <Fuel className="w-5 h-5 text-amber-500" /> Diesel Filling Ledger (डीजल पर्ची Log)
        </h3>

        <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-950/80 text-slate-700 dark:text-slate-300 font-extrabold uppercase border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3.5">Date & Expense No</th>
                <th className="px-4 py-3.5">Driver</th>
                <th className="px-4 py-3.5">Fuel Pump Vendor</th>
                <th className="px-4 py-3.5 text-right">Liters</th>
                <th className="px-4 py-3.5 text-right">Rate / Ltr</th>
                <th className="px-4 py-3.5 text-right">Total Cost</th>
                <th className="px-4 py-3.5 text-right">Odometer KM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60 text-slate-900 dark:text-white font-semibold">
              {fuelLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    No fuel filling logs recorded for this vehicle.
                  </td>
                </tr>
              ) : (
                fuelLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-extrabold">{new Date(log.date).toLocaleDateString('en-IN')}</div>
                      <div className="text-[10px] text-slate-400 font-bold">{log.expenseNo} {log.receiptNo ? `• ${log.receiptNo}` : ''}</div>
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
