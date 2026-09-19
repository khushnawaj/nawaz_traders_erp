'use client';

import { useState } from 'react';
import { X, User, Phone, MapPin, Tag, Check, Banknote } from 'lucide-react';
import toast from 'react-hot-toast';

const AVAILABLE_ROLES = [
  { id: 'FARMER', label: 'Farmer (किसान)', desc: 'Sells paddy, wheat, gram, maize' },
  { id: 'RICE_MILL', label: 'Rice Mill (राइस मिल)', desc: 'Buys raw paddy, supplies processed rice' },
  { id: 'CUSTOMER', label: 'Customer (ग्राहक)', desc: 'Buys processed commodities' },
  { id: 'SUPPLIER', label: 'Supplier (आपूर्तिकर्ता)', desc: 'Grain or material supplier' },
  { id: 'VENDOR', label: 'Vendor (विक्रेता / पंप)', desc: 'Diesel pump, mechanics, spare parts' },
];

export default function PartyFormModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    alternatePhone: '',
    address: '',
    city: '',
    state: 'Madhya Pradesh',
    roles: ['FARMER'],
    openingBalance: 0,
    balanceType: 'RECEIVABLE',
    notes: '',
  });

  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const toggleRole = (roleId) => {
    setFormData((prev) => {
      const exists = prev.roles.includes(roleId);
      if (exists) {
        if (prev.roles.length === 1) return prev;
        return { ...prev, roles: prev.roles.filter((r) => r !== roleId) };
      }
      return { ...prev, roles: [...prev.roles, roleId] };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/parties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to create party');
      }

      toast.success(`🎉 Party "${json.data?.name || formData.name}" registered!`);
      onSuccess();
      onClose();

      // Reset form
      setFormData({
        name: '',
        phone: '',
        alternatePhone: '',
        address: '',
        city: '',
        state: 'Madhya Pradesh',
        roles: ['FARMER'],
        openingBalance: 0,
        balanceType: 'RECEIVABLE',
        notes: '',
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
              <User className="w-5 h-5 text-amber-400" /> New Party Registration
            </h3>
            <p className="text-xs text-emerald-200 mt-0.5">Register Farmer, Rice Mill, Customer or Vendor</p>
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
          {/* Party Name */}
          <div>
            <label className="app-label">
              <User className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Party Name (नाम) *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Patel / National Rice Mill"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="app-input app-input-with-icon"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          {/* Phone Numbers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="app-label">
                <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Mobile Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  placeholder="98260XXXXX"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="app-input app-input-with-icon"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="app-label">Alt Phone (दूसरा नंबर)</label>
              <input
                type="tel"
                placeholder="Optional"
                value={formData.alternatePhone}
                onChange={(e) => setFormData({ ...formData, alternatePhone: e.target.value })}
                className="app-input"
              />
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label className="app-label">
              <Tag className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Party Roles / Type *
            </label>
            <div className="grid grid-cols-1 gap-2">
              {AVAILABLE_ROLES.map((r) => {
                const isSelected = formData.roles.includes(r.id);
                return (
                  <button
                    type="button"
                    key={r.id}
                    onClick={() => toggleRole(r.id)}
                    className={`flex items-center justify-between p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-500/10 text-emerald-950 dark:text-emerald-300 font-bold shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-extrabold">{r.label}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">{r.desc}</div>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Address & Village */}
          <div>
            <label className="app-label">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Village / Address (पता)
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Village Pipariya, Sehore"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="app-input app-input-with-icon"
              />
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          {/* Opening Balance */}
          <div className="p-4 bg-slate-100/70 dark:bg-slate-950/80 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800 dark:text-slate-200">
              <Banknote className="w-4 h-4 text-amber-500" /> Opening Ledger Balance
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="app-label">Opening Balance (₹)</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={formData.openingBalance}
                    onChange={(e) => setFormData({ ...formData, openingBalance: e.target.value })}
                    className="app-input pl-8 font-bold"
                  />
                  <span className="absolute left-3 top-2.5 font-bold text-slate-400">₹</span>
                </div>
              </div>

              <div>
                <label className="app-label">Balance Type</label>
                <select
                  value={formData.balanceType}
                  onChange={(e) => setFormData({ ...formData, balanceType: e.target.value })}
                  className="app-select"
                >
                  <option value="RECEIVABLE">RECEIVABLE (Lene hain - DR)</option>
                  <option value="PAYABLE">PAYABLE (Dene hain - CR)</option>
                </select>
              </div>
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
              {loading ? 'Registering...' : 'Save Party'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
