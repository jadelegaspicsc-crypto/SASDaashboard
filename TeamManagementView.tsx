import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ROLE_LABELS, Role } from '../services/auth';
import { User } from '../types';
import { 
  Users, 
  UserPlus, 
  Edit3, 
  Trash2, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  Building,
  Mail,
  User as UserIcon,
  Key
} from 'lucide-react';

export const TeamManagementView: React.FC = () => {
  const { users, currentUser, switchUser, registerUser, updateUser, deleteUser, permissions } = useAuth();

  const [activeTab, setActiveTab] = useState<'list' | 'add'>('list');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('staff');
  const [designation, setDesignation] = useState('');
  const [division, setDivision] = useState('Support and Administrative Services');
  const [password, setPassword] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleOpenAdd = () => {
    setEditingUserId(null);
    setName('');
    setEmail('');
    setRole('staff');
    setDesignation('Administrative Officer');
    setDivision('Support and Administrative Services');
    setPassword('Oacsas@2026!');
    setFeedback(null);
    setActiveTab('add');
  };

  const handleOpenEdit = (user: User) => {
    setEditingUserId(user.id);
    setName(user.name);
    setEmail(user.email);
    setRole(user.role);
    setDesignation(user.designation);
    setDivision(user.division);
    setPassword('');
    setFeedback(null);
    setActiveTab('add');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!name.trim() || !email.trim()) {
      setFeedback({ type: 'error', message: 'Name and email are required.' });
      return;
    }

    if (editingUserId) {
      const res = await updateUser(editingUserId, {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role,
        designation: designation.trim(),
        division: division.trim(),
        ...(password.trim() ? { password: password.trim() } : {})
      });

      if (res.success) {
        setFeedback({ type: 'success', message: 'Account updated successfully!' });
        setTimeout(() => {
          setActiveTab('list');
          setEditingUserId(null);
        }, 1200);
      } else {
        setFeedback({ type: 'error', message: res.error || 'Failed to update account.' });
      }
    } else {
      const res = await registerUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role,
        designation: designation.trim(),
        division: division.trim(),
        password: password.trim() || 'Oacsas@2026!'
      });

      if (res.success) {
        setFeedback({ type: 'success', message: 'New user account created successfully!' });
        setTimeout(() => {
          setActiveTab('list');
        }, 1200);
      } else {
        setFeedback({ type: 'error', message: res.error || 'Failed to create account.' });
      }
    }
  };

  const handleDelete = (user: User) => {
    if (confirm(`Are you sure you want to delete account "${user.name}" (${user.email})?`)) {
      const res = deleteUser(user.id);
      if (!res.success) {
        alert(res.error || 'Cannot delete user.');
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-500" />
            <span>Team &amp; Account Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Configure user access roles, add team members, reset passwords, and audit login privileges
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-blue-600/30 transition-all cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Account</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => { setActiveTab('list'); setEditingUserId(null); }}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ${
            activeTab === 'list' 
              ? 'bg-blue-600 text-white shadow-sm' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Active Team Directory ({users.length})</span>
        </button>

        <button
          onClick={handleOpenAdd}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ${
            activeTab === 'add' 
              ? 'bg-blue-600 text-white shadow-sm' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>{editingUserId ? 'Edit Account' : 'Add Account'}</span>
        </button>
      </div>

      {feedback && (
        <div className={`p-4 rounded-xl border text-xs flex items-center gap-2 ${
          feedback.type === 'success' 
            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' 
            : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* TAB 1: LIST */}
      {activeTab === 'list' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {users.map(u => {
            const roleMeta = ROLE_LABELS[u.role] || ROLE_LABELS.staff;
            const isCurrent = currentUser?.id === u.id;

            return (
              <div 
                key={u.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${
                  isCurrent 
                    ? 'bg-gradient-to-br from-blue-950/40 via-slate-900 to-slate-900 border-blue-500/40 shadow-lg' 
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className={`w-12 h-12 rounded-xl ${roleMeta.bg} text-white font-extrabold text-base flex items-center justify-center shrink-0 shadow-md`}>
                    {u.name.charAt(0)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-white truncate">{u.name}</span>
                      {isCurrent && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold shrink-0">
                          Active User
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-400 mt-0.5 truncate">{u.email}</div>

                    <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs">
                      <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${roleMeta.badgeColor}`}>
                        {roleMeta.label}
                      </span>
                    </div>

                    <div className="mt-2 text-xs text-slate-300 space-y-0.5">
                      <div><strong className="text-slate-400 font-normal">Designation:</strong> {u.designation}</div>
                      <div><strong className="text-slate-400 font-normal">Division:</strong> {u.division}</div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <div>
                    {!isCurrent && (
                      <button
                        onClick={() => switchUser(u.id)}
                        className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Switch To This Account
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(u)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-blue-400 transition-colors cursor-pointer"
                      title="Edit account details"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {users.length > 1 && (
                      <button
                        onClick={() => handleDelete(u)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Delete user account"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: ADD OR EDIT */}
      {activeTab === 'add' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md max-w-2xl">
          <h2 className="text-base font-bold text-white mb-4">
            {editingUserId ? 'Edit Account Details & Password' : 'Add New Team Member Account'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maria Santos"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Official Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. m.santos@oacsas.gov.ph"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Role / Access Level *</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as Role)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="admin">Assistant Commissioner / Admin (Full Administrative Authority)</option>
                <option value="budget_officer">Budget Officer (WFP Allotments &amp; Expense Ledger)</option>
                <option value="supply_custodian">Supply Custodian (Inventory, Restock &amp; Issuances)</option>
                <option value="staff">Administrative Staff (Stock Viewing &amp; RIS Requests)</option>
              </select>

              <div className="mt-2 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-1">
                <div className="font-semibold text-slate-300">
                  Permissions Summary for {ROLE_LABELS[role].label}:
                </div>
                {role === 'admin' && (
                  <div>Can manage all budget line items, approve procurement requests, delete transactions, manage users, and configure cloud sync.</div>
                )}
                {role === 'budget_officer' && (
                  <div>Can view and edit WFP allotments, record and update expenses, and export financial audit reports.</div>
                )}
                {role === 'supply_custodian' && (
                  <div>Can add and edit inventory items, master prices, receive restocking deliveries, and record supply issuances.</div>
                )}
                {role === 'staff' && (
                  <div>Can view real-time supply availability, submit requisition requests, and generate Appendix 63 RIS slips.</div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Job Designation</label>
                <input
                  type="text"
                  placeholder="e.g. Administrative Officer IV"
                  value={designation}
                  onChange={e => setDesignation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Division / Office</label>
                <input
                  type="text"
                  placeholder="e.g. Support &amp; Administrative Services"
                  value={division}
                  onChange={e => setDivision(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {editingUserId ? 'Change Password (leave empty to keep current)' : 'Password *'}
              </label>
              <input
                type="password"
                placeholder={editingUserId ? 'Type new password...' : 'Enter password (e.g. Oacsas@2026!)...'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => { setActiveTab('list'); setEditingUserId(null); }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 cursor-pointer"
              >
                {editingUserId ? 'Save Account Changes' : 'Create User Account'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
