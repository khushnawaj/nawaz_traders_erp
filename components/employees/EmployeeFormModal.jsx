'use client';

import { useState, useEffect } from 'react';
import { X, User, Phone, MapPin, Shield, DollarSign, Calendar, Truck, Banknote, Upload, Landmark, ShieldCheck, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const ROLES = [
  { id: 'DRIVER', label: 'Driver', desc: 'Drives tractors, trucks, trailers, bikes' },
  { id: 'LOADER', label: 'Loader', desc: 'Paddy/Wheat bag loading & unloading' },
  { id: 'HELPER', label: 'Helper', desc: 'Mandi & vehicle helper' },
  { id: 'ACCOUNTANT', label: 'Accountant', desc: 'Ledger & voucher management' },
  { id: 'MANAGER', label: 'Manager', desc: 'Godown & operational supervisor' },
  { id: 'MANDI_SUPERVISOR', label: 'Mandi Supervisor', desc: 'Mandi procurement & weighment' },
  { id: 'LABOUR', label: 'Labour / Worker', desc: 'General warehouse & mandi worker' },
];

export default function EmployeeFormModal({ isOpen, onClose, onSuccess, initialData = null }) {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    role: 'DRIVER',
    salaryType: 'MONTHLY',
    baseSalary: 18000,
    joiningDate: new Date().toISOString().split('T')[0],
    avatarUrl: '',
    aadhaarNo: '',
    aadhaarDocUrl: '',
    panNo: '',
    panDocUrl: '',
    drivingLicenseNo: '',
    drivingLicenseDocUrl: '',
    bankName: '',
    accountNo: '',
    ifscCode: '',
    bankDocUrl: '',
  });

  const [uploadingField, setUploadingField] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        fullName: initialData.fullName || '',
        phone: initialData.phone || '',
        address: initialData.address || '',
        role: initialData.role || 'DRIVER',
        salaryType: initialData.salaryType || 'MONTHLY',
        baseSalary: initialData.baseSalary || 18000,
        joiningDate: initialData.joiningDate ? new Date(initialData.joiningDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        avatarUrl: initialData.avatarUrl || '',
        aadhaarNo: initialData.aadhaarNo || '',
        aadhaarDocUrl: initialData.aadhaarDocUrl || '',
        panNo: initialData.panNo || '',
        panDocUrl: initialData.panDocUrl || '',
        drivingLicenseNo: initialData.drivingLicenseNo || '',
        drivingLicenseDocUrl: initialData.drivingLicenseDocUrl || '',
        bankName: initialData.bankName || '',
        accountNo: initialData.accountNo || '',
        ifscCode: initialData.ifscCode || '',
        bankDocUrl: initialData.bankDocUrl || '',
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
    const endpoint = isEdit ? `/api/employees/${initialData.id}` : '/api/employees';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || `Failed to ${isEdit ? 'update' : 'register'} employee`);
      }

      toast.success(
        isEdit
          ? `Staff member "${json.data?.fullName || formData.fullName}" updated!`
          : `Staff member "${json.data?.fullName || formData.fullName}" registered!`
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
              <User className="w-5 h-5 text-amber-400" /> New Staff & Driver Registration
            </h3>
            <p className="text-xs text-emerald-200/80 font-normal mt-0.5">Register Drivers, Loaders & Staff with Aadhaar, DL & Bank Passbook Documents</p>
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
          {/* SECTION 1: Personal Info & Designation */}
          <div className="space-y-3">
            <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1 border-b border-slate-200/80 dark:border-slate-800 pb-1">
              <User className="w-3.5 h-3.5 text-amber-500" /> 1. Personal Info & Designation
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="app-label">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Santosh Kumar / Md Akram"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="app-label">Mobile Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="98765XXXXX"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="app-input"
                />
              </div>

              <div>
                <label className="app-label">Address / Village</label>
                <input
                  type="text"
                  placeholder="e.g. Mandi Colony, Sehore"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="app-input"
                />
              </div>
            </div>

            <div>
              <label className="app-label">Designation / Role *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="app-select font-medium text-emerald-700 dark:text-emerald-300"
              >
                {ROLES.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label} — {r.desc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* SECTION 2: Salary Structure */}
          <div className="p-4 bg-slate-100/70 dark:bg-slate-950/80 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
              <Banknote className="w-4 h-4 text-amber-500" /> Salary Structure & Joining Date
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="app-label">Salary Type</label>
                <select
                  value={formData.salaryType}
                  onChange={(e) => setFormData({ ...formData, salaryType: e.target.value })}
                  className="app-select"
                >
                  <option value="MONTHLY">MONTHLY</option>
                  <option value="DAILY">DAILY WAGE</option>
                  <option value="PER_TRIP">PER TRIP</option>
                </select>
              </div>

              <div>
                <label className="app-label">Base Salary (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={formData.baseSalary}
                  onChange={(e) => setFormData({ ...formData, baseSalary: e.target.value })}
                  className="app-input"
                />
              </div>

              <div>
                <label className="app-label">Joining Date</label>
                <input
                  type="date"
                  value={formData.joiningDate}
                  onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                  className="app-input"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: Bank Details & Passbook Upload */}
          <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/15 space-y-3">
            <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1 border-b border-emerald-500/20 pb-1">
              <Landmark className="w-3.5 h-3.5 text-amber-500" /> Bank Account & Passbook Details
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
                {uploadingField === 'bankDocUrl' ? 'Uploading...' : formData.bankDocUrl ? 'Uploaded ✓' : 'Upload Passbook'}
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

          {/* SECTION 4: Identity & Driver Documents (Aadhaar, PAN & Driving License) */}
          <div className="p-4 bg-amber-500/5 rounded-2xl border border-amber-500/15 space-y-3">
            <div className="text-xs font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1 border-b border-amber-500/20 pb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500" /> Identity Documents
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

              {/* Driving License */}
              <div className="space-y-1.5">
                <label className="app-label text-[10px]">Driving License</label>
                <input
                  type="text"
                  placeholder="e.g. MP04202100948"
                  value={formData.drivingLicenseNo}
                  onChange={(e) => setFormData({ ...formData, drivingLicenseNo: e.target.value })}
                  className="app-input uppercase font-mono"
                />
                <label className="cursor-pointer w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[11px] font-semibold transition flex items-center justify-center gap-1">
                  <Upload className="w-3 h-3" />
                  {uploadingField === 'drivingLicenseDocUrl' ? 'Uploading...' : formData.drivingLicenseDocUrl ? 'DL Uploaded ✓' : 'Upload DL Scan'}
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileUpload(e, 'drivingLicenseDocUrl')}
                    className="hidden"
                  />
                </label>
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
              {loading ? 'Saving...' : 'Save Staff & Documents'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
