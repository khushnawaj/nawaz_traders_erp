'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  User, 
  Phone, 
  MapPin, 
  ArrowLeft, 
  Receipt, 
  Calendar, 
  Truck, 
  DollarSign, 
  Briefcase,
  Camera,
  CheckCircle,
  XCircle,
  Copy,
  Edit,
  Upload,
  Share2,
  Eye,
  ShieldCheck,
  Clock
} from 'lucide-react';
import ProfileAvatarModal from '@/components/common/ProfileAvatarModal';
import EmployeeFormModal from '@/components/employees/EmployeeFormModal';
import DocumentPreviewModal from '@/components/common/DocumentPreviewModal';
import AttendanceCalendar from '@/components/employees/AttendanceCalendar';
import Loader from '@/components/common/Loader';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function EmployeeProfilePage() {
  const params = useParams();
  const id = params?.id;

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Document Lightbox Preview State
  const [previewDocUrl, setPreviewDocUrl] = useState(null);
  const [previewDocTitle, setPreviewDocTitle] = useState('');
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  const openDocPreview = (url, title) => {
    setPreviewDocUrl(url);
    setPreviewDocTitle(title);
    setIsPreviewModalOpen(true);
  };

  const fetchProfile = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/employees/${id}`);
      const json = await res.json();
      if (json.success) {
        setEmployee(json.data);
      }
    } catch (err) {
      console.error('Error fetching employee profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const handleCopyBankDetails = () => {
    if (!employee?.accountNo && !employee?.bankName) {
      toast.error('No bank details available to copy');
      return;
    }
    const text = `Account Holder: ${employee.fullName}\nBank Name: ${employee.bankName || 'N/A'}\nAccount No: ${employee.accountNo || 'N/A'}\nIFSC Code: ${employee.ifscCode || 'N/A'}`;
    navigator.clipboard.writeText(text);
    toast.success('Bank details copied to clipboard!');
  };

  const handleShareWhatsApp = () => {
    const salaryStr = `${formatCurrency(employee.baseSalary)} (${employee.salaryType})`;
    const message = `*NAWAZ TRADERS - STAFF STATEMENT*\n*Employee Name:* ${employee.fullName}\n*Employee Code:* ${employee.employeeCode}\n*Designation:* ${employee.role}\n*Mobile:* ${employee.phone || 'N/A'}\n*Base Salary:* ${salaryStr}\n\nThank you for working with Nawaz Traders!`;
    const cleanPhone = employee.phone ? employee.phone.replace(/[^0-9]/g, '') : '';
    const phoneParam = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const url = `https://wa.me/${phoneParam}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <Loader text="Loading Employee Profile..." subtext="Syncing attendance logs and driver trips" size="lg" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="max-w-7xl mx-auto p-6 text-center">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Employee Not Found</h2>
        <Link href="/employees" className="text-emerald-600 dark:text-emerald-400 font-bold text-sm mt-2 inline-block">
          ← Back to Staff Directory
        </Link>
      </div>
    );
  }

  const presentDays = employee.attendances?.filter((a) => a.status === 'PRESENT').length || 0;
  const totalOvertime = employee.attendances?.reduce((acc, a) => acc + (parseFloat(a.overtimeHr) || 0), 0) || 0;

  return (
    <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-200">
      {/* Breadcrumb Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <Breadcrumb items={[{ label: 'Staff & Drivers', href: '/employees' }, { label: employee.fullName }]} />

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleShareWhatsApp}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-medium shadow-sm transition"
            title="Share Statement on WhatsApp"
          >
            <Share2 className="w-3.5 h-3.5" /> WhatsApp Share
          </button>

          <span className="text-xs font-mono font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg uppercase">
            {employee.employeeCode}
          </span>
          <span className="text-xs font-semibold text-white bg-slate-800 dark:bg-slate-700 px-2.5 py-1 rounded-lg uppercase border border-slate-700">
            {employee.role}
          </span>
        </div>
      </div>

      {/* Hero Profile Card */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-xl relative overflow-hidden space-y-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
          <div className="flex items-center gap-5">
            {/* Avatar Picture */}
            <div className="relative group cursor-pointer" onClick={() => setIsAvatarModalOpen(true)}>
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl overflow-hidden border-2 border-purple-500/40 shadow-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center group-hover:opacity-90 transition">
                {employee.avatarUrl ? (
                  <img src={employee.avatarUrl} alt={employee.fullName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white font-bold text-3xl">
                    {employee.fullName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="absolute inset-0 bg-slate-950/40 rounded-3xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <span className="absolute -bottom-1 -right-1 p-1.5 bg-purple-600 text-white rounded-xl shadow-md">
                <Camera className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">
                  {employee.fullName}
                </h1>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="inline-flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 hover:underline font-medium bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20"
                >
                  <Edit className="w-3 h-3" /> Edit Profile & Docs
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-normal">
                {employee.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> {employee.phone}
                  </span>
                )}
                {employee.address && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-500" /> {employee.address}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> Joined: {employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString('en-IN') : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <button
              onClick={handleCopyBankDetails}
              className="flex-1 lg:flex-none bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white px-4 py-2.5 rounded-2xl text-xs font-semibold shadow-md transition flex items-center justify-center gap-2"
            >
              <Copy className="w-4 h-4 text-purple-400" /> Copy Bank Details
            </button>
          </div>
        </div>

        {/* Financial & Job Metrics Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
          <div className="p-3.5 bg-slate-50/80 dark:bg-slate-950/60 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
            <span className="text-[10px] font-medium uppercase text-slate-500 dark:text-slate-400 block">Base Salary Structure</span>
            <div className="text-lg font-semibold text-slate-900 dark:text-white mt-0.5">{formatCurrency(employee.baseSalary)}</div>
            <span className="text-[10px] text-slate-400 uppercase font-medium">{employee.salaryType} Rate</span>
          </div>

          <div className="p-3.5 bg-slate-50/80 dark:bg-slate-950/60 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
            <span className="text-[10px] font-medium uppercase text-slate-500 dark:text-slate-400 block">Attendance & Overtime Log</span>
            <div className="text-lg font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">{presentDays} Days Present</div>
            <span className="text-[10px] text-slate-400">{totalOvertime} Overtime Hours Logged</span>
          </div>

          <div className="p-3.5 bg-slate-50/80 dark:bg-slate-950/60 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
            <span className="text-[10px] font-medium uppercase text-slate-500 dark:text-slate-400 block">Assigned Fleet Vehicle</span>
            <div className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5 flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-indigo-500" />
              {employee.assignedVehicle ? employee.assignedVehicle.vehicleNumber : 'No Vehicle Assigned'}
            </div>
            <span className="text-[10px] text-slate-400 font-normal">Active Fleet Duty</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-200/60 dark:border-slate-800/60 flex gap-2 overflow-x-auto pb-0.5">
        {[
          { id: 'overview', label: 'Employee Profile', icon: User },
          { id: 'attendance', label: 'Attendance Log', icon: Calendar },
          { id: 'ledger', label: 'Salary & Advances', icon: Receipt },
          { id: 'trips', label: 'Driver Trips', icon: Truck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 font-semibold text-xs rounded-t-2xl transition border-b-2 whitespace-nowrap ${
                isActive
                  ? 'border-purple-600 text-purple-600 dark:text-purple-400 bg-white dark:bg-slate-900 shadow-sm'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-purple-500' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & DOCUMENT VAULT */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card p-5 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-lg space-y-4">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm border-b border-slate-200/60 dark:border-slate-800/60 pb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Personal & Job Info
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block font-normal">Employee Code</span>
                <span className="font-semibold text-slate-900 dark:text-white">{employee.employeeCode}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block font-normal">Full Name</span>
                <span className="font-semibold text-slate-900 dark:text-white">{employee.fullName}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block font-normal">Mobile Number</span>
                <span className="font-semibold text-slate-900 dark:text-white">{employee.phone || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block font-normal">Designation / Role</span>
                <span className="font-semibold text-slate-900 dark:text-white">{employee.role}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block font-normal">Address</span>
                <span className="font-semibold text-slate-900 dark:text-white">{employee.address || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block font-normal">Joining Date</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString('en-IN') : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          <div className="glass-card p-5 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-lg space-y-4">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm border-b border-slate-200/60 dark:border-slate-800/60 pb-2 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-amber-500" /> Salary Structure & Duty
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block font-normal">Salary Type</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{employee.salaryType}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block font-normal">Base Salary Amount</span>
                <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(employee.baseSalary)}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block font-normal">Assigned Vehicle</span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  {employee.assignedVehicle ? employee.assignedVehicle.vehicleNumber : 'Not Assigned'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block font-normal">Current Status</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{employee.status}</span>
              </div>
            </div>
          </div>

          {/* KYC & Bank Documents Vault */}
          <div className="glass-card p-5 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-lg space-y-4 md:col-span-2">
            <div className="border-b border-slate-200/60 dark:border-slate-800/60 pb-2 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" /> KYC & Driving License Vault
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyBankDetails}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] rounded-xl shadow-sm transition flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" /> Copy Bank Details
                </button>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-[11px] rounded-xl shadow-sm transition flex items-center gap-1"
                >
                  <Upload className="w-3 h-3" /> Upload / Edit Docs
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              {/* Aadhaar Card */}
              <div className="bg-slate-50/80 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 flex flex-col justify-between space-y-2">
                <div>
                  <span className="text-[10px] font-medium uppercase text-slate-500 dark:text-slate-400 block">Aadhaar Card No</span>
                  <span className="font-semibold text-slate-900 dark:text-white text-sm font-mono">{employee.aadhaarNo || 'N/A'}</span>
                </div>
                {employee.aadhaarDocUrl ? (
                  <button
                    onClick={() => openDocPreview(employee.aadhaarDocUrl, `${employee.fullName} — Aadhaar Card`)}
                    className="inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-semibold hover:underline pt-2 border-t border-slate-200/60 dark:border-slate-800/60"
                  >
                    <Eye className="w-3.5 h-3.5" /> View Aadhaar Scan (In-App) ↗
                  </button>
                ) : (
                  <button onClick={() => setIsEditModalOpen(true)} className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium underline pt-2 border-t border-slate-200/60 dark:border-slate-800/60 text-left">
                    + Upload Aadhaar Doc
                  </button>
                )}
              </div>

              {/* PAN Card */}
              <div className="bg-slate-50/80 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 flex flex-col justify-between space-y-2">
                <div>
                  <span className="text-[10px] font-medium uppercase text-slate-500 dark:text-slate-400 block">PAN Card No</span>
                  <span className="font-semibold text-slate-900 dark:text-white text-sm font-mono uppercase">{employee.panNo || 'N/A'}</span>
                </div>
                {employee.panDocUrl ? (
                  <button
                    onClick={() => openDocPreview(employee.panDocUrl, `${employee.fullName} — PAN Card`)}
                    className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold hover:underline pt-2 border-t border-slate-200/60 dark:border-slate-800/60"
                  >
                    <Eye className="w-3.5 h-3.5" /> View PAN Card (In-App) ↗
                  </button>
                ) : (
                  <button onClick={() => setIsEditModalOpen(true)} className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium underline pt-2 border-t border-slate-200/60 dark:border-slate-800/60 text-left">
                    + Upload PAN Doc
                  </button>
                )}
              </div>

              {/* Driving License */}
              <div className="bg-slate-50/80 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 flex flex-col justify-between space-y-2">
                <div>
                  <span className="text-[10px] font-medium uppercase text-slate-500 dark:text-slate-400 block">Driving License No</span>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400 text-sm font-mono uppercase">{employee.drivingLicenseNo || 'N/A'}</span>
                </div>
                {employee.drivingLicenseDocUrl ? (
                  <button
                    onClick={() => openDocPreview(employee.drivingLicenseDocUrl, `${employee.fullName} — Driving License`)}
                    className="inline-flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline pt-2 border-t border-slate-200/60 dark:border-slate-800/60"
                  >
                    <Eye className="w-3.5 h-3.5" /> View DL Scan (In-App) ↗
                  </button>
                ) : (
                  <button onClick={() => setIsEditModalOpen(true)} className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium underline pt-2 border-t border-slate-200/60 dark:border-slate-800/60 text-left">
                    + Upload Driving License
                  </button>
                )}
              </div>

              {/* Bank Passbook / Chequebook */}
              <div className="bg-slate-50/80 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 flex flex-col justify-between space-y-2">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-medium uppercase text-slate-500 dark:text-slate-400 block">Bank A/C & IFSC</span>
                    <button onClick={handleCopyBankDetails} className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold hover:underline flex items-center gap-0.5">
                      <Copy className="w-2.5 h-2.5" /> Copy
                    </button>
                  </div>
                  <div className="font-semibold text-slate-900 dark:text-white text-xs mt-0.5">
                    {employee.bankName ? `${employee.bankName}` : 'Bank N/A'}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    A/C: {employee.accountNo || 'N/A'}
                  </div>
                </div>
                {employee.bankDocUrl ? (
                  <button
                    onClick={() => openDocPreview(employee.bankDocUrl, `${employee.fullName} — Bank Passbook`)}
                    className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold hover:underline pt-2 border-t border-slate-200/60 dark:border-slate-800/60"
                  >
                    <Eye className="w-3.5 h-3.5" /> View Passbook (In-App) ↗
                  </button>
                ) : (
                  <button onClick={() => setIsEditModalOpen(true)} className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium underline pt-2 border-t border-slate-200/60 dark:border-slate-800/60 text-left">
                    + Upload Passbook
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ATTENDANCE LOG */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          <AttendanceCalendar
            employeeId={employee.id}
            employeeName={employee.fullName}
            onAttendanceChange={() => fetchProfile()}
          />

          {/* Detailed Logs History Table */}
          <div className="glass-card rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-xl overflow-hidden">
            <div className="p-4 border-b border-slate-200/60 dark:border-slate-800/60 bg-slate-100/80 dark:bg-slate-900/60 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Attendance History & Overtime Logs</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">Recent recorded daily logs and overtime hours</p>
              </div>
            </div>
            {!employee.attendances || employee.attendances.length === 0 ? (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs font-normal">
                No attendance logs recorded for this employee yet. Click dates on the calendar above to start logging!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 font-semibold uppercase border-b border-slate-200/60 dark:border-slate-800/60">
                    <tr>
                      <th className="p-3">Date</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Overtime (Hrs)</th>
                      <th className="p-3">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60 font-medium">
                    {employee.attendances.map((att) => (
                      <tr key={att.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <td className="p-3 text-slate-800 dark:text-slate-200 font-medium">
                          {new Date(att.date).toLocaleDateString('en-IN')}
                        </td>
                        <td className="p-3">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-semibold ${
                            att.status === 'PRESENT' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20' :
                            att.status === 'HALF_DAY' ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20' : 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20'
                          }`}>
                            {att.status === 'PRESENT' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            {att.status}
                          </span>
                        </td>
                        <td className="p-3 text-right font-semibold text-slate-900 dark:text-white">
                          {parseFloat(att.overtimeHr) > 0 ? `${att.overtimeHr} hrs` : '-'}
                        </td>
                        <td className="p-3 text-slate-600 dark:text-slate-400">{att.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: SALARY & ADVANCE LEDGER */}
      {activeTab === 'ledger' && (
        <div className="glass-card rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-xl overflow-hidden">
          <div className="p-4 border-b border-slate-200/60 dark:border-slate-800/60 bg-slate-100/80 dark:bg-slate-900/60 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Salary & Advance Ledger</h3>
          </div>
          {!employee.employeeLedgers || employee.employeeLedgers.length === 0 ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs font-normal">
              No salary or advance transactions logged yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 font-semibold uppercase border-b border-slate-200/60 dark:border-slate-800/60">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Voucher No</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Narration</th>
                    <th className="p-3 text-right text-emerald-600 dark:text-emerald-400">Advance Paid / DR</th>
                    <th className="p-3 text-right text-rose-600 dark:text-rose-400">Salary Credit / CR</th>
                    <th className="p-3 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60 font-medium">
                  {employee.employeeLedgers.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="p-3 text-slate-600 dark:text-slate-400">
                        {new Date(entry.date).toLocaleDateString('en-IN')}
                      </td>
                      <td className="p-3 font-semibold text-slate-900 dark:text-white">{entry.voucherNo}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase">
                          {entry.type}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">{entry.narration || '-'}</td>
                      <td className="p-3 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                        {parseFloat(entry.debit) > 0 ? formatCurrency(entry.debit) : '-'}
                      </td>
                      <td className="p-3 text-right font-semibold text-rose-600 dark:text-rose-400">
                        {parseFloat(entry.credit) > 0 ? formatCurrency(entry.credit) : '-'}
                      </td>
                      <td className="p-3 text-right font-semibold text-slate-900 dark:text-white">
                        {formatCurrency(entry.runningBalance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: DRIVER TRIPS */}
      {activeTab === 'trips' && (
        <div className="glass-card rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-xl overflow-hidden">
          <div className="p-4 border-b border-slate-200/60 dark:border-slate-800/60 bg-slate-100/80 dark:bg-slate-900/60 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Transport Trips</h3>
          </div>
          {!employee.trips || employee.trips.length === 0 ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs font-normal">No trips logged for this driver yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 font-semibold uppercase border-b border-slate-200/60 dark:border-slate-800/60">
                  <tr>
                    <th className="p-3">Trip No</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Vehicle</th>
                    <th className="p-3">Route</th>
                    <th className="p-3">Purpose</th>
                    <th className="p-3 text-right">Fuel Cost</th>
                    <th className="p-3 text-right">Total Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60 font-medium">
                  {employee.trips.map((trip) => (
                    <tr key={trip.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="p-3 font-semibold text-slate-900 dark:text-white">{trip.tripNo}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">{new Date(trip.date).toLocaleDateString('en-IN')}</td>
                      <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                        {trip.vehicle?.vehicleNumber} ({trip.vehicle?.vehicleType})
                      </td>
                      <td className="p-3 text-slate-700 dark:text-slate-300">
                        {trip.startLocation} → {trip.destination}
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">{trip.purpose}</td>
                      <td className="p-3 text-right font-semibold text-slate-700 dark:text-slate-300">{formatCurrency(trip.fuelCost)}</td>
                      <td className="p-3 text-right font-semibold text-slate-900 dark:text-white">{formatCurrency(trip.totalTripCost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Profile Photo Avatar Modal */}
      <ProfileAvatarModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        currentAvatar={employee.avatarUrl}
        entityName={employee.fullName}
        apiEndpoint={`/api/employees/${employee.id}/avatar`}
        onSuccess={() => fetchProfile()}
      />

      {/* Edit Profile Modal */}
      <EmployeeFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialData={employee}
        onSuccess={() => fetchProfile()}
      />

      {/* In-App Document Lightbox Viewer */}
      <DocumentPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        docUrl={previewDocUrl}
        title={previewDocTitle}
      />
    </main>
  );
}


