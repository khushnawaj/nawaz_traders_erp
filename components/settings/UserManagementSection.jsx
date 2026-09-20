'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  ShieldCheck, 
  UserPlus, 
  Search, 
  CheckCircle, 
  XCircle, 
  UserCheck, 
  Wheat, 
  RefreshCw,
  Edit,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

const ROLES_LIST = [
  { id: 'OWNER', label: 'Owner (Full Access & User Control)', badgeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' },
  { id: 'CO_OWNER', label: 'Co-Owner (Operational & Financial Control)', badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' },
  { id: 'ADMIN', label: 'Administrator', badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
  { id: 'MANAGER', label: 'Mandi & Operations Manager', badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20' },
  { id: 'ACCOUNTANT', label: 'Financial Accountant', badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  { id: 'OPERATOR', label: 'Data Entry Operator', badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' },
  { id: 'EMPLOYEE', label: 'Employee Portal User', badgeColor: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20' },
  { id: 'FARMER', label: 'Farmer Portal User', badgeColor: 'bg-amber-600/10 text-amber-700 dark:text-amber-300 border-amber-600/20' },
];

export default function UserManagementSection() {
  const [users, setUsers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    role: 'OPERATOR',
    password: '',
    employeeId: '',
    partyId: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resUsers, resEmp, resParties] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/employees'),
        fetch('/api/parties?role=FARMER'),
      ]);

      const dataUsers = await resUsers.json();
      const dataEmp = await resEmp.json();
      const dataParties = await resParties.json();

      if (dataUsers.success) setUsers(dataUsers.users || dataUsers.data || []);
      if (dataEmp.success) setEmployees(dataEmp.data || dataEmp.employees || []);
      if (dataParties.success) setParties(dataParties.data || dataParties.parties || []);
    } catch (err) {
      toast.error('Failed to load user accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setFormData({
      fullName: '',
      username: '',
      email: '',
      phone: '',
      role: 'OPERATOR',
      password: '',
      employeeId: '',
      partyId: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      fullName: user.fullName || '',
      username: user.username || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || 'OPERATOR',
      password: '',
      employeeId: user.employeeId || '',
      partyId: user.partyId || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users';
      const method = editingUser ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save user');
      }

      toast.success(editingUser ? 'User role updated' : 'User account created');
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeactivate = async (id, name) => {
    if (!confirm(`Deactivate ${name}'s account?`)) return;

    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Deactivation failed');
      toast.success('User account deactivated');
      fetchData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleActivateUser = async (user) => {
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ACTIVE' }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Activation failed');
      toast.success(`🎉 ${user.fullName}'s account activated successfully!`);
      fetchData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const pendingUsers = users.filter((u) => u.status === 'INACTIVE');

  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      (u.email && u.email.toLowerCase().includes(search.toLowerCase()));

    const matchesRole = selectedRoleFilter === 'ALL' || u.role === selectedRoleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="glass-card p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-xl space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/60 dark:border-slate-800/60">
        <div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white font-outfit flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-500" /> User Accounts & Role Permissions
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
            Assign Owner, Co-Owner, Manager, Accountant roles, or link Employee & Farmer self-service portals
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="bahi-btn-primary py-2 px-4 text-xs"
        >
          <UserPlus className="w-4 h-4 text-amber-300" /> Add User Account
        </button>
      </div>

      {/* Pending Approval Banner if any pending signups exist */}
      {pendingUsers.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-sm shadow-sm font-outfit">
              {pendingUsers.length}
            </div>
            <div>
              <div className="text-xs font-bold text-amber-600 dark:text-amber-400 font-outfit uppercase tracking-wider">
                Pending Signup Activations
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                {pendingUsers.length} user account(s) signed up and waiting for your activation & role assignment.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by name, username, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="app-input app-input-with-icon text-xs"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[{ id: 'ALL', label: 'All Roles' }, ...ROLES_LIST].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedRoleFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold whitespace-nowrap transition ${
                selectedRoleFilter === tab.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="p-8 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-emerald-500" /> Loading user accounts...
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="p-8 text-center text-slate-500 text-xs">No user accounts found matching your search.</div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200/60 dark:border-slate-800/60">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 font-semibold uppercase border-b border-slate-200/60 dark:border-slate-800/60">
              <tr>
                <th className="p-3">User Details</th>
                <th className="p-3">Assigned Role</th>
                <th className="p-3">Linked Profile</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60 font-medium">
              {filteredUsers.map((u) => {
                const roleObj = ROLES_LIST.find((r) => r.id === u.role);

                return (
                  <tr key={u.id} className={`transition ${u.status === 'INACTIVE' ? 'bg-amber-500/5 hover:bg-amber-500/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'}`}>
                    <td className="p-3">
                      <div className="font-bold text-slate-900 dark:text-white font-outfit flex items-center gap-2">
                        {u.fullName}
                        {u.status === 'INACTIVE' && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                            Pending Signup
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">@{u.username} {u.email ? `• ${u.email}` : ''} {u.phone ? `• ${u.phone}` : ''}</div>
                    </td>

                    <td className="p-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                        roleObj?.badgeColor || 'bg-slate-100 text-slate-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>

                    <td className="p-3 text-slate-600 dark:text-slate-400">
                      {u.employee ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 text-[10px] font-bold">
                          <UserCheck className="w-3 h-3" /> Staff: {u.employee.fullName} ({u.employee.employeeCode})
                        </span>
                      ) : u.party ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                          <Wheat className="w-3 h-3" /> Farmer: {u.party.name} ({u.party.partyCode})
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Internal Management</span>
                      )}
                    </td>

                    <td className="p-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        u.status === 'ACTIVE' 
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                      }`}>
                        {u.status === 'ACTIVE' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {u.status === 'ACTIVE' ? 'ACTIVE' : 'PENDING'}
                      </span>
                    </td>

                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {u.status === 'INACTIVE' ? (
                          <button
                            onClick={() => handleActivateUser(u)}
                            className="bahi-btn-primary py-1 px-3 text-[11px]"
                            title="Activate & Grant Access"
                          >
                            <CheckCircle className="w-3.5 h-3.5 text-amber-300" /> Activate Account
                          </button>
                        ) : null}

                        <button
                          onClick={() => handleOpenEditModal(u)}
                          className="p-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 transition"
                          title="Edit User Role & Link Record"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        {u.status === 'ACTIVE' && (
                          <button
                            onClick={() => handleDeactivate(u.id, u.fullName)}
                            className="p-1.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition"
                            title="Deactivate Account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-xl rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
              <h4 className="font-bold text-sm flex items-center gap-2 font-outfit">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                {editingUser ? 'Edit User Credentials & Role' : 'Create New User Account'}
              </h4>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="app-label">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="app-input"
                  />
                </div>

                <div>
                  <label className="app-label">Username *</label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="app-input"
                    disabled={!!editingUser}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="app-label">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="app-input"
                  />
                </div>

                <div>
                  <label className="app-label">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="app-input"
                  />
                </div>
              </div>

              <div>
                <label className="app-label">System Access Role *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="app-select font-bold"
                >
                  {ROLES_LIST.map((r) => (
                    <option key={r.id} value={r.id}>{r.label}</option>
                  ))}
                </select>
              </div>

              {formData.role === 'EMPLOYEE' && (
                <div className="p-3 rounded-2xl bg-teal-500/10 border border-teal-500/20 space-y-1.5">
                  <label className="app-label text-teal-700 dark:text-teal-300">Link Employee Record *</label>
                  <select
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    className="app-select"
                  >
                    <option value="">-- Select Employee --</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>{emp.fullName} ({emp.employeeCode})</option>
                    ))}
                  </select>
                </div>
              )}

              {formData.role === 'FARMER' && (
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1.5">
                  <label className="app-label text-amber-700 dark:text-amber-300">Link Farmer Record *</label>
                  <select
                    value={formData.partyId}
                    onChange={(e) => setFormData({ ...formData, partyId: e.target.value })}
                    className="app-select"
                  >
                    <option value="">-- Select Farmer --</option>
                    {parties.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} ({p.partyCode})</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="app-label">{editingUser ? 'New Password (Optional)' : 'Password *'}</label>
                <input
                  type="password"
                  required={!editingUser}
                  placeholder="Enter password..."
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="app-input"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-500">Cancel</button>
                <button type="submit" disabled={formLoading} className="bahi-btn-primary py-2 px-4 text-xs">
                  {formLoading ? 'Saving...' : editingUser ? 'Update Role' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
