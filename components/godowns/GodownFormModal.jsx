'use client';

import { useState, useEffect } from 'react';
import { X, Warehouse, MapPin, User, Scale, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function GodownFormModal({ isOpen, onClose, initialData = null, onSuccess }) {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    location: '',
    capacity: '',
    supervisor: '',
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        code: initialData.code || '',
        name: initialData.name || '',
        location: initialData.location || '',
        capacity: initialData.capacity ? initialData.capacity.toString() : '',
        supervisor: initialData.supervisor || '',
      });
    } else {
      setFormData({
        code: '',
        name: '',
        location: '',
        capacity: '',
        supervisor: '',
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Please enter godown / warehouse name!');
      return;
    }

    setLoading(true);

    try {
      const url = initialData ? `/api/godowns/${initialData.id}` : '/api/godowns';
      const method = initialData ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to save godown');
      }

      toast.success(
        initialData
          ? `🎉 Godown "${json.data?.name}" updated!`
          : `🎉 New Godown "${json.data?.name}" created!`
      );
      if (onSuccess) onSuccess();
      onClose();
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
              <Warehouse className="w-5 h-5 text-amber-400" />
              {initialData ? 'Edit Warehouse / Godown' : 'Add Godown (गोदाम / शेड जोड़ें)'}
            </h3>
            <p className="text-xs text-emerald-200 mt-0.5">Grain Storage Shed & Warehouse Registry</p>
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
          {/* Godown Code & Name */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="app-label">Code (कोड)</label>
              <input
                type="text"
                placeholder="Auto (GDN-01)"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="app-input font-bold uppercase text-emerald-700 dark:text-emerald-300"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="app-label">
                <Warehouse className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Warehouse Name (गोदाम का नाम) *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Main Mandi Storage Shed #1"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="app-input font-bold"
              />
            </div>
          </div>

          {/* Location & Storage Capacity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="app-label">
                <MapPin className="w-3.5 h-3.5 text-amber-500" /> Location / Address (स्थान)
              </label>
              <input
                type="text"
                placeholder="e.g. Krishi Upaj Mandi, Sehore"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="app-input"
              />
            </div>

            <div>
              <label className="app-label">
                <Scale className="w-3.5 h-3.5 text-emerald-500" /> Storage Capacity (क्षमता MT)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 5000 MT"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  className="app-input pr-12 font-bold"
                />
                <span className="absolute right-3.5 top-2.5 text-xs font-black text-slate-400">MT</span>
              </div>
            </div>
          </div>

          {/* Godown Supervisor */}
          <div>
            <label className="app-label">
              <User className="w-3.5 h-3.5 text-slate-500" /> In-Charge / Supervisor (गोदाम इंचार्ज)
            </label>
            <input
              type="text"
              placeholder="e.g. Rajesh Kumar Sharma (Mandi Supervisor)"
              value={formData.supervisor}
              onChange={(e) => setFormData({ ...formData, supervisor: e.target.value })}
              className="app-input"
            />
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
              {loading ? 'Saving...' : initialData ? 'Update Godown' : 'Save Godown (गोदाम दर्ज करें)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
