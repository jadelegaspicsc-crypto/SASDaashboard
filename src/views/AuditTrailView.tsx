import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { ROLE_LABELS } from '../services/auth';
import { 
  History, 
  Search, 
  Filter, 
  ShieldCheck, 
  Calendar, 
  User as UserIcon,
  CheckCircle2
} from 'lucide-react';

export const AuditTrailView: React.FC = () => {
  const { auditLogs } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModule, setFilterModule] = useState('');
  const [filterAction, setFilterAction] = useState('');

  const filteredLogs = useMemo(() => {
    return auditLogs.filter(l => {
      if (filterModule && l.module !== filterModule) return false;
      if (filterAction && l.action !== filterAction) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const mUser = l.userName.toLowerCase().includes(q);
        const mDetails = l.details.toLowerCase().includes(q);
        if (!mUser && !mDetails) return false;
      }
      return true;
    });
  }, [auditLogs, filterModule, filterAction, searchTerm]);

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-indigo-400" />
            <span>System Audit Trail &amp; Activity Log</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Tamper-evident chronological log of all additions, modifications, and status changes for government audit purposes
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Audit Logging Active</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by user or event details..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
          />
        </div>

        <select
          value={filterModule}
          onChange={e => setFilterModule(e.target.value)}
          className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-blue-500 cursor-pointer"
        >
          <option value="">All Modules</option>
          <option value="BUDGET">Budget / WFP</option>
          <option value="EXPENSE">Expenses</option>
          <option value="INVENTORY">Inventory</option>
          <option value="PRICELIST">Price List</option>
          <option value="RESTOCK">Restocking</option>
          <option value="ISSUANCE">Issuance</option>
          <option value="PROCUREMENT">Procurement</option>
          <option value="SYSTEM">System</option>
        </select>

        <select
          value={filterAction}
          onChange={e => setFilterAction(e.target.value)}
          className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-blue-500 cursor-pointer"
        >
          <option value="">All Actions</option>
          <option value="CREATE">CREATE</option>
          <option value="UPDATE">UPDATE</option>
          <option value="DELETE">DELETE</option>
          <option value="RESTOCK">RESTOCK</option>
          <option value="ISSUE">ISSUE</option>
          <option value="APPROVE">APPROVE</option>
          <option value="SYNC">SYNC</option>
        </select>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
              <tr>
                <th className="py-3 px-4 w-44">Timestamp</th>
                <th className="py-3 px-4 w-48">User &amp; Role</th>
                <th className="py-3 px-4 w-28 text-center">Action</th>
                <th className="py-3 px-4 w-28 text-center">Module</th>
                <th className="py-3 px-4">Event Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {filteredLogs.map(log => {
                const roleMeta = ROLE_LABELS[log.userRole];

                return (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('en-PH')}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-semibold text-white">{log.userName}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {roleMeta ? roleMeta.label.split('/')[0] : log.userRole}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        log.action === 'CREATE' ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30' :
                        log.action === 'UPDATE' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' :
                        log.action === 'DELETE' ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30' :
                        log.action === 'APPROVE' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
                        'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span className="font-mono text-[11px] text-slate-300 px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                        {log.module}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-200">
                      {log.details}
                    </td>
                  </tr>
                );
              })}

              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <History className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                    <div className="text-sm font-medium text-slate-300">No audit events recorded</div>
                    <div className="text-xs text-slate-400 mt-1">Actions performed in the system will automatically appear here.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
