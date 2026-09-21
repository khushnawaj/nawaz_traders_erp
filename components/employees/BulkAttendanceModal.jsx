'use client';

import { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  CheckCircle2, 
  UserCheck, 
  Search, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  Users,
  Check,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function BulkAttendanceModal({ isOpen, onClose, onSuccess }) {
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [allEmployees, setAllEmployees] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({}); // { empId: { status, overtimeHours, remarks } }
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  useEffect(() => {
    if (isOpen) {
      fetchEmployeesList();
    }
  }, [isOpen]);

  const fetchEmployeesList = async () => {
    setLoading(true);
    try {
      // Fetch all employees without pagination limit
      const res = await fetch('/api/employees?limit=all');
      const json = await res.json();
      if (json.success) {
        const emps = json.data || [];
        setAllEmployees(emps);

        // Initialize attendance map defaulting to PRESENT
        const initialMap = {};
        emps.forEach((emp) => {
          initialMap[emp.id] = {
            status: 'PRESENT',
            overtimeHours: 0,
            remarks: '',
          };
        });
        setAttendanceMap(initialMap);
      }
    } catch (err) {
      toast.error('Failed to load employee directory');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAll = (statusToSet) => {
    setAttendanceMap((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((id) => {
        next[id] = { ...next[id], status: statusToSet };
      });
      return next;
    });
    toast.success(`Marked all employees as ${statusToSet}`);
  };

  const updateEmpStatus = (id, field, value) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const attendances = Object.entries(attendanceMap).map(([employeeId, data]) => ({
        employeeId,
        status: data.status,
        overtimeHours: parseFloat(data.overtimeHours || 0),
        remarks: data.remarks || null,
      }));

      const res = await fetch('/api/employees/bulk-attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          attendances,
        }),
      });

      const json = await res.json();
      if (json.success) {
        toast.success(json.message || 'Master roll call saved!');
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error(json.error || 'Failed to save attendance');
      }
    } catch (err) {
      toast.error('Error saving bulk attendance');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const filteredEmployees = allEmployees.filter((emp) => {
    const matchesSearch = 
      emp.fullName.toLowerCase().includes(search.toLowerCase()) ||
      emp.employeeCode.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || emp.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const presentCount = Object.values(attendanceMap).filter((a) => a?.status === 'PRESENT').length;
  const absentCount = Object.values(attendanceMap).filter((a) => a?.status === 'ABSENT').length;
  const leaveCount = Object.values(attendanceMap).filter((a) => a?.status === 'PAID_LEAVE').length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto font-outfit">
      <div className="glass-modal rounded-3xl max-w-5xl w-full shadow-2xl overflow-hidden my-4 sm:my-8 border border-slate-200/80 dark:border-slate-800 animate-in fade-in zoom-in duration-200 text-slate-900 dark:text-white flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-slate-900 p-4 sm:p-5 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-outfit">Daily Master Roll Call</h2>
              <p className="text-xs text-slate-400">Bulk mark attendance for all 200+ employees in 1 click</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-2xl text-xs text-white font-mono outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Summary & Action Controls */}
        <div className="p-4 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs">
          <div className="flex items-center gap-2 sm:gap-4 font-mono font-bold">
            <span className="px-3 py-1.5 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 rounded-2xl border border-emerald-300 dark:border-emerald-800">
              Present: {presentCount}
            </span>
            <span className="px-3 py-1.5 bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 rounded-2xl border border-rose-300 dark:border-rose-800">
              Absent: {absentCount}
            </span>
            <span className="px-3 py-1.5 bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 rounded-2xl border border-purple-300 dark:border-purple-800">
              Paid Leave: {leaveCount}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleMarkAll('PRESENT')}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-xs transition cursor-pointer active:scale-95 shadow-sm"
            >
              ✓ Mark All Present
            </button>
            <button
              type="button"
              onClick={() => handleMarkAll('ABSENT')}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-2xl text-xs transition cursor-pointer active:scale-95 shadow-sm"
            >
              ✕ Mark All Absent
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="p-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by staff name or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="app-input pl-9 py-1.5 text-xs"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto text-xs font-semibold">
            {['ALL', 'DRIVER', 'LOADER', 'HELPER', 'ACCOUNTANT', 'MANAGER'].map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setRoleFilter(role)}
                className={`px-3 py-1 rounded-2xl transition cursor-pointer ${
                  roleFilter === role
                    ? 'bg-emerald-600 text-white font-bold shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Employee Attendance Register Grid */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="p-12 text-center text-slate-500 font-medium">Loading staff roster...</div>
          ) : filteredEmployees.length === 0 ? (
            <div className="p-12 text-center text-slate-500 font-medium">No matching employees found</div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
              {filteredEmployees.map((emp) => {
                const current = attendanceMap[emp.id] || { status: 'PRESENT', overtimeHours: 0 };
                return (
                  <div 
                    key={emp.id} 
                    className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition"
                  >
                    {/* Staff Profile Info */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-amber-500 text-white font-black flex items-center justify-center text-sm shadow-sm shrink-0">
                        {emp.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                          {emp.fullName}
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono font-semibold">
                            {emp.employeeCode}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 font-medium">
                          {emp.role} • ₹{emp.baseSalary?.toLocaleString()}/mo
                        </div>
                      </div>
                    </div>

                    {/* Status Payout Radio Buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
                        <button
                          type="button"
                          onClick={() => updateEmpStatus(emp.id, 'status', 'PRESENT')}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                            current.status === 'PRESENT'
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                          }`}
                        >
                          Present
                        </button>
                        <button
                          type="button"
                          onClick={() => updateEmpStatus(emp.id, 'status', 'PAID_LEAVE')}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                            current.status === 'PAID_LEAVE'
                              ? 'bg-purple-600 text-white shadow-sm'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                          }`}
                        >
                          Paid Leave
                        </button>
                        <button
                          type="button"
                          onClick={() => updateEmpStatus(emp.id, 'status', 'HALF_DAY')}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                            current.status === 'HALF_DAY'
                              ? 'bg-amber-600 text-white shadow-sm'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                          }`}
                        >
                          Half Day
                        </button>
                        <button
                          type="button"
                          onClick={() => updateEmpStatus(emp.id, 'status', 'ABSENT')}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                            current.status === 'ABSENT'
                              ? 'bg-rose-600 text-white shadow-sm'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                          }`}
                        >
                          Absent
                        </button>
                      </div>

                      {/* Overtime input */}
                      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-2xl">
                        <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max="24"
                          placeholder="OT Hrs"
                          value={current.overtimeHours || ''}
                          onChange={(e) => updateEmpStatus(emp.id, 'overtimeHours', e.target.value)}
                          className="w-16 bg-transparent text-xs font-mono font-bold text-slate-900 dark:text-white outline-none text-center"
                        />
                        <span className="text-[10px] font-bold text-slate-400">Hrs</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Action Footer */}
          <div className="pt-3 flex items-center justify-between border-t border-slate-200 dark:border-slate-800 shrink-0">
            <div className="text-xs text-slate-500 font-medium">
              Updating roll call for <strong>{filteredEmployees.length}</strong> staff members
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="bahi-btn-primary py-2.5 px-6 text-xs font-extrabold shadow-lg disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {submitting ? 'Saving Roll Call...' : 'Save Daily Master Roll Call ✓'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
