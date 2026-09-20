'use client';

import { useState, useEffect } from 'react';
import { X, Fuel, Calendar, Truck, User, DollarSign, Gauge, FileText, Landmark } from 'lucide-react';
import toast from 'react-hot-toast';

export default function FuelExpenseModal({ isOpen, onClose, defaultVehicleId = null, onSuccess }) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    vehicleId: '',
    driverId: '',
    vendorId: '',
    fuelType: 'DIESEL',
    quantityLtr: '',
    ratePerLtr: '94.50',
    odometerKm: '',
    receiptNo: '',
    notes: '',
  });

  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      Promise.all([
        fetch('/api/vehicles').then((r) => r.json()),
        fetch('/api/employees').then((r) => r.json()),
        fetch('/api/parties?role=VENDOR').then((r) => r.json()),
      ])
        .then(([vehRes, empRes, ptyRes]) => {
          if (vehRes.success) setVehicles(vehRes.data || []);
          if (empRes.success) setDrivers(empRes.data?.filter((e) => e.role === 'DRIVER') || []);
          if (ptyRes.success) setVendors(ptyRes.data || []);

          setFormData((prev) => ({
            ...prev,
            vehicleId: defaultVehicleId || vehRes.data?.[0]?.id || '',
            date: new Date().toISOString().split('T')[0],
          }));
        })
        .catch((err) => console.error('Error loading dropdown data:', err));
    }
  }, [isOpen, defaultVehicleId]);

  if (!isOpen) return null;

  const ltr = parseFloat(formData.quantityLtr) || 0;
  const rate = parseFloat(formData.ratePerLtr) || 0;
  const totalAmount = ltr * rate;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.vehicleId) {
      toast.error('Please select a vehicle!');
      return;
    }
    if (ltr <= 0) {
      toast.error('Please enter valid diesel quantity in liters!');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/fuel-expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          quantityLtr: ltr,
          ratePerLtr: rate,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to record fuel expense');
      }

      toast.success(`Diesel Filling Slip of ${ltr} Ltr (₹${totalAmount.toFixed(2)}) Recorded!`);
      if (onSuccess) onSuccess();
      onClose();

      setFormData({
        date: new Date().toISOString().split('T')[0],
        vehicleId: '',
        driverId: '',
        vendorId: '',
        fuelType: 'DIESEL',
        quantityLtr: '',
        ratePerLtr: '94.50',
        odometerKm: '',
        receiptNo: '',
        notes: '',
      });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="glass-modal rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden my-8 border border-slate-200/80 dark:border-slate-800 animate-in fade-in zoom-in duration-200 text-slate-900 dark:text-white">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-amber-600/40">
          <div>
            <h3 className="font-semibold text-base sm:text-lg flex items-center gap-2">
              <Fuel className="w-5 h-5 text-amber-300" /> Record Fuel Filling Slip
            </h3>
            <p className="text-xs text-amber-100/80 font-normal mt-0.5">Tractor, Truck, Trailer & Bike Fuel Log Entry</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition hover:scale-105"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Filling Date & Vehicle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="app-label">
                <Calendar className="w-3.5 h-3.5 text-amber-500" /> Filling Date *
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="app-input"
              />
            </div>

            <div>
              <label className="app-label">
                <Truck className="w-3.5 h-3.5 text-amber-500" /> Select Vehicle *
              </label>
              <select
                value={formData.vehicleId}
                onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                className="app-select font-semibold text-amber-600 dark:text-amber-400"
              >
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.vehicleNumber} ({v.vehicleType})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Driver & Fuel Pump Vendor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="app-label">
                <User className="w-3.5 h-3.5 text-slate-500" /> Driver
              </label>
              <select
                value={formData.driverId}
                onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
                className="app-select"
              >
                <option value="">Select Driver</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="app-label">
                <Landmark className="w-3.5 h-3.5 text-slate-500" /> Fuel Pump Vendor
              </label>
              <select
                value={formData.vendorId}
                onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
                className="app-select"
              >
                <option value="">Select Fuel Pump / Vendor</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Liters & Rate per Liter */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="app-label">
                <Fuel className="w-3.5 h-3.5 text-amber-500" /> Fuel Quantity (Liters) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 50.00"
                  value={formData.quantityLtr}
                  onChange={(e) => setFormData({ ...formData, quantityLtr: e.target.value })}
                  className="app-input pr-12 font-semibold text-amber-600 dark:text-amber-400"
                />
                <span className="absolute right-3.5 top-2.5 text-xs font-semibold text-slate-400">LTR</span>
              </div>
            </div>

            <div>
              <label className="app-label">
                <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> Rate per Ltr (₹/Ltr) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs font-semibold text-slate-400">₹</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="94.50"
                  value={formData.ratePerLtr}
                  onChange={(e) => setFormData({ ...formData, ratePerLtr: e.target.value })}
                  className="app-input pl-8 font-semibold text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Total Calculated Amount Display Box */}
          <div className="p-3.5 rounded-2xl bg-slate-900 text-white border border-amber-500/30 flex items-center justify-between shadow-md">
            <div>
              <div className="text-[11px] font-medium text-slate-400 uppercase">Calculated Total Fuel Cost</div>
              <div className="text-lg font-bold text-amber-400">
                ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div className="text-right text-xs text-amber-200/80 font-medium">
              {ltr > 0 ? `${ltr.toFixed(2)} Ltr × ₹${rate.toFixed(2)}` : 'Enter Liters'}
            </div>
          </div>

          {/* Odometer KM & Slip / Receipt No */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="app-label">
                <Gauge className="w-3.5 h-3.5 text-amber-500" /> Odometer Meter (KM)
              </label>
              <input
                type="number"
                step="any"
                placeholder="e.g. 45200"
                value={formData.odometerKm}
                onChange={(e) => setFormData({ ...formData, odometerKm: e.target.value })}
                className="app-input"
              />
            </div>

            <div>
              <label className="app-label">Slip / Receipt Number</label>
              <input
                type="text"
                placeholder="e.g. SLIP-99482"
                value={formData.receiptNo}
                onChange={(e) => setFormData({ ...formData, receiptNo: e.target.value })}
                className="app-input"
              />
            </div>
          </div>

          {/* Remarks / Notes */}
          <div>
            <label className="app-label">
              <FileText className="w-3.5 h-3.5 text-slate-500" /> Remarks / Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Diesel filled at Sehore Pump for Mandi to Godown paddy transport trip"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="app-textarea resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-2xl shadow-md transition disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? 'Recording...' : 'Record Fuel Slip'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
