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
  XCircle
} from 'lucide-react';
import ProfileAvatarModal from '@/components/common/ProfileAvatarModal';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function EmployeeProfilePage() {
  const params = useParams();
  const id = params?.id;

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-slate-500 dark:text-slate-400 font-semibold text-sm">Loading employee profile...</div>
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

  return (
    <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Breadcrumb Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/employees"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 glass-card px-3.5 py-2 rounded-xl shadow-sm transition"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Back to Staff Directory
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-md uppercase">
            {employee.employeeCode}
          </span>
          <span className="text-xs font-extrabold text-white bg-slate-800 dark:bg-slate-700 px-2.5 py-0.5 rounded-md uppercase border border-slate-700">
            {employee.role}
          </span>
        </div>
      </div>

      {/* Profile Header Summary Card */}
      <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          {/* Avatar Picture with Camera Click Trigger */}
          <div className="relative group cursor-pointer" onClick={() => setIsAvatarModalOpen(true)}>
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl overflow-hidden border-2 border-purple-500/40 shadow-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center group-hover:opacity-90 transition">
              {employee.avatarUrl ? (
                <img src={employee.avatarUrl} alt={employee.fullName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white font-black text-2xl">
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

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {employee.fullName}
              </h1>
              <button
                onClick={() => setIsAvatarModalOpen(true)}
                className="text-xs text-purple-600 dark:text-purple-400 hover:underline font-bold"
              >
                (Edit Photo)
              </button>
            </div>
            {employee.phone && (
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> {employee.phone}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-2xl text-left">
            <div className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Base Salary ({employee.salaryType})</div>
            <div className="text-xs font-extrabold text-slate-900 dark:text-white mt-0.5">
              {formatCurrency(employee.baseSalary)}
            </div>
          </div>

          <div className="bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-2xl text-left">
            <div className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Assigned Vehicle</div>
            <div className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5 flex items-center gap-1">
              {employee.assignedVehicle ? (
                <>
                  <Truck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> {employee.assignedVehicle.vehicleNumber}
                </>
              ) : (
                <span className="text-slate-400 font-normal">None</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex gap-2 overflow-x-auto pb-0.5">
        {[
          { id: 'overview', label: 'Employee Profile (कर्मचारी विवरण)', icon: User },
          { id: 'attendance', label: 'Attendance Log (हाज़िरी लॉग)', icon: Calendar },
          { id: 'ledger', label: 'Salary & Advances (वेतन व एडवांस)', icon: Receipt },
          { id: 'trips', label: 'Driver Trips (ट्रिप विवरण)', icon: Truck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 font-bold text-xs rounded-t-2xl transition border-b-2 whitespace-nowrap ${
                isActive
                  ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900 shadow-sm'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-amber-500 dark:text-amber-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Personal & Job Info
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Employee Code</span>
                <span className="font-bold text-slate-900 dark:text-white">{employee.employeeCode}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Full Name</span>
                <span className="font-bold text-slate-900 dark:text-white">{employee.fullName}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Mobile Number</span>
                <span className="font-bold text-slate-900 dark:text-white">{employee.phone || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Designation</span>
                <span className="font-bold text-slate-900 dark:text-white">{employee.role}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Address</span>
                <span className="font-bold text-slate-900 dark:text-white">{employee.address || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Joining Date</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString('en-IN') : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          <div className="glass-card p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-amber-600 dark:text-amber-400" /> Salary Structure
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Salary Type</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{employee.salaryType}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Base Salary Amount</span>
                <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(employee.baseSalary)}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Assigned Vehicle</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  {employee.assignedVehicle ? employee.assignedVehicle.vehicleNumber : 'Not Assigned'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Status</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{employee.status}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ATTENDANCE LOG */}
      {activeTab === 'attendance' && (
        <div className="glass-card rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Attendance Log (हाज़िरी पंजी)</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Daily attendance logs & overtime records</p>
            </div>
          </div>
          {!employee.attendances || employee.attendances.length === 0 ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs">
              No attendance logs recorded for this employee yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 font-bold uppercase border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Overtime (Hrs)</th>
                    <th className="p-3">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
                  {employee.attendances.map((att) => (
                    <tr key={att.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="p-3 font-medium text-slate-800 dark:text-slate-200">
                        {new Date(att.date).toLocaleDateString('en-IN')}
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold ${
                          att.status === 'PRESENT' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20' :
                          att.status === 'HALF_DAY' ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20' : 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20'
                        }`}>
                          {att.status === 'PRESENT' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {att.status}
                        </span>
                      </td>
                      <td className="p-3 text-right font-bold text-slate-900 dark:text-white">
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
      )}

      {/* TAB 3: SALARY & ADVANCE LEDGER */}
      {activeTab === 'ledger' && (
        <div className="glass-card rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Salary & Advance Ledger (वेतन व एडवांस खाता)</h3>
          </div>
          {!employee.employeeLedgers || employee.employeeLedgers.length === 0 ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs">
              No salary or advance transactions logged yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 font-bold uppercase border-b border-slate-200 dark:border-slate-800">
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
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
                  {employee.employeeLedgers.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="p-3 text-slate-600 dark:text-slate-400">
                        {new Date(entry.date).toLocaleDateString('en-IN')}
                      </td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">{entry.voucherNo}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase">
                          {entry.type}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">{entry.narration || '-'}</td>
                      <td className="p-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        {parseFloat(entry.debit) > 0 ? formatCurrency(entry.debit) : '-'}
                      </td>
                      <td className="p-3 text-right font-bold text-rose-600 dark:text-rose-400">
                        {parseFloat(entry.credit) > 0 ? formatCurrency(entry.credit) : '-'}
                      </td>
                      <td className="p-3 text-right font-bold text-slate-900 dark:text-white">
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
        <div className="glass-card rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Transport Trips (ड्राइवर ट्रिप रिकॉर्ड)</h3>
          </div>
          {!employee.trips || employee.trips.length === 0 ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs">No trips logged for this driver yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 font-bold uppercase border-b border-slate-200 dark:border-slate-800">
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
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
                  {employee.trips.map((trip) => (
                    <tr key={trip.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="p-3 font-bold text-slate-900 dark:text-white">{trip.tripNo}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">{new Date(trip.date).toLocaleDateString('en-IN')}</td>
                      <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                        {trip.vehicle?.vehicleNumber} ({trip.vehicle?.vehicleType})
                      </td>
                      <td className="p-3 text-slate-700 dark:text-slate-300">
                        {trip.startLocation} → {trip.destination}
                      </td>
                      <td className="p-3 font-medium text-slate-600 dark:text-slate-400">{trip.purpose}</td>
                      <td className="p-3 text-right font-semibold text-slate-700 dark:text-slate-300">{formatCurrency(trip.fuelCost)}</td>
                      <td className="p-3 text-right font-bold text-slate-900 dark:text-white">{formatCurrency(trip.totalTripCost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Profile Photo Upload/Edit/Delete Modal */}
      <ProfileAvatarModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        currentAvatar={employee.avatarUrl}
        entityName={employee.fullName}
        apiEndpoint={`/api/employees/${employee.id}/avatar`}
        onSuccess={() => fetchProfile()}
      />
    </main>
  );
}

