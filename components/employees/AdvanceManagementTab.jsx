'use client';

import { useState, useEffect } from 'react';
import { 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Clock, 
  CreditCard, 
  Building2, 
  RefreshCw, 
  User, 
  AlertCircle,
  ShieldCheck,
  Search,
  Check,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdvanceManagementTab() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState('APPROVE'); // 'APPROVE' or 'REJECT'
  const [submitting, setSubmitting] = useState(false);

  // Disbursal Form
  const [disbursedMode, setDisbursedMode] = useState('CASH');
  const [accountName, setAccountName] = useState('Petty Cash');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchAdvanceRequests();
  }, [filterStatus]);

  const fetchAdvanceRequests = async () => {
    setLoading(true);
    try {
      const query = filterStatus !== 'ALL' ? `?status=${filterStatus}` : '';
      const res = await fetch(`/api/employees/advances${query}`);
      const json = await res.json();
      if (json.success) {
        setRequests(json.data || []);
      }
    } catch (err) {
      toast.error('Failed to load advance requests');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAction = (req, type) => {
    setSelectedRequest(req);
    setActionType(type);
    setDisbursedMode('CASH');
    setAccountName('Petty Cash Drawer');
    setNotes('');
    setActionModalOpen(true);
  };

  const handleProcessAdvance = async (e) => {
    e.preventDefault();
    if (!selectedRequest) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/employees/advances', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: selectedRequest.id,
          status: actionType === 'APPROVE' ? 'APPROVED' : 'REJECTED',
          disbursedMode: actionType === 'APPROVE' ? disbursedMode : undefined,
          accountName: actionType === 'APPROVE' ? accountName : undefined,
          notes,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to process request');

      toast.success(
        actionType === 'APPROVE' 
          ? `🎉 Salary advance ₹${selectedRequest.amount} approved & posted to Employee Khaata!`
          : 'Advance request rejected.'
      );

      setActionModalOpen(false);
      setSelectedRequest(null);
      fetchAdvanceRequests();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val || 0);
  };

  const pendingCount = requests.filter(r => r.status === 'PENDING').length;
  const approvedCount = requests.filter(r => r.status === 'APPROVED').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Overview Stat Header */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">Pending Approvals</span>
            <div className="text-2xl font-extrabold text-amber-500 font-bahi">{pendingCount} Requests</div>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">Approved & Disbursed</span>
            <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-bahi">{approvedCount} Advances</div>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">Total Advance Outflow</span>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white font-bahi">
              {formatCurrency(requests.filter(r => r.status === 'APPROVED').reduce((sum, r) => sum + parseFloat(r.amount || 0), 0))}
            </div>
          </div>
          <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Advance Requests Table */}
      <div className="glass-card rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-xl overflow-hidden">
        {/* Header bar & filter */}
        <div className="p-5 border-b border-slate-200/60 dark:border-slate-800/60 bg-slate-100/80 dark:bg-slate-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white font-outfit">
              Staff Salary Advances Disbursal Desk
            </h3>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  filterStatus === st
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-emerald-500" /> Loading advance requests...
          </div>
        ) : requests.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-xs">
            No salary advance requests found under filter &quot;<strong className="uppercase">{filterStatus}</strong>&quot;.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 font-semibold uppercase border-b border-slate-200/60 dark:border-slate-800/60">
                <tr>
                  <th className="p-3.5">Req No</th>
                  <th className="p-3.5">Staff Member</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5 text-right">Amount</th>
                  <th className="p-3.5">Reason & Details</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 text-right">Action / Approval</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60 font-medium">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-white">{req.requestNo}</td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900 dark:text-white text-sm">{req.employee?.fullName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {req.employee?.employeeCode} • {req.employee?.role}
                      </div>
                    </td>
                    <td className="p-3.5 text-slate-500 font-mono">
                      {new Date(req.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="p-3.5 text-right font-extrabold text-base text-emerald-600 dark:text-emerald-400 font-bahi">
                      {formatCurrency(req.amount)}
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{req.reason}</div>
                      {req.notes && <div className="text-[11px] text-slate-500 italic mt-0.5">{req.notes}</div>}
                    </td>
                    <td className="p-3.5 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                        req.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                        req.status === 'PENDING' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                        'bg-rose-500/10 text-rose-600 border-rose-500/20'
                      }`}>
                        {req.status === 'APPROVED' ? <CheckCircle className="w-3 h-3" /> : req.status === 'PENDING' ? <Clock className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {req.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      {req.status === 'PENDING' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenAction(req, 'APPROVE')}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow-sm transition"
                          >
                            <Check className="w-3.5 h-3.5" /> Disburse
                          </button>
                          <button
                            onClick={() => handleOpenAction(req, 'REJECT')}
                            className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow-sm transition"
                          >
                            <X className="w-3.5 h-3.5" /> Reject
                          </button>
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-500">
                          {req.approvedBy ? `Processed by ${req.approvedBy.fullName || req.approvedBy.username}` : 'Processed'}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Disbursal & Action Modal */}
      {actionModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bahi-card-emerald max-w-md w-full p-6 border border-slate-200/60 dark:border-slate-800/60 shadow-2xl relative space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white font-outfit">
                  {actionType === 'APPROVE' ? 'Approve & Disburse Salary Advance' : 'Reject Advance Request'}
                </h3>
                <p className="text-[11px] text-slate-500">Req: {selectedRequest.requestNo} • {selectedRequest.employee?.fullName}</p>
              </div>
              <button
                onClick={() => setActionModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1">
              <div className="flex justify-between font-extrabold text-slate-900 dark:text-white font-outfit">
                <span>Requested Amount:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bahi text-sm">{formatCurrency(selectedRequest.amount)}</span>
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-400">
                <strong>Reason:</strong> {selectedRequest.reason}
              </div>
            </div>

            <form onSubmit={handleProcessAdvance} className="space-y-4">
              {actionType === 'APPROVE' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Payment Payout Mode
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => { setDisbursedMode('CASH'); setAccountName('Petty Cash Drawer'); }}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                          disbursedMode === 'CASH'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <DollarSign className="w-4 h-4" /> Cash Disbursal
                      </button>
                      <button
                        type="button"
                        onClick={() => { setDisbursedMode('BANK'); setAccountName('HDFC Main Operational Account'); }}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                          disbursedMode === 'BANK'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <Building2 className="w-4 h-4" /> Bank Online / UPI
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Account / Payment Source Name
                    </label>
                    <input
                      type="text"
                      required
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      placeholder="e.g. Petty Cash / HDFC Bank"
                      className="bahi-input text-xs"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Manager Remarks / Notes
                </label>
                <textarea
                  rows="2"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional approval notes..."
                  className="bahi-input text-xs"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActionModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`py-2 px-5 text-xs font-bold text-white rounded-xl shadow-md transition flex items-center gap-1.5 ${
                    actionType === 'APPROVE'
                      ? 'bg-emerald-600 hover:bg-emerald-500'
                      : 'bg-rose-600 hover:bg-rose-500'
                  }`}
                >
                  {submitting ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : actionType === 'APPROVE' ? (
                    'Confirm Approval & Post to Khaata'
                  ) : (
                    'Confirm Rejection'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
