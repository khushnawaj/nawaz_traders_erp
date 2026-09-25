'use client';

import { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  RefreshCw,
  FileText,
  DollarSign,
  Building,
  Sparkles,
  Search,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function CompliancePage() {
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLicense, setNewLicense] = useState({
    title: '',
    category: 'WEIGHT_MACHINE',
    licenseNumber: '',
    issuingAuthority: '',
    expiryDate: '',
    reminderDays: '30',
    renewalFee: '',
    notes: '',
  });

  useEffect(() => {
    fetchLicenses();
  }, []);

  const fetchLicenses = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/compliance/licenses');
      const data = await res.json();
      if (data.success) {
        setLicenses(data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch compliance licenses');
    } finally {
      setLoading(false);
    }
  };

  const handleRenew = async (id, title) => {
    try {
      const res = await fetch('/api/compliance/licenses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'RENEW' }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`License "${title}" renewed for 1 year! 🎉`);
        fetchLicenses();
      } else {
        toast.error(data.error || 'Failed to renew');
      }
    } catch (err) {
      toast.error('Renewal error');
    }
  };

  const handleCreateLicense = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/compliance/licenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLicense),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('License renewal reminder saved!');
        setShowAddModal(false);
        setNewLicense({
          title: '',
          category: 'WEIGHT_MACHINE',
          licenseNumber: '',
          issuingAuthority: '',
          expiryDate: '',
          reminderDays: '30',
          renewalFee: '',
          notes: '',
        });
        fetchLicenses();
      } else {
        toast.error(data.error || 'Failed to create');
      }
    } catch (err) {
      toast.error('Error adding license');
    }
  };

  const filteredLicenses = licenses.filter((l) => {
    if (filterStatus === 'ALL') return true;
    return l.status === filterStatus;
  });

  const expiredCount = licenses.filter((l) => l.status === 'EXPIRED').length;
  const expiringSoonCount = licenses.filter((l) => l.status === 'EXPIRING_SOON').length;
  const validCount = licenses.filter((l) => l.status === 'VALID').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-emerald-950 border-b border-amber-500/20 shadow-2xl relative overflow-hidden">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" /> STATUTORY COMPLIANCE & TAX REMINDERS
                </span>
                <span className="text-slate-400 text-xs">• Mandi, Kirana & Vehicle License Tracker</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20">
                  <ShieldAlert className="w-7 h-7" />
                </div>
                License & Tax Renewal Manager
              </h1>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-lg shadow-amber-500/20 shrink-0"
            >
              <Plus className="w-4 h-4" /> Add Tax / License Reminder
            </button>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <div
              onClick={() => setFilterStatus('EXPIRED')}
              className="cursor-pointer bg-red-950/40 border border-red-500/30 rounded-2xl p-4 flex items-center justify-between hover:bg-red-950/60 transition"
            >
              <div>
                <div className="text-[10px] font-extrabold text-red-400 uppercase tracking-wider">
                  🔴 Expired / Overdue Tax
                </div>
                <div className="text-2xl font-black text-red-300">{expiredCount}</div>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-400 opacity-60" />
            </div>

            <div
              onClick={() => setFilterStatus('EXPIRING_SOON')}
              className="cursor-pointer bg-amber-950/40 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between hover:bg-amber-950/60 transition"
            >
              <div>
                <div className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider">
                  🟡 Due for Renewal Soon
                </div>
                <div className="text-2xl font-black text-amber-300">{expiringSoonCount}</div>
              </div>
              <Clock className="w-8 h-8 text-amber-400 opacity-60" />
            </div>

            <div
              onClick={() => setFilterStatus('VALID')}
              className="cursor-pointer bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between hover:bg-emerald-950/60 transition"
            >
              <div>
                <div className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider">
                  🟢 Valid & Up to Date
                </div>
                <div className="text-2xl font-black text-emerald-300">{validCount}</div>
              </div>
              <CheckCircle2 className="w-8 h-8 text-emerald-400 opacity-60" />
            </div>
          </div>
        </div>
      </div>

      {/* Main License Cards Grid */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Filters */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
          {['ALL', 'EXPIRED', 'EXPIRING_SOON', 'VALID'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                filterStatus === st
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {st === 'ALL' ? 'All Reminders' : st.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Grid of Licenses */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLicenses.map((lic) => {
            const isExpired = lic.status === 'EXPIRED';
            const isSoon = lic.status === 'EXPIRING_SOON';
            return (
              <div
                key={lic.id}
                className={`bg-slate-900/90 border rounded-2xl p-5 shadow-xl flex flex-col justify-between transition ${
                  isExpired
                    ? 'border-red-500/50 shadow-red-500/10'
                    : isSoon
                    ? 'border-amber-500/50 shadow-amber-500/10'
                    : 'border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-slate-800 text-amber-300 uppercase">
                      {lic.category.replace('_', ' ')}
                    </span>

                    {isExpired ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse">
                        🔴 EXPIRED ({Math.abs(lic.daysRemaining)} Days Ago)
                      </span>
                    ) : isSoon ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        🟡 DUE IN {lic.daysRemaining} DAYS
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        🟢 VALID ({lic.daysRemaining} Days Left)
                      </span>
                    )}
                  </div>

                  <h3 className="font-black text-sm text-white leading-snug mb-1">{lic.title}</h3>
                  <p className="text-xs text-slate-400 mb-3">
                    Dept / Authority: {lic.issuingAuthority || 'N/A'}
                  </p>

                  <div className="space-y-1.5 text-xs bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 mb-3">
                    <div className="flex justify-between">
                      <span className="text-slate-500">License / Doc No:</span>
                      <span className="font-mono text-white">{lic.licenseNumber || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Next Expiry Date:</span>
                      <span className="font-bold text-amber-300">
                        {new Date(lic.expiryDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Renewal Fee / Tax:</span>
                      <span className="font-extrabold text-emerald-400">₹{lic.renewalFee}</span>
                    </div>
                  </div>

                  {lic.notes && <p className="text-[11px] text-slate-400 italic mb-3">"{lic.notes}"</p>}
                </div>

                <button
                  onClick={() => handleRenew(lic.id, lic.title)}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white font-bold text-xs transition flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Mark Paid & Renew (+1 Year)
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL: ADD COMPLIANCE LICENSE */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-sm text-white">Add License / Tax Reminder</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLicense} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Title / Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Counter Scale Verification Tax, FSSAI License"
                  value={newLicense.title}
                  onChange={(e) => setNewLicense({ ...newLicense, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Category</label>
                  <select
                    value={newLicense.category}
                    onChange={(e) => setNewLicense({ ...newLicense, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-amber-500"
                  >
                    <option value="WEIGHT_MACHINE">Weight Machine Tax</option>
                    <option value="FSSAI">FSSAI License</option>
                    <option value="MANDI_LICENSE">Mandi License</option>
                    <option value="TRADE_LICENSE">Shop Act (Gumasta)</option>
                    <option value="VEHICLE_TAX">Vehicle Tax / Fitness</option>
                    <option value="GST">GST Registration</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">License / Doc No.</label>
                  <input
                    type="text"
                    placeholder="WMT/2026/001"
                    value={newLicense.licenseNumber}
                    onChange={(e) => setNewLicense({ ...newLicense, licenseNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Issuing Authority / Dept</label>
                <input
                  type="text"
                  placeholder="Legal Metrology Dept / FSSAI"
                  value={newLicense.issuingAuthority}
                  onChange={(e) => setNewLicense({ ...newLicense, issuingAuthority: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Expiry / Renewal Due Date *</label>
                  <input
                    required
                    type="date"
                    value={newLicense.expiryDate}
                    onChange={(e) => setNewLicense({ ...newLicense, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Renewal Fee / Tax (₹)</label>
                  <input
                    type="number"
                    placeholder="3500.00"
                    value={newLicense.renewalFee}
                    onChange={(e) => setNewLicense({ ...newLicense, renewalFee: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Notes / Details</label>
                <textarea
                  rows={2}
                  placeholder="Additional instructions..."
                  value={newLicense.notes}
                  onChange={(e) => setNewLicense({ ...newLicense, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition"
              >
                Save License Reminder
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
