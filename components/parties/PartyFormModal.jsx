'use client';

import { useState, useEffect } from 'react';
import { X, User, Phone, MapPin, Tag, Check, Banknote, Upload, Landmark, ShieldCheck, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const AVAILABLE_ROLES = [
  { id: 'FARMER', label: 'Farmer', desc: 'Sells paddy, wheat, gram, maize' },
  { id: 'RICE_MILL', label: 'Rice Mill', desc: 'Buys raw paddy, supplies processed rice' },
  { id: 'CUSTOMER', label: 'Customer', desc: 'Buys processed commodities' },
  { id: 'SUPPLIER', label: 'Supplier', desc: 'Grain or material supplier' },
  { id: 'VENDOR', label: 'Vendor / Fuel Pump', desc: 'Fuel pump, mechanics, spare parts' },
];

export default function PartyFormModal({ isOpen, onClose, onSuccess, initialData = null }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    alternatePhone: '',
    address: '',
    city: '',
    state: 'Uttar Pradesh',
    roles: ['FARMER'],
    openingBalance: 0,
    balanceType: 'RECEIVABLE',
    notes: '',
    avatarUrl: '',
    aadhaarNo: '',
    aadhaarDocUrl: '',
    panNo: '',
    panDocUrl: '',
    bankName: '',
    accountNo: '',
    ifscCode: '',
    bankDocUrl: '',
    khatauniDocUrl: '',
  });

  const [uploadingField, setUploadingField] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        phone: initialData.phone || '',
        alternatePhone: initialData.alternatePhone || '',
        address: initialData.address || '',
        city: initialData.city || '',
        state: initialData.state || 'Uttar Pradesh',
        roles: initialData.roles || ['FARMER'],
        openingBalance: initialData.openingBalance || 0,
        balanceType: initialData.balanceType || 'RECEIVABLE',
        notes: initialData.notes || '',
        avatarUrl: initialData.avatarUrl || '',
        aadhaarNo: initialData.aadhaarNo || '',
        aadhaarDocUrl: initialData.aadhaarDocUrl || '',
        panNo: initialData.panNo || '',
        panDocUrl: initialData.panDocUrl || '',
        bankName: initialData.bankName || '',
        accountNo: initialData.accountNo || '',
        ifscCode: initialData.ifscCode || '',
        bankDocUrl: initialData.bankDocUrl || '',
        khatauniDocUrl: initialData.khatauniDocUrl || '',
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // Generic File Upload Handler
  const handleFileUpload = async (e, fieldName) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append('file', file);

    setUploadingField(fieldName);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Upload failed');

      setFormData((prev) => ({ ...prev, [fieldName]: json.url }));
      toast.success('Document uploaded successfully!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploadingField(null);
    }
  };

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

    const isEdit = Boolean(initialData?.id);
    const endpoint = isEdit ? `/api/parties/${initialData.id}` : '/api/parties';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || `Failed to ${isEdit ? 'update' : 'create'} party`);
      }

      toast.success(
        isEdit
          ? `Party "${json.data?.name || formData.name}" updated!`
          : `Party "${json.data?.name || formData.name}" registered!`
      );
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="glass-modal rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-8 border border-slate-200/80 dark:border-slate-800 animate-in fade-in zoom-in duration-200 text-slate-900 dark:text-white max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-900 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-emerald-700/40">
          <div>
            <h3 className="font-semibold text-base sm:text-lg flex items-center gap-2">
              <User className="w-5 h-5 text-amber-400" /> New Party & Document Registration
            </h3>
            <p className="text-xs text-emerald-200/80 font-normal mt-0.5">Register Farmer, Rice Mill, Customer or Vendor with KYC Documents</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition hover:scale-105"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Party Name */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="app-label">
                <User className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Party Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Patel / National Rice Mill"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="app-input"
              />
            </div>

            <div>
              <label className="app-label">Profile Photo</label>
              <label className="cursor-pointer app-input flex items-center justify-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-dashed border-emerald-500/30 rounded-2xl">
                <Upload className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold truncate">
                  {uploadingField === 'avatarUrl' ? 'Uploading...' : formData.avatarUrl ? 'Photo Uploaded ✓' : 'Upload Photo'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'avatarUrl')}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Phone Numbers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="app-label">
                <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Mobile Number
              </label>
              <input
                type="tel"
                placeholder="98260XXXXX"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="app-input"
              />
            </div>

            <div>
              <label className="app-label">Alt Phone</label>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {AVAILABLE_ROLES.map((r) => {
                const isSelected = formData.roles.includes(r.id);
                return (
                  <button
                    type="button"
                    key={r.id}
                    onClick={() => toggleRole(r.id)}
                    className={`flex items-center justify-between p-2.5 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-500/10 text-emerald-950 dark:text-emerald-300 font-semibold shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-semibold">{r.label}</div>
                    </div>
                    {isSelected && (
                      <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Address & City */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="app-label">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Address / Village
              </label>
              <input
                type="text"
                placeholder="e.g. Village Pipariya, Sehore"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="app-input"
              />
            </div>

            <div>
              <label className="app-label">City / District</label>
              <input
                type="text"
                placeholder="e.g. Sehore"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="app-input"
              />
            </div>
          </div>

          {/* Bank Account Section */}
          <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/15 space-y-3">
            <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1 border-b border-emerald-500/20 pb-1">
              <Landmark className="w-3.5 h-3.5 text-amber-500" /> Bank Account & Passbook Upload
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="app-label text-[10px]">Bank Name</label>
                <input
                  type="text"
                  placeholder="e.g. State Bank of India"
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  className="app-input"
                />
              </div>

              <div>
                <label className="app-label text-[10px]">Account No</label>
                <input
                  type="text"
                  placeholder="e.g. 398402910482"
                  value={formData.accountNo}
                  onChange={(e) => setFormData({ ...formData, accountNo: e.target.value })}
                  className="app-input font-mono"
                />
              </div>

              <div>
                <label className="app-label text-[10px]">IFSC Code</label>
                <input
                  type="text"
                  placeholder="e.g. SBIN0000482"
                  value={formData.ifscCode}
                  onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })}
                  className="app-input uppercase font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Passbook / Chequebook Upload
              </span>
              <label className="cursor-pointer px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-sm">
                <Upload className="w-3.5 h-3.5" />
                {uploadingField === 'bankDocUrl' ? 'Uploading...' : formData.bankDocUrl ? 'Uploaded ✓' : 'Upload File'}
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileUpload(e, 'bankDocUrl')}
                  className="hidden"
                />
              </label>
            </div>
            {formData.bankDocUrl && (
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <ImageIcon className="w-3.5 h-3.5" />
                <a href={formData.bankDocUrl} target="_blank" rel="noreferrer" className="underline">View Bank Passbook</a>
              </div>
            )}
          </div>

          {/* KYC Documents (Aadhaar, PAN & Khatauni) */}
          <div className="p-4 bg-amber-500/5 rounded-2xl border border-amber-500/15 space-y-3">
            <div className="text-xs font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1 border-b border-amber-500/20 pb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500" /> Aadhaar, PAN & Khatauni Documents
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Aadhaar */}
              <div className="space-y-1.5">
                <label className="app-label text-[10px]">Aadhaar No</label>
                <input
                  type="text"
                  placeholder="e.g. 1234 - 5678"
                  value={formData.aadhaarNo}
                  onChange={(e) => setFormData({ ...formData, aadhaarNo: e.target.value })}
                  className="app-input font-mono"
                />
                <label className="cursor-pointer w-full py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 rounded-xl text-[11px] font-semibold transition flex items-center justify-center gap-1">
                  <Upload className="w-3 h-3" />
                  {uploadingField === 'aadhaarDocUrl' ? 'Uploading...' : formData.aadhaarDocUrl ? 'Aadhaar Uploaded ✓' : 'Upload Aadhaar'}
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileUpload(e, 'aadhaarDocUrl')}
                    className="hidden"
                  />
                </label>
              </div>

              {/* PAN Card */}
              <div className="space-y-1.5">
                <label className="app-label text-[10px]">PAN Card No</label>
                <input
                  type="text"
                  placeholder="e.g. ABCDE1234F"
                  value={formData.panNo}
                  onChange={(e) => setFormData({ ...formData, panNo: e.target.value })}
                  className="app-input uppercase font-mono"
                />
                <label className="cursor-pointer w-full py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 rounded-xl text-[11px] font-semibold transition flex items-center justify-center gap-1">
                  <Upload className="w-3 h-3" />
                  {uploadingField === 'panDocUrl' ? 'Uploading...' : formData.panDocUrl ? 'PAN Uploaded ✓' : 'Upload PAN'}
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileUpload(e, 'panDocUrl')}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Khatauni (Land Record) */}
              <div className="space-y-1.5">
                <label className="app-label text-[10px]">Khatauni Land Record</label>
                <div className="h-9" />
                <label className="cursor-pointer w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[11px] font-semibold transition flex items-center justify-center gap-1">
                  <Upload className="w-3 h-3" />
                  {uploadingField === 'khatauniDocUrl' ? 'Uploading...' : formData.khatauniDocUrl ? 'Khatauni Uploaded ✓' : 'Upload Khatauni'}
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileUpload(e, 'khatauniDocUrl')}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Opening Balance */}
          <div className="p-4 bg-slate-100/70 dark:bg-slate-950/80 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
              <Banknote className="w-4 h-4 text-amber-500" /> Opening Ledger Balance
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="app-label">Opening Balance (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={formData.openingBalance}
                  onChange={(e) => setFormData({ ...formData, openingBalance: e.target.value })}
                  className="app-input"
                />
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
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-xs font-semibold bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white rounded-2xl shadow-md transition disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? 'Saving...' : 'Save Party & Documents'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
