'use client';

import { useState, useEffect } from 'react';
import { 
  User, 
  Calendar, 
  Receipt, 
  Truck, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  CreditCard,
  Building2,
  Phone,
  RefreshCw,
  Award,
  DollarSign,
  PlusCircle,
  Clock3,
  X
} from 'lucide-react';
import AttendanceCalendar from '@/components/employees/AttendanceCalendar';
import toast from 'react-hot-toast';

export default function EmployeePortalPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('attendance');
  
  // Salary Advance State
  const [advanceRequests, setAdvanceRequests] = useState([]);
  const [advanceModalOpen, setAdvanceModalOpen] = useState(false);
  const [submittingAdvance, setSubmittingAdvance] = useState(false);
  const [advanceForm, setAdvanceForm] = useState({
    amount: '',
    reason: 'Personal Emergency / Advance',
    notes: '',
  });

  useEffect(() => {
    fetchPortalData();
  }, []);

  const fetchPortalData = async () => {
    setLoading(true);
    try {
      const resUser = await fetch('/api/auth/me');
      const dataUser = await resUser.json();

      if (!dataUser.success || !dataUser.user) {
        toast.error('Session expired. Please log in.');
        return;
      }

      setCurrentUser(dataUser.user);

      let employeeId = dataUser.user.employeeId;

      if (!employeeId) {
        const searchQuery = dataUser.user.phone || dataUser.user.fullName;
        const resSearch = await fetch(`/api/employees?search=${encodeURIComponent(searchQuery)}`);
        const dataSearch = await resSearch.json();
        const empList = dataSearch.data || dataSearch.employees || [];

        if (dataSearch.success && empList.length > 0) {
          const matchedEmp = empList[0];
          employeeId = matchedEmp.id;
          fetch(`/api/users/${dataUser.user.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ employeeId: matchedEmp.id }),
          }).catch(() => {});
        } else {
          // Auto-create Employee profile for this logged in employee/driver account
          const resCreate = await fetch('/api/employees', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fullName: dataUser.user.fullName || dataUser.user.username,
              phone: dataUser.user.phone || '',
              role: dataUser.user.role === 'DRIVER' ? 'DRIVER' : 'LABOUR',
              baseSalary: 0,
              salaryType: 'MONTHLY',
            }),
          });
          const dataCreate = await resCreate.json();
          if (dataCreate.success && dataCreate.data) {
            employeeId = dataCreate.data.id;
            fetch(`/api/users/${dataUser.user.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ employeeId: dataCreate.data.id }),
            }).catch(() => {});
          }
        }
      }

      if (employeeId) {
        const resEmp = await fetch(`/api/employees/${employeeId}`);
        const dataEmp = await resEmp.json();
        if (dataEmp.success && dataEmp.data) {
          setEmployee(dataEmp.data);
        } else if (dataEmp.success && dataEmp.employee) {
          setEmployee(dataEmp.employee);
        }
        fetchAdvanceRequests(employeeId);
      }
    } catch (err) {
      toast.error('Failed to load employee portal data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAdvanceRequests = async (empId) => {
    try {
      const res = await fetch(`/api/employees/advances?employeeId=${empId || employee?.id || ''}`);
      const data = await res.json();
      if (data.success) {
        setAdvanceRequests(data.data || []);
      }
    } catch (err) {}
  };

  const handleRequestAdvanceSubmit = async (e) => {
    e.preventDefault();
    const amount = parseFloat(advanceForm.amount);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setSubmittingAdvance(true);
    try {
      const res = await fetch('/api/employees/advances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: employee.id,
          amount,
          reason: advanceForm.reason,
          notes: advanceForm.notes,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Request failed');

      toast.success('🎉 Salary advance request submitted to Management!');
      setAdvanceModalOpen(false);
      setAdvanceForm({ amount: '', reason: 'Personal Emergency / Advance', notes: '' });
      fetchAdvanceRequests(employee.id);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmittingAdvance(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val || 0);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500 flex items-center justify-center gap-2 text-xs">
        <RefreshCw className="w-5 h-5 animate-spin text-emerald-500" /> Loading your personal portal...
      </div>
    );
  }

  if (!employee) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="glass-card p-8 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Employee Profile Not Linked</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Your user account (@{currentUser?.username}) is not yet linked to an official Employee record. Please ask your Owner or Manager to link your profile in User Management.
          </p>
        </div>
      </main>
    );
  }

  const presentCount = employee.attendances?.filter(a => a.status === 'PRESENT').length || 0;
  const totalOvertime = employee.attendances?.reduce((sum, a) => sum + parseFloat(a.overtimeHr || 0), 0) || 0;

  return (
    <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bahi-card-emerald p-6 border border-slate-200/60 dark:border-slate-800/60 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-500 via-emerald-500 to-emerald-600 flex items-center justify-center text-white text-xl font-extrabold shadow-lg font-outfit">
            {employee.fullName.charAt(0)}
          </div>
          <div>
            <div className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 mb-1 font-outfit">
              <Award className="w-3 h-3" /> Staff Digital Bahi Portal
            </div>
            <h1 className="font-extrabold text-2xl text-slate-900 dark:text-white font-outfit tracking-tight">
              Welcome, {employee.fullName}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
              Code: <strong className="font-mono text-slate-900 dark:text-white">{employee.employeeCode}</strong> • Role: {employee.role}
            </p>
          </div>
        </div>

        {/* Header Action Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setAdvanceModalOpen(true)}
            className="bahi-btn-primary py-2.5 px-4 text-xs shadow-lg"
          >
            <PlusCircle className="w-4 h-4 text-amber-300" /> Request Salary Advance
          </button>

          <div className="grid grid-cols-2 gap-3 w-full sm:w-auto">
            <div className="p-3.5 bg-slate-50/90 dark:bg-slate-950/80 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 text-center shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-500 block font-outfit tracking-wider">Total Days Present</span>
              <span className="text-base sm:text-xl font-extrabold text-emerald-600 dark:text-emerald-400 font-bahi">{presentCount} Days</span>
            </div>

            <div className="p-3.5 bg-slate-50/90 dark:bg-slate-950/80 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 text-center shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-500 block font-outfit tracking-wider">Total Overtime</span>
              <span className="text-base sm:text-xl font-extrabold text-amber-500 font-bahi">{totalOvertime} Hrs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200/60 dark:border-slate-800/60 flex gap-2 overflow-x-auto pb-0.5">
        {[
          { id: 'attendance', label: 'My Attendance Calendar', icon: Calendar },
          { id: 'ledger', label: 'Salary & Advance Khaata', icon: Receipt },
          { id: 'trips', label: 'Transport Trips & Fleet', icon: Truck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-md'
                  : 'bg-slate-100/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: ATTENDANCE CALENDAR */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          <AttendanceCalendar
            employeeId={employee.id}
            employeeName={employee.fullName}
            readOnly={true}
          />

          <div className="glass-card p-5 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-lg space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-500" /> Recorded Attendance Logs & Remarks (Marked by Mandi Supervisor / Manager)
            </h3>

            {!employee.attendances || employee.attendances.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">No attendance logs marked yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 font-semibold uppercase border-b border-slate-200/60 dark:border-slate-800/60">
                    <tr>
                      <th className="p-3">Date</th>
                      <th className="p-3">Status Marked</th>
                      <th className="p-3 text-right">Overtime</th>
                      <th className="p-3">Manager Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60 font-medium">
                    {employee.attendances.map((att) => (
                      <tr key={att.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <td className="p-3 text-slate-800 dark:text-slate-200 font-mono">
                          {new Date(att.date).toLocaleDateString('en-IN')}
                        </td>
                        <td className="p-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                            att.status === 'PRESENT' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' :
                            att.status === 'HALF_DAY' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                          }`}>
                            {att.status === 'PRESENT' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            {att.status}
                          </span>
                        </td>
                        <td className="p-3 text-right font-bold text-slate-900 dark:text-white">
                          {parseFloat(att.overtimeHr) > 0 ? `${att.overtimeHr} hrs` : '-'}
                        </td>
                        <td className="p-3 text-slate-500">{att.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SALARY & ADVANCE KHAATA */}
      {activeTab === 'ledger' && (
        <div className="space-y-6">
          {/* Salary Advance Requests History Strip */}
          <div className="glass-card p-5 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white font-outfit flex items-center gap-2">
                <Clock3 className="w-4 h-4 text-amber-500" /> My Salary Advance Requests Status
              </h3>
              <button
                onClick={() => setAdvanceModalOpen(true)}
                className="bahi-btn-primary py-1.5 px-3 text-xs"
              >
                <PlusCircle className="w-3.5 h-3.5 text-amber-300" /> New Advance Request
              </button>
            </div>

            {advanceRequests.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-3">No salary advance requests submitted yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 font-semibold uppercase border-b border-slate-200/60 dark:border-slate-800/60">
                    <tr>
                      <th className="p-3">Req No</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Requested Amount</th>
                      <th className="p-3">Reason</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60 font-medium">
                    {advanceRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">{req.requestNo}</td>
                        <td className="p-3 text-slate-500 font-mono">{new Date(req.createdAt).toLocaleDateString('en-IN')}</td>
                        <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400 font-bahi">{formatCurrency(req.amount)}</td>
                        <td className="p-3 text-slate-600 dark:text-slate-400">{req.reason}</td>
                        <td className="p-3 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                            req.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                            req.status === 'PENDING' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                            'bg-rose-500/10 text-rose-600 border-rose-500/20'
                          }`}>
                            {req.status === 'APPROVED' ? <CheckCircle className="w-3 h-3" /> : req.status === 'PENDING' ? <Clock3 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            {req.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Employee Ledger Statement */}
          <div className="glass-card rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-xl overflow-hidden">
            <div className="p-5 border-b border-slate-200/60 dark:border-slate-800/60 bg-slate-100/80 dark:bg-slate-900/60 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Personal Salary & Advance Statement</h3>
            </div>

            {!employee.employeeLedgers || employee.employeeLedgers.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs font-normal">
                No salary credits or advance payments recorded yet.
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
                      <th className="p-3 text-right text-emerald-600 dark:text-emerald-400">Advance Paid</th>
                      <th className="p-3 text-right text-rose-600 dark:text-rose-400">Salary Credit</th>
                      <th className="p-3 text-right">Running Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60 font-medium">
                    {employee.employeeLedgers.map((entry) => (
                      <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <td className="p-3 text-slate-600 dark:text-slate-400">
                          {new Date(entry.date).toLocaleDateString('en-IN')}
                        </td>
                        <td className="p-3 font-semibold text-slate-900 dark:text-white font-mono">{entry.voucherNo}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase">
                            {entry.type}
                          </span>
                        </td>
                        <td className="p-3 text-slate-600 dark:text-slate-400">{entry.narration || '-'}</td>
                        <td className="p-3 text-right font-bold text-emerald-600 dark:text-emerald-400 font-bahi">
                          {parseFloat(entry.debit) > 0 ? formatCurrency(entry.debit) : '-'}
                        </td>
                        <td className="p-3 text-right font-bold text-rose-600 dark:text-rose-400 font-bahi">
                          {parseFloat(entry.credit) > 0 ? formatCurrency(entry.credit) : '-'}
                        </td>
                        <td className="p-3 text-right font-extrabold text-slate-900 dark:text-white font-bahi">
                          {formatCurrency(entry.runningBalance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: TRIPS */}
      {activeTab === 'trips' && (
        <div className="glass-card rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-xl overflow-hidden">
          <div className="p-5 border-b border-slate-200/60 dark:border-slate-800/60 bg-slate-100/80 dark:bg-slate-900/60 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Assigned Transport Trips & Driver Logs</h3>
          </div>

          {!employee.trips || employee.trips.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs font-normal">No trips recorded for your profile yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 font-semibold uppercase border-b border-slate-200/60 dark:border-slate-800/60">
                  <tr>
                    <th className="p-3">Trip No</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Route</th>
                    <th className="p-3">Vehicle</th>
                    <th className="p-3 text-right">Fuel Cost</th>
                    <th className="p-3 text-right">Total Expenses</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60 font-medium">
                  {employee.trips.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">{t.tripNo}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">{new Date(t.date).toLocaleDateString('en-IN')}</td>
                      <td className="p-3 font-semibold text-slate-900 dark:text-white">
                        {t.startLocation} → {t.destination}
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-400 font-mono">{t.vehicle?.vehicleNumber || '-'}</td>
                      <td className="p-3 text-right font-bold text-amber-500">{formatCurrency(t.fuelCost)}</td>
                      <td className="p-3 text-right font-bold text-slate-900 dark:text-white">{formatCurrency(t.totalTripCost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Salary Advance Request Modal Overlay */}
      {advanceModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-modal rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden my-8 border border-slate-200/80 dark:border-slate-800 animate-in fade-in zoom-in duration-200 text-slate-900 dark:text-white flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-800 via-emerald-900 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-emerald-700/40">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg font-outfit text-white">Request Salary Advance</h3>
                  <p className="text-xs text-emerald-200/80 font-normal">Submit a request to Nawaz Traders Management</p>
                </div>
              </div>
              <button
                onClick={() => setAdvanceModalOpen(false)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition hover:scale-105"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleRequestAdvanceSubmit} className="p-5 sm:p-6 space-y-4">
              <div>
                <label className="app-label">
                  Requested Advance Amount (₹) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="5000"
                    value={advanceForm.amount}
                    onChange={(e) => setAdvanceForm({ ...advanceForm, amount: e.target.value })}
                    className="app-input app-input-with-icon font-mono font-bold text-lg text-emerald-600 dark:text-emerald-400"
                  />
                  <DollarSign className="w-4 h-4 text-emerald-500 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div>
                <label className="app-label">Reason for Advance</label>
                <select
                  value={advanceForm.reason}
                  onChange={(e) => setAdvanceForm({ ...advanceForm, reason: e.target.value })}
                  className="app-select text-xs"
                >
                  <option value="Personal Emergency / Advance">Personal Emergency / Advance</option>
                  <option value="Medical Need">Medical Need</option>
                  <option value="Family Requirement">Family Requirement</option>
                  <option value="Festival & Celebrations">Festival & Celebrations</option>
                  <option value="House Maintenance / Rent">House Maintenance / Rent</option>
                  <option value="Travel / Fuel Advance">Travel / Fuel Advance</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="app-label">Additional Details / Notes</label>
                <textarea
                  rows="3"
                  placeholder="Explain brief details for management approval..."
                  value={advanceForm.notes}
                  onChange={(e) => setAdvanceForm({ ...advanceForm, notes: e.target.value })}
                  className="app-input text-xs"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200/60 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setAdvanceModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAdvance}
                  className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-lg transition flex items-center gap-2 font-outfit disabled:opacity-50"
                >
                  {submittingAdvance ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Submitting...
                    </>
                  ) : (
                    'Submit Request'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
