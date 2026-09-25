'use client';

import { useState, useEffect } from 'react';
import { X, User, Phone, MapPin, Landmark, Wheat, Check, Banknote, Upload, CreditCard, FileText, Image as ImageIcon, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function FarmerFormModal({ isOpen, onClose, onSuccess, initialData = null }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    alternatePhone: '',
    address: '', // Village
    city: '', // Tehsil / City
    state: 'Uttar Pradesh',
    roles: ['FARMER'],
    openingBalance: 0,
    balanceType: 'PAYABLE',
    notes: '',
    avatarUrl: '',
    aadhaarNo: '',
    aadhaarDocUrl: '',
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
        state: initialData.state || 'Madhya Pradesh',
        roles: initialData.roles || ['FARMER'],
        openingBalance: initialData.openingBalance || 0,
        balanceType: initialData.balanceType || 'PAYABLE',
        notes: initialData.notes || '',
        avatarUrl: initialData.avatarUrl || '',
        aadhaarNo: initialData.aadhaarNo || '',
        aadhaarDocUrl: initialData.aadhaarDocUrl || '',
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
        body: JSON.stringify({
          ...formData,
          roles: ['FARMER'],
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || `Failed to ${isEdit ? 'update' : 'register'} farmer`);
      }

      toast.success(
        isEdit
          ? `Farmer "${json.data?.name || formData.name}" updated!`
          : `Farmer "${json.data?.name || formData.name}" registered!`
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
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-emerald-700/40">
          <div>
            <h3 className="font-semibold text-base sm:text-lg flex items-center gap-2">
              <Wheat className="w-5 h-5 text-amber-400" /> New Farmer KYC & Profile
            </h3>
            <p className="text-xs text-emerald-200/80 font-normal mt-0.5">Registration, Bank Details, Aadhaar & Khatauni Land Record Upload</p>
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
          {/* SECTION 1: Personal & Location Details */}
          <div className="space-y-3">
            <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1 border-b border-slate-200/80 dark:border-slate-800 pb-1">
              <User className="w-3.5 h-3.5 text-amber-500" /> 1. Personal & Contact Info
            </div>

            {/* Farmer Name & Profile Avatar Upload */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="app-label">Farmer Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Patel / Shivraj Singh"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="app-input"
                />
              </div>

              <div>
                <label className="app-label">Farmer Photo</label>
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

            {/* Phone & Alt Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="app-label">Mobile Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="98260XXXXX"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="app-input"
                />
              </div>

              <div>
                <label className="app-label">Alternate Phone</label>
                <input
                  type="tel"
                  placeholder="Optional"
                  value={formData.alternatePhone}
                  onChange={(e) => setFormData({ ...formData, alternatePhone: e.target.value })}
                  className="app-input"
                />
              </div>
            </div>

            {/* Village & Tehsil */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="app-label">Village / Address</label>
                <input
                  type="text"
                  placeholder="e.g. Village Pipariya"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="app-input"
                />
              </div>

              <div>
                <label className="app-label">Tehsil / District</label>
                <input
                  type="text"
                  placeholder="e.g. Robertsganj / Ghorawal (Sonebhadra)"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="app-input"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Bank Account Details & Chequebook Upload */}
          <div className="space-y-3 p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/15">
            <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1 border-b border-emerald-500/20 pb-1">
              <Landmark className="w-3.5 h-3.5 text-amber-500" /> 2. Bank Account & Passbook Details
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

            {/* Passbook / Chequebook Upload */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Passbook / Chequebook Photo
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
                <a href={formData.bankDocUrl} target="_blank" rel="noreferrer" className="underline">View Bank Document</a>
              </div>
            )}
          </div>

          {/* SECTION 3: Identity & Land Documents (Aadhaar & Khatauni) */}
          <div className="space-y-3 p-4 bg-amber-500/5 rounded-2xl border border-amber-500/15">
            <div className="text-xs font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1 border-b border-amber-500/20 pb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500" /> 3. Identity & Land Records
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Aadhaar */}
              <div className="space-y-2">
                <label className="app-label">Aadhaar Card No</label>
                <input
                  type="text"
                  placeholder="e.g. 1234 - 5678 - 9012"
                  value={formData.aadhaarNo}
                  onChange={(e) => setFormData({ ...formData, aadhaarNo: e.target.value })}
                  className="app-input font-mono"
                />
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-normal">Aadhaar Photo Upload</span>
                  <label className="cursor-pointer px-3 py-1 bg-amber-600 hover:bg-amber-500 text-slate-950 rounded-xl text-xs font-semibold transition flex items-center gap-1">
                    <Upload className="w-3 h-3" />
                    {uploadingField === 'aadhaarDocUrl' ? 'Uploading...' : formData.aadhaarDocUrl ? 'Uploaded ✓' : 'Upload Aadhaar'}
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileUpload(e, 'aadhaarDocUrl')}
                      className="hidden"
                    />
                  </label>
                </div>
                {formData.aadhaarDocUrl && (
                  <div className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5" />
                    <a href={formData.aadhaarDocUrl} target="_blank" rel="noreferrer" className="underline">View Aadhaar Document</a>
                  </div>
                )}
              </div>

              {/* Khatauni */}
              <div className="space-y-2">
                <label className="app-label">Khatauni / Land Record</label>
                <div className="p-3 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Upload Land Record Photo</span>
                    <label className="cursor-pointer px-3 py-1 bg-amber-600 hover:bg-amber-500 text-slate-950 rounded-xl text-xs font-semibold transition flex items-center gap-1">
                      <Upload className="w-3 h-3" />
                      {uploadingField === 'khatauniDocUrl' ? 'Uploading...' : formData.khatauniDocUrl ? 'Uploaded ✓' : 'Upload Khatauni'}
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileUpload(e, 'khatauniDocUrl')}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {formData.khatauniDocUrl ? (
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <ImageIcon className="w-3.5 h-3.5" />
                      <a href={formData.khatauniDocUrl} target="_blank" rel="noreferrer" className="underline">View Khatauni Copy</a>
                    </div>
                  ) : (
                    <div className="text-[10px] text-slate-400 font-normal">Attach B1 / Khatauni land ownership paper</div>
                  )}
                </div>
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
                <label className="app-label">Balance Amount (₹)</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={formData.openingBalance}
                    onChange={(e) => setFormData({ ...formData, openingBalance: e.target.value })}
                    className="app-input pl-8"
                  />
                  <span className="absolute left-3 top-2.5 font-medium text-slate-400">₹</span>
                </div>
              </div>

              <div>
                <label className="app-label">Balance Type</label>
                <select
                  value={formData.balanceType}
                  onChange={(e) => setFormData({ ...formData, balanceType: e.target.value })}
                  className="app-select"
                >
                  <option value="PAYABLE">PAYABLE (Kisan ko dene hain - CR)</option>
                  <option value="RECEIVABLE">RECEIVABLE (Kisan se lene hain - DR)</option>
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
              {loading ? 'Saving Farmer & Docs...' : 'Save Farmer & Documents'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
