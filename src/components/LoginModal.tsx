import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ROLE_LABELS } from '../services/auth';
import { Role } from '../types';
import { 
  Lock, 
  Mail, 
  Key, 
  Building2, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck,
  UserCheck
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { login, users } = useAuth();

  const [email, setEmail] = useState('admin@oacsas.gov.ph');
  const [password, setPassword] = useState('Admin@2026!');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await login(email.trim(), password);
      if (res.success) {
        onClose();
      } else {
        setError(res.error || 'Authentication failed. Please verify credentials.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during login.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectQuickAccount = (userEmail: string, defaultPw: string) => {
    setEmail(userEmail);
    setPassword(defaultPw);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base leading-tight">OACSAS Secure Sign-In</h3>
              <p className="text-xs text-slate-400">Encrypted Role-Based Authentication</p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Government Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                required
                placeholder="name@oacsas.gov.ph"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Encrypted Password</label>
            <div className="relative">
              <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoading ? 'Verifying Credentials...' : 'Authenticate & Enter System'}
          </button>
        </form>

        {/* Demo Accounts Quick Selection */}
        <div className="mt-6 pt-4 border-t border-slate-800 space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Quick 1-Click Role Accounts (Team Access)
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleSelectQuickAccount('admin@oacsas.gov.ph', 'Admin@2026!')}
              className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition-colors"
            >
              <div className="font-bold text-indigo-400">Assistant Commissioner</div>
              <div className="text-[10px] text-slate-400">Full Access / Admin</div>
            </button>

            <button
              type="button"
              onClick={() => handleSelectQuickAccount('budget@oacsas.gov.ph', 'Budget@2026!')}
              className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition-colors"
            >
              <div className="font-bold text-emerald-400">Budget Officer</div>
              <div className="text-[10px] text-slate-400">WFP &amp; Expenses</div>
            </button>

            <button
              type="button"
              onClick={() => handleSelectQuickAccount('supply@oacsas.gov.ph', 'Supply@2026!')}
              className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition-colors"
            >
              <div className="font-bold text-amber-400">Supply Custodian</div>
              <div className="text-[10px] text-slate-400">Inventory &amp; Restock</div>
            </button>

            <button
              type="button"
              onClick={() => handleSelectQuickAccount('staff@oacsas.gov.ph', 'Staff@2026!')}
              className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition-colors"
            >
              <div className="font-bold text-blue-400">Staff / Requester</div>
              <div className="text-[10px] text-slate-400">View &amp; Submit RIS</div>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
