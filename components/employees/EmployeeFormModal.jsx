'use client';

import { useState } from 'react';
import { X, User, Phone, MapPin, Shield, DollarSign, Calendar, Truck, Banknote } from 'lucide-react';
import toast from 'react-hot-toast';

const ROLES = [
  { id: 'DRIVER', label: 'Driver (ड्राइवर)', desc: 'Drives tractors, trucks, trailers' },
  { id: 'LOADER', label: 'Loader (हम्माल / लोडर)', desc: 'Paddy/Wheat bag loading & unloading' },
  { id: 'HELPER', label: 'Helper (हेल्पर)', desc: 'Mandi & vehicle helper' },
  { id: 'ACCOUNTANT', label: 'Accountant (अकाउंटेंट)', desc: 'Ledger & voucher management' },
  { id: 'MANAGER', label: 'Manager (मैनेजर)', desc: 'Godown & operational supervisor' },
  { id: 'MANDI_SUPERVISOR', label: 'Mandi Supervisor (मंडी सुपरवाइजर)', desc: 'Mandi procurement & weighment' },
  { id: 'LABOUR', label: 'Labour / Worker (मज़दूर)', desc: 'General warehouse & mandi worker' },
];

export default function EmployeeFormModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    role: 'DRIVER',
    salaryType: 'MONTHLY',
    baseSalary: 18000,
    joiningDate: new Date().toISOString().split('T')[0],
  });

  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to register employee');
      }

      toast.success(`🎉 Staff member "${json.data?.fullName || formData.fullName}" registered!`);
      onSuccess();
      onClose();

      // Reset form
      setFormData({
        fullName: '',
        phone: '',
        address: '',
        role: 'DRIVER',
        salaryType: 'MONTHLY',
        baseSalary: 18000,
        joiningDate: new Date().toISOString().split('T')[0],
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
              <User className="w-5 h-5 text-amber-400" /> New Staff Registration (कर्मचारी पंजीकरण)
            </h3>
            <p className="text-xs text-emerald-200 mt-0.5">Register Drivers, Loaders, Helpers, Managers & Labours</p>
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
          {/* Full Name */}
          <div>
            <label className="app-label">
              <User className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Full Name (कर्मचारी का नाम) *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="e.g. Santosh Kumar / Kailash Sharma"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="app-input app-input-with-icon"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          {/* Mobile & Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="app-label">
                <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Mobile Number *
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  placeholder="98765XXXXX"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="app-input app-input-with-icon"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="app-label">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Address / Village
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Mandi Colony, Sehore"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="app-input app-input-with-icon"
                />
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label className="app-label">
              <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Designation / Role *
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="app-select"
            >
              {ROLES.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label} — {r.desc}
                </option>
              ))}
            </select>
          </div>

          {/* Salary Type & Base Salary */}
          <div className="p-4 bg-slate-100/70 dark:bg-slate-950/80 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800 dark:text-slate-200">
              <Banknote className="w-4 h-4 text-amber-500" /> Salary Structure
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="app-label">Salary Type</label>
                <select
                  value={formData.salaryType}
                  onChange={(e) => setFormData({ ...formData, salaryType: e.target.value })}
                  className="app-select"
                >
                  <option value="MONTHLY">MONTHLY (महीना सैलरी)</option>
                  <option value="DAILY">DAILY WAGE (दैनिक दिहाड़ी)</option>
                  <option value="PER_TRIP">PER TRIP (प्रति ट्रिप)</option>
                </select>
              </div>

              <div>
                <label className="app-label">Base Salary (₹)</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={formData.baseSalary}
                    onChange={(e) => setFormData({ ...formData, baseSalary: e.target.value })}
                    className="app-input pl-8 font-bold"
                  />
                  <span className="absolute left-3 top-2.5 font-bold text-slate-400">₹</span>
                </div>
              </div>
            </div>
          </div>

          {/* Joining Date */}
          <div>
            <label className="app-label">
              <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Joining Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={formData.joiningDate}
                onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                className="app-input app-input-with-icon"
              />
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
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
              {loading ? 'Saving Staff...' : 'Save Staff Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
