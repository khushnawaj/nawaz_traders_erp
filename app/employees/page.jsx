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
  ShieldCheck
} from 'lucide-react';
import { CardGridSkeleton } from '@/components/common/SkeletonLoader';
import EmployeeFormModal from '@/components/employees/EmployeeFormModal';
import AdvanceManagementTab from '@/components/employees/AdvanceManagementTab';
import { formatCurrency } from '@/lib/utils';

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
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ search, role: selectedRole });
      const res = await fetch(`/api/employees?${query.toString()}`);
      const json = await res.json();
      if (json.success) {
        setEmployees(json.data);
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
  }, [search, selectedRole]);

  return (
    <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="glass-card p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-extrabold text-2xl text-slate-900 dark:text-white flex items-center gap-2.5">
            <UserCheck className="w-6 h-6 text-purple-600 dark:text-purple-400" /> Employee & Staff Directory
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Drivers, Loaders, Labour, Accountants & Mandi Managers</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-extrabold px-5 py-2.5 rounded-2xl text-xs shadow-lg shadow-emerald-950/20 transition-all transform hover:-translate-y-0.5"
        >
          <UserPlus className="w-4 h-4 text-amber-300" /> Add Staff
        </button>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Staff</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-500/20">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{stats.totalEmployees}</div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Active Staff Members</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Drivers</span>
            <div className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-500/20">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{stats.driverCount}</div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Tractor & Truck Drivers</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Loaders & Labour</span>
            <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-500/20">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{stats.labourCount}</div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Mandi & Bag Loaders</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Monthly Payroll</span>
            <div className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-500/20">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(stats.totalMonthlySalary)}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Est. Monthly Salaries</p>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="border-b border-slate-200/60 dark:border-slate-800/60 flex items-center gap-2 pb-0.5 overflow-x-auto">
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
          {/* Filter Tabs & Search */}
          <div className="glass-card p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search staff by name, code, mobile..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="app-input app-input-with-icon"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>

          {/* Role Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {[
              { id: 'ALL', label: 'All Staff' },
              { id: 'DRIVER', label: 'Drivers' },
              { id: 'LOADER', label: 'Loaders' },
              { id: 'MANAGER', label: 'Managers' },
              { id: 'LABOUR', label: 'Labours' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedRole(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-colors duration-150 ${
                  selectedRole === tab.id
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Employee Cards Grid */}
        {loading ? (
          <CardGridSkeleton count={6} />
        ) : employees.length === 0 ? (
          <div className="py-16 text-center text-slate-500 dark:text-slate-400 space-y-3">
            <UserCheck className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-900 dark:text-white">No staff members found</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
            >
              + Register First Staff Member
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {employees.map((emp) => (
              <Link
                key={emp.id}
                href={`/employees/${emp.id}`}
                className="glass-card glass-card-hover rounded-2xl p-5 border border-slate-200 dark:border-slate-800 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl overflow-hidden bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center font-extrabold text-sm shadow-md flex-shrink-0">
                        {emp.avatarUrl ? (
                          <img src={emp.avatarUrl} alt={emp.fullName} className="w-full h-full object-cover" />
                        ) : (
                          emp.fullName.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 uppercase font-mono">
                          {emp.employeeCode}
                        </span>
                        <h3 className="font-extrabold text-slate-900 dark:text-white text-base mt-0.5 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                          {emp.fullName}
                        </h3>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:text-emerald-500 group-hover:translate-x-1 transition-transform" />
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20 uppercase">
                      {emp.role}
                    </span>
                    {emp.assignedVehicle && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 flex items-center gap-1 border border-indigo-500/20">
                        <Truck className="w-3 h-3 text-indigo-600 dark:text-indigo-400" /> {emp.assignedVehicle.vehicleNumber}
                      </span>
                    )}
                  </div>

                  <div className="mt-4 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    {emp.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>{emp.phone}</span>
                      </div>
                    )}
                    {emp.joiningDate && (
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        <span>Joined: {new Date(emp.joiningDate).toLocaleDateString('en-IN')}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Base Salary ({emp.salaryType}):</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">
                    {formatCurrency(emp.baseSalary)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      </div>
      )}

      <EmployeeFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => fetchEmployees()}
      />
    </main>
  );
}

