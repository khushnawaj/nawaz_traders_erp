'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  UserPlus, 
  Search, 
  Truck, 
  UserCheck, 
  Phone, 
  ChevronRight,
  DollarSign,
  Calendar,
  ShieldCheck,
  Clock,
  Briefcase,
  LayoutGrid,
  List,
  CheckCircle2,
  AlertCircle,
  Building2,
  Coins,
  MapPin,
  FileText,
  Download,
  ChevronLeft,
  SlidersHorizontal
} from 'lucide-react';
import { CardGridSkeleton } from '@/components/common/SkeletonLoader';
import EmployeeFormModal from '@/components/employees/EmployeeFormModal';
import AdvanceManagementTab from '@/components/employees/AdvanceManagementTab';
import BulkAttendanceModal from '@/components/employees/BulkAttendanceModal';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function EmployeesPage() {
  const [activeTab, setActiveTab] = useState('directory');
  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    driverCount: 0,
    labourCount: 0,
    managerCount: 0,
    totalMonthlySalary: '0',
  });

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [viewMode, setViewMode] = useState('grid'); // grid | table
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkAttendanceOpen, setIsBulkAttendanceOpen] = useState(false);

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({
    totalCount: 0,
    totalPages: 1,
    page: 1,
    limit: 10,
  });

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ search, role: selectedRole, page: page.toString(), limit: limit.toString() });
      const res = await fetch(`/api/employees?${query.toString()}`);
      const json = await res.json();
      if (json.success) {
        setEmployees(json.data || []);
        if (json.pagination) setPagination(json.pagination);
        if (json.stats) setStats(json.stats);
      }
    } catch (err) {
      console.error('Failed to load employees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [search, selectedRole, page, limit]);

  // Handle export of corporate bank payout CSV file
  const handleExportBankCSV = async () => {
    toast.loading('Generating Corporate Bank Payout File...');
    try {
      const res = await fetch('/api/employees?limit=all');
      const json = await res.json();
      if (!json.success || !json.data) throw new Error('Failed to fetch data');

      const emps = json.data;
      const headers = ['Employee Code', 'Full Name', 'Role', 'Bank Name', 'Account Number', 'IFSC Code', 'Base Monthly Salary', 'Disbursal Mode'];
      
      const rows = emps.map(emp => [
        `"${emp.employeeCode || ''}"`,
        `"${emp.fullName || ''}"`,
        `"${emp.role || ''}"`,
        `"${emp.bankName || 'N/A'}"`,
        `"${emp.accountNo || 'N/A'}"`,
        `"${emp.ifscCode || 'N/A'}"`,
        emp.baseSalary || 0,
        `"${emp.accountNo ? 'BANK_TRANSFER' : 'CASH'}"`
      ]);

      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `nawaz_traders_bank_payout_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.dismiss();
      toast.success('Bank Payout CSV exported successfully!');
    } catch (err) {
      toast.dismiss();
      toast.error('Failed to export bank payout CSV');
    }
  };

  // Helper function to calculate tenure/experience from joining date
  const calculateTenure = (joiningDateStr) => {
    if (!joiningDateStr) return 'N/A';
    const joinDate = new Date(joiningDateStr);
    const now = new Date();
    const diffTime = Math.abs(now - joinDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) return `${diffDays} days`;
    const months = Math.floor(diffDays / 30);
    if (months < 12) return `${months} mos`;
    const years = (months / 12).toFixed(1);
    return `${years} yrs`;
  };

  return (
    <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-950 text-white p-6 sm:p-8 rounded-3xl border border-purple-900/40 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-outfit">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-2">
            <UserCheck className="w-3.5 h-3.5 text-amber-400" /> Enterprise HR & Workforce Desk
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Employee & Staff Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
            200+ Employee Management: Bulk daily roll calls, bank payout exports, salary structures, leave/attendance logs, and KYC doc vaults.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setIsBulkAttendanceOpen(true)}
            className="bahi-btn-emerald py-2.5 px-4 text-xs font-bold shadow-lg flex items-center gap-2"
          >
            <UserCheck className="w-4 h-4 text-emerald-200" /> Daily Roll Call (Bulk)
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bahi-btn-primary py-2.5 px-5 text-xs font-bold shadow-lg shadow-emerald-900/40 flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4 text-amber-300" /> Register Staff Member
          </button>
        </div>
      </div>


      {/* Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-modal p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm font-outfit">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Total Active Staff</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-2 font-mono">{stats.totalEmployees}</div>
          <p className="text-xs text-slate-500 mt-1 font-medium">Registered Workforce</p>
        </div>

        <div className="glass-modal p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm font-outfit">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Drivers & Transport</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-2 font-mono">{stats.driverCount}</div>
          <p className="text-xs text-slate-500 mt-1 font-medium">Tractor & Truck Drivers</p>
        </div>

        <div className="glass-modal p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm font-outfit">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Loaders & Labour</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-2 font-mono">{stats.labourCount}</div>
          <p className="text-xs text-slate-500 mt-1 font-medium">Mandi Bag Workers</p>
        </div>

        <div className="glass-modal p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm font-outfit">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Monthly Payroll</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2 font-mono">
            {formatCurrency(stats.totalMonthlySalary)}
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">Est. Base Monthly Payroll</p>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 pb-0.5 overflow-x-auto font-outfit">
        <button
          onClick={() => setActiveTab('directory')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-extrabold transition whitespace-nowrap ${
            activeTab === 'directory'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" /> Staff Directory & Profiles
        </button>
        <button
          onClick={() => setActiveTab('advances')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-extrabold transition whitespace-nowrap ${
            activeTab === 'advances'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" /> Salary Advances & Disbursals
        </button>
      </div>

      {activeTab === 'advances' ? (
        <AdvanceManagementTab />
      ) : (
        <div className="space-y-4">
          {/* Toolbar: Search, Role Filters & View Mode */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 glass-modal p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800">
            {/* Search Box */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Search staff by name, code, phone, role..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="app-input pl-10 text-xs font-outfit"
              />
            </div>

            {/* Role Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 font-outfit text-xs">
              {[
                { id: 'ALL', label: 'All Staff' },
                { id: 'DRIVER', label: 'Drivers' },
                { id: 'LOADER', label: 'Loaders' },
                { id: 'MANAGER', label: 'Managers' },
                { id: 'ACCOUNTANT', label: 'Accountants' },
                { id: 'LABOUR', label: 'Labour' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedRole(tab.id)}
                  className={`px-3 py-1.5 rounded-2xl font-semibold whitespace-nowrap transition cursor-pointer active:scale-95 ${
                    selectedRole === tab.id
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* View Mode Toggle & Bank Export */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleExportBankCSV}
                className="px-3 py-1.5 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-200 transition font-bold text-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Download className="w-3.5 h-3.5" /> Bank Payout (CSV)
              </button>

              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-xl transition cursor-pointer ${
                    viewMode === 'grid' ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-xl transition cursor-pointer ${
                    viewMode === 'table' ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Content Display: Cards Grid or Table */}
          {loading ? (
            <CardGridSkeleton count={6} />
          ) : employees.length === 0 ? (
            <div className="glass-modal p-12 rounded-3xl text-center border border-slate-200/80 dark:border-slate-800 space-y-4 font-outfit">
              <UserCheck className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto" />
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Staff Members Found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Try adjusting your search query or role filter, or register a new staff member.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bahi-btn-primary py-2 px-5 text-xs font-bold inline-flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" /> Register First Staff Member
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            /* Cards Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-outfit">
              {employees.map((emp) => {
                const tenure = calculateTenure(emp.joiningDate);
                const hasAadhaar = Boolean(emp.aadhaarNo || emp.aadhaarDocUrl);
                const hasDL = Boolean(emp.drivingLicenseNo || emp.drivingLicenseDocUrl);
                const hasBank = Boolean(emp.accountNo || emp.bankDocUrl);

                return (
                  <Link
                    key={emp.id}
                    href={`/employees/${emp.id}`}
                    className="glass-modal rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col justify-between space-y-4 group"
                  >
                    <div>
                      {/* Top Header: Code, Role & Avatar */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl overflow-hidden bg-gradient-to-tr from-purple-600 via-indigo-500 to-amber-500 text-white flex items-center justify-center font-extrabold text-base shadow-md shrink-0">
                            {emp.avatarUrl ? (
                              <img src={emp.avatarUrl} alt={emp.fullName} className="w-full h-full object-cover" />
                            ) : (
                              emp.fullName.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <span className="text-[10px] font-mono font-extrabold text-purple-700 dark:text-purple-300 bg-purple-500/10 px-2.5 py-0.5 rounded-lg border border-purple-500/20 uppercase">
                              {emp.employeeCode}
                            </span>
                            <h3 className="font-extrabold text-slate-900 dark:text-white text-base mt-0.5 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition">
                              {emp.fullName}
                            </h3>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-transform" />
                      </div>

                      {/* Badges: Designation & Vehicle */}
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20 uppercase">
                          {emp.role?.replace('_', ' ')}
                        </span>
                        {emp.assignedVehicle && (
                          <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-xl bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 flex items-center gap-1 border border-indigo-500/20">
                            <Truck className="w-3 h-3 text-indigo-600 dark:text-indigo-400" /> {emp.assignedVehicle.vehicleNumber}
                          </span>
                        )}
                      </div>

                      {/* Detailed Employment Metrics Pills */}
                      <div className="mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-800/60 space-y-2.5 text-xs">
                        {/* Joining Date & Tenure */}
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" /> Joining Date:
                          </span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}{' '}
                            <span className="text-[10px] text-purple-600 dark:text-purple-400 font-mono">({tenure})</span>
                          </span>
                        </div>

                        {/* Salary Structure */}
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium flex items-center gap-1">
                            <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> Base Salary:
                          </span>
                          <span className="font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(emp.baseSalary)} <span className="text-[10px] font-sans text-slate-500">/{emp.salaryType}</span>
                          </span>
                        </div>

                        {/* Phone & Location */}
                        {emp.phone && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 font-medium flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5 text-amber-500" /> Phone:
                            </span>
                            <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono">{emp.phone}</span>
                          </div>
                        )}

                        {/* KYC Documents Checklist */}
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-slate-500 font-medium flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-purple-500" /> KYC Vault:
                          </span>
                          <div className="flex items-center gap-1.5 text-[10px] font-extrabold">
                            <span className={`px-1.5 py-0.5 rounded ${hasAadhaar ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                              Aadhaar {hasAadhaar ? '✓' : '✗'}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded ${hasDL ? 'bg-indigo-500/10 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                              DL {hasDL ? '✓' : '✗'}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded ${hasBank ? 'bg-amber-500/10 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
                              Bank {hasBank ? '✓' : '✗'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action CTA */}
                    <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs text-purple-600 dark:text-purple-400 font-bold">
                      <span>View Attendance & Payroll Statement</span>
                      <span>→</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            /* Table View */
            <div className="glass-modal rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm font-outfit">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-900/90 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-4 py-3.5">Code</th>
                      <th className="px-4 py-3.5">Employee Name</th>
                      <th className="px-4 py-3.5">Role / Duty</th>
                      <th className="px-4 py-3.5">Joining & Tenure</th>
                      <th className="px-4 py-3.5 text-right">Base Salary</th>
                      <th className="px-4 py-3.5">Phone</th>
                      <th className="px-4 py-3.5 text-center">KYC Docs</th>
                      <th className="px-4 py-3.5 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                    {employees.map((emp) => {
                      const tenure = calculateTenure(emp.joiningDate);
                      const hasAadhaar = Boolean(emp.aadhaarNo || emp.aadhaarDocUrl);
                      const hasDL = Boolean(emp.drivingLicenseNo || emp.drivingLicenseDocUrl);
                      const hasBank = Boolean(emp.accountNo || emp.bankDocUrl);

                      return (
                        <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition">
                          <td className="px-4 py-3.5 font-mono font-bold text-slate-900 dark:text-white">
                            {emp.employeeCode}
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="font-bold text-slate-900 dark:text-white">{emp.fullName}</div>
                            <div className="text-[10px] text-slate-400">{emp.address || 'No address specified'}</div>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20">
                              {emp.role?.replace('_', ' ')}
                            </span>
                            {emp.assignedVehicle && (
                              <span className="ml-1.5 text-[10px] font-bold text-indigo-600">
                                ({emp.assignedVehicle.vehicleNumber})
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="font-semibold text-slate-800 dark:text-slate-200">
                              {emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString('en-IN') : 'N/A'}
                            </div>
                            <div className="text-[10px] text-purple-600 dark:text-purple-400 font-mono">({tenure})</div>
                          </td>
                          <td className="px-4 py-3.5 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(emp.baseSalary)} <span className="text-[9px] font-sans text-slate-400">/{emp.salaryType}</span>
                          </td>
                          <td className="px-4 py-3.5 font-mono text-slate-700 dark:text-slate-300">
                            {emp.phone || '-'}
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <div className="flex items-center justify-center gap-1 text-[10px] font-bold">
                              <span className={`px-1.5 py-0.5 rounded ${hasAadhaar ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                A
                              </span>
                              <span className={`px-1.5 py-0.5 rounded ${hasDL ? 'bg-indigo-500/10 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                                DL
                              </span>
                              <span className={`px-1.5 py-0.5 rounded ${hasBank ? 'bg-amber-500/10 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
                                B
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <Link
                              href={`/employees/${emp.id}`}
                              className="px-3 py-1 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] transition inline-flex items-center gap-1"
                            >
                              Profile ↗
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination Controls Bar */}
          {pagination.totalCount > 0 && (
            <div className="glass-modal p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 font-outfit text-xs">
              <div className="text-slate-500 font-medium">
                Showing <strong className="text-slate-900 dark:text-white">{limit === 'all' ? 1 : (page - 1) * limit + 1}</strong> to{' '}
                <strong className="text-slate-900 dark:text-white">{limit === 'all' ? pagination.totalCount : Math.min(page * limit, pagination.totalCount)}</strong> of{' '}
                <strong className="text-emerald-600 dark:text-emerald-400">{pagination.totalCount}</strong> active staff members
              </div>

              <div className="flex items-center gap-3">
                {/* Rows per page selector */}
                <div className="flex items-center gap-1 text-slate-500 font-medium">
                  <span>Per page:</span>
                  <select
                    value={limit}
                    onChange={(e) => {
                      const val = e.target.value === 'all' ? 'all' : parseInt(e.target.value);
                      setLimit(val);
                      setPage(1);
                    }}
                    className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2 py-1 text-xs font-bold text-slate-900 dark:text-white outline-none cursor-pointer"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                    <option value="all">All (200+)</option>
                  </select>
                </div>

                {/* Page Navigation Buttons */}
                {limit !== 'all' && (
                  <div className="flex items-center gap-1.5 font-bold">
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" /> Prev
                    </button>
                    <span className="px-2 font-mono text-slate-800 dark:text-slate-200">
                      {page} / {pagination.totalPages}
                    </span>
                    <button
                      type="button"
                      disabled={page >= pagination.totalPages}
                      onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                      className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1"
                    >
                      Next <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <EmployeeFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => fetchEmployees()}
      />

      <BulkAttendanceModal
        isOpen={isBulkAttendanceOpen}
        onClose={() => setIsBulkAttendanceOpen(false)}
        onSuccess={() => fetchEmployees()}
      />
    </main>
  );
}

