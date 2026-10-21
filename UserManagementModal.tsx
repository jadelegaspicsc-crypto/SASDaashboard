import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ROLE_LABELS, Role } from '../services/auth';
import { User } from '../types';
import { 
  Users, 
  UserPlus, 
  Edit3, 
  Trash2, 
  Key, 
  ShieldCheck, 
  CheckCircle2, 
  X, 
  AlertCircle,
  Building,
  Mail,
  User as UserIcon,
  Check
} from 'lucide-react';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({ isOpen, onClose }) => {
  const { users, currentUser, switchUser, registerUser, updateUser, deleteUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'list' | 'add'>('list');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Add / Edit form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('staff');
  const [designation, setDesignation] = useState('');
  const [division, setDivision] = useState('Support and Administrative Services');
  const [password, setPassword] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-white text-base">User &amp; Team Management</h2>
              <p className="text-xs text-slate-400">Manage user accounts, roles, access permissions, and passwords</p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 mt-4 pb-2 border-b border-slate-800/80">
          <button
            onClick={() => { setActiveTab('list'); setEditingUserId(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'list' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Active Team Accounts ({users.length})</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'add' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{editingUserId ? 'Edit Account' : 'Add New Account'}</span>
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className={`mt-3 p-3 rounded-xl border text-xs flex items-center gap-2 ${
            feedback.type === 'success' 
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' 
              : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
          }`}>
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-3">
          
          {/* TAB 1: USER LIST */}
          {activeTab === 'list' && (
            <div className="space-y-3">
              {users.map(u => {
                const roleMeta = ROLE_LABELS[u.role] || ROLE_LABELS.staff;
                const isCurrent = currentUser?.id === u.id;

                return (
                  <div 
                    key={u.id}
                    className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isCurrent 
                        ? 'bg-blue-950/20 border-blue-500/40 shadow-sm' 
                        : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl ${roleMeta.bg} text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-sm`}>
                        {u.name.charAt(0)}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white truncate">{u.name}</span>
                          {isCurrent && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold">
                              You (Active)
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-slate-400 mt-0.5 truncate">{u.email}</div>

                        <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px] text-slate-400">
                          <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${roleMeta.badgeColor}`}>
                            {roleMeta.label}
                          </span>
                          <span>·</span>
                          <span className="text-slate-300">{u.designation}</span>
                          <span>·</span>
                          <span className="text-slate-400">{u.division}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800 w-full sm:w-auto justify-end">
                      {!isCurrent && (
                        <button
                          onClick={() => switchUser(u.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                          title="Switch active user"
                        >
                          Switch To
                        </button>
                      )}

                      <button
                        onClick={() => handleOpenEdit(u)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-blue-400 transition-colors"
                        title="Edit user details"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {users.length > 1 && (
                        <button
                          onClick={() => handleDelete(u)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                          title="Delete user account"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: ADD / EDIT USER FORM */}
          {activeTab === 'add' && (
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
                  <option value="admin">Assistant Commissioner / Admin (Full Access &amp; Approvals)</option>
                  <option value="budget_officer">Budget Officer (WFP Allotments &amp; Expense Ledger)</option>
                  <option value="supply_custodian">Supply Custodian (Inventory, Restock &amp; Issuances)</option>
                  <option value="staff">Administrative Staff (Stock Viewing &amp; RIS Requests)</option>
                </select>

                <div className="mt-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                  <div className="font-semibold text-slate-300">
                    Permissions for {ROLE_LABELS[role].label}:
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
                  placeholder={editingUserId ? 'Enter new password...' : 'Enter initial password...'}
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
          )}

        </div>

      </div>
    </div>
  );
};
