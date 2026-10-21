import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { formatPeso } from '../utils/auditExport';
import { exportFullAuditWorkbook, exportAuditPDF } from '../utils/auditExport';
import { 
  BarChart3, 
  FileSpreadsheet, 
  Printer, 
  Download, 
  PieChart, 
  Calendar, 
  CheckCircle2, 
  Layers, 
  FileCheck 
} from 'lucide-react';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const QUARTERS = ['Q1 (Jan–Mar)', 'Q2 (Apr–Jun)', 'Q3 (Jul–Sep)', 'Q4 (Oct–Dec)'];
const QUARTER_MONTHS = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [9, 10, 11]];

export const ReportsView: React.FC = () => {
  const { 
    budgetItems, 
    expenses, 
    inventory, 
    priceList, 
    restockRecords, 
    issuanceRecords, 
    procurementRequests, 
    auditLogs, 
    fiscalYear,
    totalApprovedBudget,
    totalObligatedExpenses,
    remainingBudget,
    utilizationRate
  } = useData();

  const { currentUser } = useAuth();

  const [selectedYear, setSelectedYear] = useState(fiscalYear);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Filtered expenses for reporting
  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      const year = e.date ? parseInt(e.date.split('-')[0], 10) : fiscalYear;
      if (year !== selectedYear) return false;
      if (filterCategory && e.itemId !== filterCategory) return false;
      if (filterStatus && e.status !== filterStatus) return false;
      return true;
    });
  }, [expenses, selectedYear, filterCategory, filterStatus, fiscalYear]);

  // Monthly totals
  const monthlyTotals = useMemo(() => {
    const arr = Array(12).fill(0);
    filteredExpenses.forEach(e => {
      const m = e.date ? parseInt(e.date.split('-')[1], 10) - 1 : -1;
      if (m >= 0 && m < 12) arr[m] += Number(e.amount);
    });
    return arr;
  }, [filteredExpenses]);

  // Quarterly totals
  const quarterlyTotals = useMemo(() => {
    return QUARTER_MONTHS.map(ms => ms.reduce((sum, m) => sum + monthlyTotals[m], 0));
  }, [monthlyTotals]);

  // Max for monthly chart scaling
  const maxMonthVal = Math.max(...monthlyTotals, 1);

  // Full Excel Export Handler
  const handleExportExcel = () => {
    exportFullAuditWorkbook({
      budgetItems,
      expenses,
      inventory,
      priceList,
      restock: restockRecords,
      issuances: issuanceRecords,
      procurements: procurementRequests,
      auditLogs,
      fiscalYear: selectedYear
    });
  };

  // Full PDF Export Handler
  const handleExportPDF = (type: 'comprehensive' | 'budget' | 'inventory' | 'expenses') => {
    exportAuditPDF({
      reportType: type,
      budgetItems,
      expenses: filteredExpenses,
      inventory,
      priceList,
      fiscalYear: selectedYear,
      preparedBy: currentUser?.name
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Export Action Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-500" />
            <span>Audit &amp; Financial Analytics Center</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Export official government audit reports in Excel (.xlsx) and PDF formats for Commission audit compliance
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={handleExportExcel}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Full Audit (Excel)</span>
          </button>

          <button
            onClick={() => handleExportPDF('comprehensive')}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-blue-600/30 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Export Official PDF</span>
          </button>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Fiscal Year:</span>
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(Number(e.target.value))}
            className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value={2026}>FY 2026</option>
            <option value={2025}>FY 2025</option>
            <option value={2027}>FY 2027</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Line Item:</span>
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-blue-500 cursor-pointer max-w-xs"
          >
            <option value="">All Budget Line Items</option>
            {budgetItems.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Status:</span>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="Obligated">Obligated</option>
            <option value="Disbursed">Disbursed</option>
            <option value="Pending">Pending</option>
          </select>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print View</span>
          </button>
        </div>
      </div>

      {/* Specific Audit Package Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* WFP Budget Utilization */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 hover:border-slate-700 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-white text-sm">WFP Budget Utilization Report</div>
            <div className="text-xs text-slate-400 mt-1">
              Line items, allotments, obligations, balances, and percentage execution.
            </div>
          </div>
          <div className="pt-2 flex items-center gap-2">
            <button
              onClick={() => handleExportPDF('budget')}
              className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 text-xs font-semibold flex items-center gap-1 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>PDF Report</span>
            </button>
          </div>
        </div>

        {/* Inventory Stock Count */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 hover:border-slate-700 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-white text-sm">Physical Inventory Audit</div>
            <div className="text-xs text-slate-400 mt-1">
              Stock card listing, unit reference prices, physical valuations, and threshold status.
            </div>
          </div>
          <div className="pt-2 flex items-center gap-2">
            <button
              onClick={() => handleExportPDF('inventory')}
              className="px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 text-xs font-semibold flex items-center gap-1 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>PDF Report</span>
            </button>
          </div>
        </div>

        {/* Financial Expense Ledger */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 hover:border-slate-700 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-white text-sm">Disbursement &amp; Expense Ledger</div>
            <div className="text-xs text-slate-400 mt-1">
              Detailed chronological ledger with Official Receipts (OR) and disbursement status.
            </div>
          </div>
          <div className="pt-2 flex items-center gap-2">
            <button
              onClick={() => handleExportPDF('expenses')}
              className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs font-semibold flex items-center gap-1 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>PDF Report</span>
            </button>
          </div>
        </div>

      </div>

      {/* Quarterly Budget Utilization Matrix */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-400" />
            <span>Quarterly WFP Budget Execution (FY {selectedYear})</span>
          </h2>
          <span className="text-xs text-slate-400">
            Target per Quarter: <strong className="font-mono text-slate-200">{formatPeso(totalApprovedBudget / 4)}</strong>
          </span>
        </div>

        {/* Quarterly Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {QUARTERS.map((qLabel, qi) => {
            const qAmt = quarterlyTotals[qi];
            const qTarget = totalApprovedBudget / 4;
            const qPct = qTarget > 0 ? (qAmt / qTarget) * 100 : 0;

            return (
              <div key={qi} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-blue-400 uppercase tracking-wider">{qLabel}</div>
                <div className="text-xl font-extrabold font-mono text-white">{formatPeso(qAmt)}</div>
                <div className="text-[11px] text-slate-400 flex justify-between">
                  <span>Execution:</span>
                  <span className={`font-mono font-bold ${qPct > 100 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {qPct.toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${qPct > 100 ? 'bg-rose-500' : 'bg-blue-500'}`}
                    style={{ width: `${Math.min(qPct, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Quarterly Matrix Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-y border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Budget Category</th>
                <th className="py-2.5 px-3 text-right">Q1 (Jan-Mar)</th>
                <th className="py-2.5 px-3 text-right">Q2 (Apr-Jun)</th>
                <th className="py-2.5 px-3 text-right">Q3 (Jul-Sep)</th>
                <th className="py-2.5 px-3 text-right">Q4 (Oct-Dec)</th>
                <th className="py-2.5 px-3 text-right">Total Obligated</th>
                <th className="py-2.5 px-3 text-right">Approved Allotment</th>
                <th className="py-2.5 px-3 text-center">Execution %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {budgetItems.map(item => {
                const itemBudget = item.subs.reduce((s, sub) => s + sub.budget, 0);
                const qValues = QUARTER_MONTHS.map(ms => {
                  return ms.reduce((sum, m) => {
                    return sum + filteredExpenses
                      .filter(e => e.itemId === item.id && e.date && parseInt(e.date.split('-')[1], 10) - 1 === m)
                      .reduce((subSum, e) => subSum + Number(e.amount), 0);
                  }, 0);
                });
                const totalObligated = qValues.reduce((s, v) => s + v, 0);
                const pct = itemBudget > 0 ? (totalObligated / itemBudget) * 100 : 0;

                return (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors font-sans">
                    <td className="py-2.5 px-3 font-semibold text-slate-200">
                      {item.name}
                    </td>
                    {qValues.map((v, i) => (
                      <td key={i} className="py-2.5 px-3 text-right font-mono text-slate-300">
                        {v > 0 ? formatPeso(v) : '—'}
                      </td>
                    ))}
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-400">
                      {formatPeso(totalObligated)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-300">
                      {formatPeso(itemBudget)}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold">
                      <span className={pct > 90 ? 'text-rose-400' : 'text-emerald-400'}>
                        {pct.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-950/80 border-t-2 border-slate-700 font-mono font-bold">
              <tr>
                <td className="py-3 px-3 font-sans font-extrabold text-white">GRAND TOTAL</td>
                {quarterlyTotals.map((qv, i) => (
                  <td key={i} className="py-3 px-3 text-right text-blue-400">{formatPeso(qv)}</td>
                ))}
                <td className="py-3 px-3 text-right text-rose-400">{formatPeso(totalObligatedExpenses)}</td>
                <td className="py-3 px-3 text-right text-slate-200">{formatPeso(totalApprovedBudget)}</td>
                <td className="py-3 px-3 text-center text-emerald-400">{utilizationRate.toFixed(1)}%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Monthly Bar Chart */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-md space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-emerald-400" />
          <span>Monthly Expenditure Trajectory (₱)</span>
        </h2>

        <div className="space-y-2 pt-2">
          {MONTHS.map((mName, mIdx) => {
            const val = monthlyTotals[mIdx];
            const widthPct = (val / maxMonthVal) * 100;

            return (
              <div key={mIdx} className="flex items-center gap-3 text-xs">
                <span className="w-10 font-bold text-slate-400">{mName}</span>
                <div className="flex-1 bg-slate-950 rounded-full h-5 overflow-hidden p-0.5 border border-slate-800">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-500 flex items-center justify-end pr-2"
                    style={{ width: `${Math.max(widthPct, val > 0 ? 4 : 0)}%` }}
                  >
                    {val > 0 && widthPct > 15 && (
                      <span className="text-[10px] font-mono font-bold text-white">{formatPeso(val)}</span>
                    )}
                  </div>
                </div>
                <span className="w-24 text-right font-mono font-medium text-slate-300">
                  {val > 0 ? formatPeso(val) : '—'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
