import React from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { formatPeso, formatDate } from '../utils/auditExport';
import { 
  Wallet, 
  Receipt, 
  Package, 
  AlertTriangle, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  Truck, 
  FileSpreadsheet, 
  Plus, 
  ExternalLink,
  Sparkles,
  Printer
} from 'lucide-react';
import { NavTab } from '../components/Sidebar';

interface DashboardViewProps {
  onNavigate: (tab: NavTab) => void;
  onOpenAddExpense: () => void;
  onOpenRestock: () => void;
  onOpenIssuance: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenAddExpense,
  onOpenRestock,
  onOpenIssuance
}) => {
  const { 
    totalApprovedBudget, 
    totalObligatedExpenses, 
    totalDisbursedExpenses,
    remainingBudget, 
    utilizationRate, 
    lowStockItems,
    inventory,
    expenses,
    restockRecords,
    issuanceRecords,
    budgetItems,
    fiscalYear,
    checkAndGenerateAutoProcurement
  } = useData();

  const { permissions } = useAuth();

  const todayFormatted = new Date().toLocaleDateString('en-PH', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handleGenerateAutoPR = () => {
    const pr = checkAndGenerateAutoProcurement();
    onNavigate('procurement');
  };

  return (
    <div className="space-y-6">
      
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 border border-blue-900/50 p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 -mb-10 w-60 h-60 bg-indigo-600/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-blue-400 mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                Office Work &amp; Financial Plan (WFP) · FY {fiscalYear}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Budget &amp; Supplies Command Center
              </h1>
              <p className="text-sm text-slate-300 mt-1">
                Office of the Assistant Commissioner for Support and Administrative Services
              </p>
              <div className="text-xs text-slate-400 mt-2 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                <span>{todayFormatted}</span>
              </div>
            </div>

            {/* Quick Alert Card */}
            <div className="flex items-center gap-3">
              <div className={`p-4 rounded-xl border backdrop-blur-md flex items-center gap-4 ${
                lowStockItems.length > 0 
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-200' 
                  : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-200'
              }`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-mono font-bold text-2xl ${
                  lowStockItems.length > 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {lowStockItems.length}
                </div>
                <div>
                  <div className="text-xs uppercase font-bold tracking-wider opacity-80">
                    {lowStockItems.length > 0 ? 'Low Stock Alerts' : 'Inventory Status'}
                  </div>
                  <div className="text-xs font-medium text-slate-300 mt-0.5">
                    {lowStockItems.length > 0 ? 'Items below threshold' : 'All items well stocked'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar & Burn-down */}
          <div className="mt-6 pt-5 border-t border-slate-800/80">
            <div className="flex justify-between items-center text-xs font-medium mb-2">
              <span className="text-slate-300">
                Annual Allocation: <strong className="text-white font-mono">{formatPeso(totalApprovedBudget)}</strong>
              </span>
              <span className={utilizationRate > 90 ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                {utilizationRate.toFixed(2)}% Utilized
              </span>
            </div>

            <div className="h-3 w-full bg-slate-950/70 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div 
                className={`h-full rounded-full transition-all duration-700 ${
                  utilizationRate > 90 ? 'bg-rose-500' : utilizationRate > 75 ? 'bg-amber-500' : 'bg-gradient-to-r from-emerald-500 to-blue-500'
                }`}
                style={{ width: `${Math.min(utilizationRate, 100)}%` }}
              />
            </div>

            <div className="flex justify-between text-xs text-slate-400 mt-2 font-mono">
              <span>Obligated: <strong className="text-blue-400">{formatPeso(totalObligatedExpenses)}</strong></span>
              <span>Disbursed: <strong className="text-emerald-400">{formatPeso(totalDisbursedExpenses)}</strong></span>
              <span>Remaining: <strong className={remainingBudget < 0 ? 'text-rose-400' : 'text-emerald-400'}>{formatPeso(remainingBudget)}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Threshold Reorder Action Banner */}
      {lowStockItems.length > 0 && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-slate-900 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="text-sm font-bold text-amber-300">
                Safety Stock Reorder Threshold Reached ({lowStockItems.length} items)
              </div>
              <div className="text-xs text-slate-300 mt-0.5">
                Supplies such as <span className="text-amber-200 font-medium">{lowStockItems.slice(0, 3).map(i => i.name).join(', ')}</span> have dropped to or below their safety reorder limit.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleGenerateAutoPR}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate Auto-PR</span>
            </button>
            <button
              onClick={() => onNavigate('inventory')}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
            >
              View Inventory
            </button>
          </div>
        </div>
      )}

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Approved Budget */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Approved Budget</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-extrabold font-mono text-white">
            {formatPeso(totalApprovedBudget)}
          </div>
          <div className="text-xs text-slate-400 mt-1 flex items-center justify-between">
            <span>{budgetItems.length} Budget Line Items</span>
            <span className="text-blue-400 font-medium">MOOE + CO</span>
          </div>
        </div>

        {/* Total Obligated */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Obligated</span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-extrabold font-mono text-rose-400">
            {formatPeso(totalObligatedExpenses)}
          </div>
          <div className="text-xs text-slate-400 mt-1 flex items-center justify-between">
            <span>{expenses.length} Transactions</span>
            <span className="text-rose-400 font-bold">{utilizationRate.toFixed(1)}% used</span>
          </div>
        </div>

        {/* Remaining Balance */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Remaining Balance</span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              remainingBudget < 0 ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'
            }`}>
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className={`mt-3 text-2xl font-extrabold font-mono ${
            remainingBudget < 0 ? 'text-rose-400' : 'text-emerald-400'
          }`}>
            {formatPeso(remainingBudget)}
          </div>
          <div className="text-xs text-slate-400 mt-1 flex items-center justify-between">
            <span>Available for obligation</span>
            <span className="text-emerald-400 font-medium">On Track</span>
          </div>
        </div>

        {/* Total Inventory Items */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Supplies Inventory</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-extrabold font-mono text-purple-300">
            {inventory.length}
          </div>
          <div className="text-xs text-slate-400 mt-1 flex items-center justify-between">
            <span>{inventory.filter(i => i.quantity > i.minStock).length} Normal Stock</span>
            {lowStockItems.length > 0 ? (
              <span className="text-amber-400 font-semibold">{lowStockItems.length} Low Stock</span>
            ) : (
              <span className="text-emerald-400 font-medium">Optimal</span>
            )}
          </div>
        </div>
      </div>

      {/* Two Column Layout: Low Stock Panel + Recent Issuances */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Low Stock Watchlist */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-md flex flex-col">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold text-white">Stock Level Alerts</h2>
              {lowStockItems.length > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold">
                  {lowStockItems.length}
                </span>
              )}
            </div>
            <button
              onClick={() => onNavigate('inventory')}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div className="p-4 flex-1">
            {lowStockItems.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
                <div className="text-sm font-medium text-slate-200">All supplies are well stocked</div>
                <div className="text-xs text-slate-400 mt-1">No items currently below safety reorder thresholds.</div>
              </div>
            ) : (
              <div className="space-y-2.5">
                {lowStockItems.map(item => (
                  <div 
                    key={item.id} 
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="text-xs font-semibold text-white">{item.name}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Current: <span className="font-bold text-amber-400">{item.quantity} {item.unit}</span> · Min threshold: {item.minStock} {item.unit}
                      </div>
                    </div>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                      Reorder Needed
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Supply Issuances */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-md flex flex-col">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-blue-400" />
              <h2 className="text-sm font-bold text-white">Recent Supply Issuances</h2>
            </div>
            <button
              onClick={() => onNavigate('issuance')}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div className="p-4 flex-1">
            {issuanceRecords.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Receipt className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                <div className="text-sm font-medium text-slate-200">No issuances recorded yet</div>
              </div>
            ) : (
              <div className="space-y-2.5">
                {issuanceRecords.slice(0, 4).map(iss => (
                  <div key={iss.id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">
                          {iss.id}
                        </span>
                        <span className="text-xs font-semibold text-white">{iss.requester}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 truncate max-w-xs">
                        {iss.items.map(i => `${i.name} (${i.qty})`).join(', ')}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[11px] text-slate-400 font-mono">{formatDate(iss.date)}</div>
                      <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full inline-block mt-0.5">
                        {iss.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Recent Restocking & Quick Action Strip */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-md">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-bold text-white">Recent Restocking Records</h2>
          </div>
          <div className="flex items-center gap-2">
            {permissions.canRestock && (
              <button
                onClick={onOpenRestock}
                className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Restock</span>
              </button>
            )}
            <button
              onClick={() => onNavigate('restock')}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 cursor-pointer"
            >
              <span>View History</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 font-semibold">Request ID</th>
                <th className="py-3 px-4 font-semibold">Date Received</th>
                <th className="py-3 px-4 font-semibold">Reference Document</th>
                <th className="py-3 px-4 font-semibold">Items Received</th>
                <th className="py-3 px-4 font-semibold text-right">Total Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {restockRecords.slice(0, 5).map(r => (
                <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-purple-400">{r.id}</td>
                  <td className="py-3 px-4 text-slate-300">{formatDate(r.date)}</td>
                  <td className="py-3 px-4 text-slate-300">
                    <span className="font-semibold text-blue-400 mr-1.5">{r.docType}</span>
                    <span className="text-slate-400">{r.refNum || '—'}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-300 truncate max-w-sm">
                    {r.items.map(it => `${it.name} (x${it.qty})`).join(', ')}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-right text-emerald-400">
                    {formatPeso(r.totalCost)}
                  </td>
                </tr>
              ))}
              {restockRecords.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No restocking records yet.
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
