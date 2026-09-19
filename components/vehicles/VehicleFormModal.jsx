'use client';

import { useState, useEffect } from 'react';
import { X, Truck, User, Gauge, Shield, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const VEHICLE_TYPES = [
  { id: 'Tractor', label: 'Tractor (ट्रैक्टर / ट्रॉली)', icon: '🚜' },
  { id: 'Truck 10-Wheeler', label: 'Truck 10-Wheeler (ट्रक 10 व्हीलर)', icon: '🚛' },
  { id: 'Truck 6-Wheeler', label: 'Truck 6-Wheeler (हाफ बॉडी ट्रक)', icon: '🚚' },
  { id: 'Trailer 14-Wheeler', label: 'Trailer 14-Wheeler (ट्रेलर)', icon: '🚛' },
  { id: 'Pickup', label: 'Bolero Pickup (पिकअप)', icon: '🛻' },
];

export default function VehicleFormModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    vehicleNumber: '',
    vehicleType: 'Tractor',
    model: '',
    ownership: 'OWNED', // OWNED or HIRED
    currentKm: '0',
    assignedDriverId: '',
  });

  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/employees')
        .then((res) => res.json())
        .then((json) => {
          if (json.success) {
            const driverList = json.data?.filter((e) => e.role === 'DRIVER') || [];
            setDrivers(driverList);
          }
        })
        .catch((err) => console.error('Error fetching drivers:', err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.vehicleNumber) {
      toast.error('Please enter vehicle registration number');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to register vehicle');
      }

      toast.success(`🎉 Vehicle "${json.data?.vehicleNumber}" registered!`);
      onSuccess();
      onClose();

      setFormData({
        vehicleNumber: '',
        vehicleType: 'Tractor',
        model: '',
        ownership: 'OWNED',
        currentKm: '0',
        assignedDriverId: '',
      });
    } catch (err) {
      toast.error(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="glass-modal rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden my-8 border border-slate-200/80 dark:border-slate-800 animate-in fade-in zoom-in duration-200 text-slate-900 dark:text-white">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-900 to-slate-900 text-white p-5 flex items-center justify-between border-b border-emerald-700/40">
          <div>
            <h3 className="font-extrabold text-lg flex items-center gap-2">
              <Truck className="w-5 h-5 text-amber-400" /> New Vehicle Registry (वाहन पंजीकरण)
            </h3>
            <p className="text-xs text-emerald-200 mt-0.5">Register Tractors, Trucks, Trailers & Pickups</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition hover:scale-105"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Vehicle Reg Number & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="app-label">
                <Truck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Registration No. (गाड़ी नंबर) *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. MP04AB1234"
                value={formData.vehicleNumber}
                onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                className="app-input font-black uppercase text-emerald-700 dark:text-emerald-300"
              />
            </div>

            <div>
              <label className="app-label">Vehicle Category *</label>
              <select
                value={formData.vehicleType}
                onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                className="app-select"
              >
                {VEHICLE_TYPES.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.icon} {v.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Model / Make & Ownership */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="app-label">Model / Make (मॉडल / नाम)</label>
              <input
                type="text"
                placeholder="e.g. Mahindra 575 DI / Tata 1613"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="app-input"
              />
            </div>

            <div>
              <label className="app-label">Ownership Type *</label>
              <select
                value={formData.ownership}
                onChange={(e) => setFormData({ ...formData, ownership: e.target.value })}
                className="app-select"
              >
                <option value="OWNED">OWNED (कंपनी का खुद का)</option>
                <option value="HIRED">HIRED (किराये की गाड़ी)</option>
              </select>
            </div>
          </div>

          {/* Starting Odometer KM & Assigned Driver */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="app-label">
                <Gauge className="w-3.5 h-3.5 text-amber-500" /> Current Odometer (KM / मीटर)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                placeholder="e.g. 45000"
                value={formData.currentKm}
                onChange={(e) => setFormData({ ...formData, currentKm: e.target.value })}
                className="app-input font-bold"
              />
            </div>

            <div>
              <label className="app-label">
                <User className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Assigned Driver
              </label>
              <select
                value={formData.assignedDriverId}
                onChange={(e) => setFormData({ ...formData, assignedDriverId: e.target.value })}
                className="app-select"
              >
                <option value="">No Driver Assigned (कोई नहीं)</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    👨‍✈️ {d.fullName} {d.phone ? `— 📞 ${d.phone}` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-xs font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-950/20 transition disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? 'Saving Vehicle...' : 'Save Vehicle (गाड़ी दर्ज करें)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
