import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { ROLE_LABELS, Role } from '../services/auth';
import { formatPeso } from '../utils/auditExport';
import { 
  Building2, 
  Bell, 
  Database, 
  RefreshCw, 
  User as UserIcon, 
  LogOut, 
  ChevronDown, 
  CheckCircle2, 
  AlertTriangle,
  Sparkles,
  Download,
  Users
} from 'lucide-react';

interface HeaderProps {
  onOpenSupabase: () => void;
  onOpenProcurement: () => void;
  onOpenLogin: () => void;
  onOpenUserManagement: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSupabase,
  onOpenProcurement,
  onOpenLogin,
  onOpenUserManagement
}) => {
  const { currentUser, switchUser, users, logout } = useAuth();
  const { 
    totalApprovedBudget, 
    totalObligatedExpenses, 
    utilizationRate, 
    lowStockItems, 
    supabaseConfig, 
    syncWithSupabase, 
    isSyncing,
    fiscalYear,
    setFiscalYear
  } = useData();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const handleSync = async () => {
    const res = await syncWithSupabase();
    setSyncFeedback(res.message);
    setTimeout(() => setSyncFeedback(null), 4000);
  };

  const currentRole: Role = currentUser?.role || 'staff';
  const roleInfo = ROLE_LABELS[currentRole] || ROLE_LABELS.staff;

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-200 px-4 lg:px-6 py-3 transition-colors no-print">
      <div className="flex items-center justify-between gap-4">
        
        {/* Left: Brand & Seal */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-sky-500 p-0.5 shadow-md shadow-blue-500/20 flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-slate-950/40 rounded-[10px] flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white">CSC · OACSAS</span>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30">
                Official WFP
              </span>
            </div>
            <div className="text-xs text-slate-400 truncate max-w-[280px] sm:max-w-md hidden sm:block">
              Office of the Assistant Commissioner for Support and Administrative Services
            </div>
          </div>
        </div>

        {/* Middle: Fiscal Year & Real-time Budget Utilization Pill */}
        <div className="hidden xl:flex items-center gap-4 bg-slate-950/60 border border-slate-800/80 rounded-xl px-3.5 py-1.5 shadow-inner">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">FY</span>
            <select
              value={fiscalYear}
              onChange={(e) => setFiscalYear(Number(e.target.value))}
              aria-label="Select Fiscal Year"
              className="bg-slate-900 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 px-2 py-1 outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value={2026}>2026</option>
              <option value={2025}>2025</option>
              <option value={2027}>2027</option>
            </select>
          </div>

          <div className="h-4 w-px bg-slate-800" />

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[11px] text-slate-400 font-medium leading-none">Obligated / Allotment</div>
              <div className="text-xs font-mono font-semibold text-slate-200 mt-0.5">
                <span className="text-blue-400">{formatPeso(totalObligatedExpenses)}</span>
                <span className="text-slate-500"> / {formatPeso(totalApprovedBudget)}</span>
              </div>
            </div>

            <div className="w-24 bg-slate-800 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 rounded-full ${
                  utilizationRate > 90 ? 'bg-rose-500' : utilizationRate > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(utilizationRate, 100)}%` }}
              />
            </div>

            <span className={`text-xs font-mono font-bold ${
              utilizationRate > 90 ? 'text-rose-400' : utilizationRate > 70 ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {utilizationRate.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Right: Actions, Supabase, Low Stock Alert, User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Low Stock Quick Alert */}
          <button
            onClick={onOpenProcurement}
            title={`${lowStockItems.length} items reached minimum safety stock`}
            className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              lowStockItems.length > 0
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
                : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className={`w-3.5 h-3.5 ${lowStockItems.length > 0 ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">Stock Alert</span>
            {lowStockItems.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold text-[11px] flex items-center justify-center">
                {lowStockItems.length}
              </span>
            )}
          </button>

          {/* Supabase Cloud Sync Button */}
          <button
            onClick={onOpenSupabase}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              supabaseConfig.isConnected
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-600'
            }`}
            title="Supabase Cloud Synchronization & Settings"
          >
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">
              {supabaseConfig.isConnected ? 'Supabase Connected' : 'Cloud Sync'}
            </span>
            {supabaseConfig.isConnected && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            )}
          </button>

          {/* Sync Trigger Button */}
          {supabaseConfig.isConnected && (
            <button
              onClick={handleSync}
              disabled={isSyncing}
              title="Push & Sync Records with Supabase Database"
              className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-blue-400' : ''}`} />
            </button>
          )}

          {/* User Profile & Role Switcher */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 transition-all text-left"
              >
                <div className={`w-7 h-7 rounded-lg ${roleInfo.bg} text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm`}>
                  {currentUser.name.charAt(0)}
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-semibold text-white leading-tight flex items-center gap-1.5">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-slate-400 leading-tight">
                    {roleInfo.label.split('/')[0]}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div 
                  className="absolute right-0 mt-2 w-72 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-150"
                  onMouseLeave={() => setShowUserMenu(false)}
                >
                  <div className="p-2 border-b border-slate-800 mb-2">
                    <div className="font-semibold text-slate-100 text-sm">{currentUser.name}</div>
                    <div className="text-slate-400 text-xs">{currentUser.email}</div>
                    <div className="mt-1.5 inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-slate-800 text-slate-300">
                      {currentUser.designation}
                    </div>
                  </div>

                  <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1">
                    Quick Role Switcher (Team Demo)
                  </div>

                  <div className="space-y-1 mb-2">
                    {users.map(u => (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchUser(u.id);
                          setShowUserMenu(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors ${
                          u.id === currentUser.id 
                            ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30' 
                            : 'hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        <div>
                          <div className="font-medium text-xs">{u.name}</div>
                          <div className="text-[10px] text-slate-400">{ROLE_LABELS[u.role].label}</div>
                        </div>
                        {u.id === currentUser.id && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-slate-800 pt-2 space-y-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenUserManagement();
                      }}
                      className="w-full py-2 px-2.5 rounded-lg bg-blue-600/15 hover:bg-blue-600 text-blue-300 hover:text-white font-semibold flex items-center justify-center gap-1.5 transition-colors border border-blue-500/30"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Manage Team &amp; Accounts</span>
                    </button>

                    <div className="flex gap-1 pt-1">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onOpenLogin();
                        }}
                        className="flex-1 py-1.5 text-center rounded-lg hover:bg-slate-800 text-slate-300 font-medium transition-colors"
                      >
                        Switch Account
                      </button>
                      <button
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                        }}
                        className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg hover:bg-rose-500/20 text-rose-400 font-medium transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow-md shadow-blue-600/30"
            >
              <UserIcon className="w-3.5 h-3.5" />
              Sign In
            </button>
          )}

        </div>
      </div>

      {/* Sync Notification Banner */}
      {syncFeedback && (
        <div className="mt-2 text-xs bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 px-3 py-1.5 rounded-lg flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{syncFeedback}</span>
          </div>
          <button 
            onClick={() => setSyncFeedback(null)}
            className="text-emerald-400 hover:text-white ml-2 text-sm font-bold"
          >
            ×
          </button>
        </div>
      )}
    </header>
  );
};
