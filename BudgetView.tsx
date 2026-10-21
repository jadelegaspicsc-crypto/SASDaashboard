import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { BudgetItem, SubCategory } from '../types';
import { formatPeso } from '../utils/auditExport';
import { 
  Wallet, 
  Plus, 
  ChevronDown, 
  ChevronRight, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  PieChart, 
  Sparkles,
  Layers,
  HelpCircle,
  X
} from 'lucide-react';

export const BudgetView: React.FC = () => {
  const { 
    budgetItems, 
    expenses, 
    addBudgetItem, 
    updateBudgetItem, 
    deleteBudgetItem,
    addSubCategory,
    updateSubCategory,
    deleteSubCategory,
    totalApprovedBudget,
    totalObligatedExpenses,
    remainingBudget,
    utilizationRate,
    fiscalYear
  } = useData();

  const { permissions } = useAuth();

  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(() => {
    // Expand first 3 by default
    const init: Record<string, boolean> = {};
    budgetItems.slice(0, 3).forEach(b => { init[b.id] = true; });
    return init;
  });

  // Modals state
  const [modalCategoryOpen, setModalCategoryOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BudgetItem | null>(null);
  const [categoryName, setCategoryName] = useState('');

  const [modalSubOpen, setModalSubOpen] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [editingSub, setEditingSub] = useState<SubCategory | null>(null);
  const [subLabel, setSubLabel] = useState('');
  const [subType, setSubType] = useState('');
  const [subBudget, setSubBudget] = useState<string>('');

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    budgetItems.forEach(b => { all[b.id] = true; });
    setExpandedItems(all);
  };

  const collapseAll = () => {
    setExpandedItems({});
  };

  // Category handlers
  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCategoryName('');
    setModalCategoryOpen(true);
  };

  const handleOpenEditCategory = (item: BudgetItem) => {
    setEditingCategory(item);
    setCategoryName(item.name);
    setModalCategoryOpen(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    if (editingCategory) {
      updateBudgetItem(editingCategory.id, { name: categoryName.trim() });
    } else {
      addBudgetItem({
        name: categoryName.trim(),
        icon: 'Layers',
        color: '#3b82f6',
        colorBg: 'rgba(59,130,246,0.14)',
        subs: []
      });
    }
    setModalCategoryOpen(false);
  };

  // Sub-category handlers
  const handleOpenAddSub = (itemId: string) => {
    setActiveCategoryId(itemId);
    setEditingSub(null);
    setSubLabel('');
    setSubType('Other Maintenance & Operating Expenses');
    setSubBudget('');
    setModalSubOpen(true);
  };

  const handleOpenEditSub = (itemId: string, sub: SubCategory) => {
    setActiveCategoryId(itemId);
    setEditingSub(sub);
    setSubLabel(sub.label);
    setSubType(sub.type);
    setSubBudget(sub.budget.toString());
    setModalSubOpen(true);
  };

  const handleSaveSub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCategoryId || !subLabel.trim() || !subBudget) return;

    const budgetNum = parseFloat(subBudget) || 0;

    if (editingSub) {
      updateSubCategory(activeCategoryId, editingSub.id, {
        label: subLabel.trim(),
        type: subType.trim(),
        budget: budgetNum
      });
    } else {
      addSubCategory(activeCategoryId, {
        label: subLabel.trim(),
        type: subType.trim(),
        budget: budgetNum
      });
    }
    setModalSubOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Wallet className="w-6 h-6 text-blue-500" />
            <span>Work and Financial Plan (WFP) Allotments</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Official line item allocations, real-time obligations, and remaining balances for FY {fiscalYear}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={expandAll}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
          >
            Collapse All
          </button>

          {permissions.canManageBudget && (
            <button
              onClick={handleOpenAddCategory}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Line Item</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Approved Allotment</div>
          <div className="text-xl font-extrabold font-mono text-white mt-1">{formatPeso(totalApprovedBudget)}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Approved WFP Budget</div>
        </div>

        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Obligated Expenses</div>
          <div className="text-xl font-extrabold font-mono text-rose-400 mt-1">{formatPeso(totalObligatedExpenses)}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">{utilizationRate.toFixed(2)}% Utilized</div>
        </div>

        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Remaining Available Balance</div>
          <div className={`text-xl font-extrabold font-mono mt-1 ${remainingBudget < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {formatPeso(remainingBudget)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Unobligated Allotment</div>
        </div>

        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Overall Utilization Rate</div>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 bg-slate-800 rounded-full h-3 overflow-hidden p-0.5 border border-slate-700">
              <div 
                className={`h-full rounded-full ${utilizationRate > 90 ? 'bg-rose-500' : utilizationRate > 75 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                style={{ width: `${Math.min(utilizationRate, 100)}%` }}
              />
            </div>
            <span className="font-mono font-bold text-sm text-slate-200">{utilizationRate.toFixed(1)}%</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Status: {remainingBudget >= 0 ? 'Within Allocation' : 'Deficit'}</div>
        </div>
      </div>

      {/* Categories Accordion List */}
      <div className="space-y-4">
        {budgetItems.map(item => {
          const isExpanded = !!expandedItems[item.id];
          const itemExpenses = expenses.filter(e => e.itemId === item.id);
          const itemObligated = itemExpenses.reduce((s, e) => s + Number(e.amount), 0);
          const itemBudget = item.subs.reduce((s, sub) => s + sub.budget, 0);
          const itemBalance = itemBudget - itemObligated;
          const itemUtil = itemBudget > 0 ? (itemObligated / itemBudget) * 100 : 0;

          return (
            <div 
              key={item.id} 
              className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-md transition-all"
            >
              {/* Category Header */}
              <div 
                onClick={() => toggleExpand(item.id)}
                className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-800/40 select-none transition-colors"
              >
                <div className="flex items-start sm:items-center gap-3 min-w-0">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                    style={{ backgroundColor: item.colorBg || 'rgba(59,130,246,0.14)', color: item.color || '#60a5fa' }}
                  >
                    <Layers className="w-5 h-5" />
                  </div>

                  <div className="min-w-0">
                    <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                      <span className="truncate">{item.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 shrink-0">
                        {item.subs.length} items
                      </span>
                    </h2>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Approved Allotment: <strong className="text-slate-200 font-mono">{formatPeso(itemBudget)}</strong>
                    </div>
                  </div>
                </div>

                {/* Right: Metrics & Controls */}
                <div className="flex items-center justify-between md:justify-end gap-6 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                  
                  {/* Utilization Summary */}
                  <div className="text-right">
                    <div className="text-xs font-mono font-semibold text-slate-200">
                      <span className="text-rose-400">{formatPeso(itemObligated)}</span>
                      <span className="text-slate-500"> / {formatPeso(itemBudget)}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center justify-end gap-1.5 mt-0.5">
                      <span>Bal: <strong className={itemBalance < 0 ? 'text-rose-400' : 'text-emerald-400'}>{formatPeso(itemBalance)}</strong></span>
                      <span>·</span>
                      <strong className={itemUtil > 90 ? 'text-rose-400' : itemUtil > 75 ? 'text-amber-400' : 'text-emerald-400'}>
                        {itemUtil.toFixed(1)}%
                      </strong>
                    </div>
                  </div>

                  {/* Progress bar miniature */}
                  <div className="w-20 hidden sm:block">
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${itemUtil > 90 ? 'bg-rose-500' : itemUtil > 75 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.min(itemUtil, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Action icons */}
                  <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                    {permissions.canManageBudget && (
                      <>
                        <button
                          onClick={() => handleOpenAddSub(item.id)}
                          title="Add sub-category line item"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEditCategory(item)}
                          title="Edit category name"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete category "${item.name}" and all its allotments?`)) {
                              deleteBudgetItem(item.id);
                            }
                          }}
                          title="Delete category"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}

                    <div className="p-1.5 text-slate-400">
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </div>
                  </div>
                </div>
              </div>

              {/* Category Body: Sub-Categories Table */}
              {isExpanded && (
                <div className="border-t border-slate-800 bg-slate-950/60 p-4 sm:p-5">
                  {item.subs.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      No allotment lines added yet under this category.
                      {permissions.canManageBudget && (
                        <div className="mt-2">
                          <button
                            onClick={() => handleOpenAddSub(item.id)}
                            className="text-blue-400 hover:underline font-semibold"
                          >
                            + Add First Allotment Line
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-900 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                          <tr>
                            <th className="py-2.5 px-3">Allotment Line</th>
                            <th className="py-2.5 px-3">Object of Expenditure</th>
                            <th className="py-2.5 px-3 text-right">Approved (₱)</th>
                            <th className="py-2.5 px-3 text-right">Obligated (₱)</th>
                            <th className="py-2.5 px-3 text-right">Balance (₱)</th>
                            <th className="py-2.5 px-3 text-center">Utilization</th>
                            {permissions.canManageBudget && <th className="py-2.5 px-3 text-center">Actions</th>}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {item.subs.map(sub => {
                            const subExpenses = itemExpenses.filter(e => e.subId === sub.id);
                            const subObligated = subExpenses.reduce((s, e) => s + Number(e.amount), 0);
                            const subBalance = sub.budget - subObligated;
                            const subUtil = sub.budget > 0 ? (subObligated / sub.budget) * 100 : 0;

                            return (
                              <tr key={sub.id} className="hover:bg-slate-900/60 transition-colors">
                                <td className="py-3 px-3 font-medium text-slate-200">
                                  {sub.label}
                                </td>
                                <td className="py-3 px-3 text-slate-400 text-[11px]">
                                  {sub.type}
                                </td>
                                <td className="py-3 px-3 font-mono font-semibold text-right text-slate-200">
                                  {formatPeso(sub.budget)}
                                </td>
                                <td className="py-3 px-3 font-mono font-semibold text-right text-rose-400">
                                  {formatPeso(subObligated)}
                                </td>
                                <td className={`py-3 px-3 font-mono font-semibold text-right ${subBalance < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                  {formatPeso(subBalance)}
                                </td>
                                <td className="py-3 px-3 text-center">
                                  <div className="inline-flex items-center gap-2">
                                    <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                      <div 
                                        className={`h-full rounded-full ${subUtil > 90 ? 'bg-rose-500' : subUtil > 75 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                        style={{ width: `${Math.min(subUtil, 100)}%` }}
                                      />
                                    </div>
                                    <span className="font-mono text-[11px] font-semibold text-slate-300">
                                      {subUtil.toFixed(1)}%
                                    </span>
                                  </div>
                                </td>
                                {permissions.canManageBudget && (
                                  <td className="py-3 px-3 text-center">
                                    <div className="flex items-center justify-center gap-1.5">
                                      <button
                                        onClick={() => handleOpenEditSub(item.id, sub)}
                                        className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-blue-400 transition-colors"
                                        title="Edit allotment"
                                      >
                                        <Edit3 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => {
                                          if (confirm(`Delete allotment line "${sub.label}"?`)) {
                                            deleteSubCategory(item.id, sub.id);
                                          }
                                        }}
                                        className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
                                        title="Delete allotment"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                )}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Category Modal */}
      {modalCategoryOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">
                {editingCategory ? 'Edit Budget Category' : 'Add New Budget Category'}
              </h3>
              <button 
                onClick={() => setModalCategoryOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Conduct of SAS Strategic Planning"
                  value={categoryName}
                  onChange={e => setCategoryName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalCategoryOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sub-Category Modal */}
      {modalSubOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">
                {editingSub ? 'Edit Allotment Line' : 'Add New Allotment Line'}
              </h3>
              <button 
                onClick={() => setModalSubOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSub} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Allotment Label / Activity Description *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Meals for Meetings (₱325 x 30 pax)"
                  value={subLabel}
                  onChange={e => setSubLabel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Object of Expenditure (UACS Classification) *
                </label>
                <select
                  value={subType}
                  onChange={e => setSubType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="Representation Expenses">Representation Expenses</option>
                  <option value="Traveling Expenses – Local">Traveling Expenses – Local</option>
                  <option value="Traveling Expenses – Foreign">Traveling Expenses – Foreign</option>
                  <option value="Office Supplies Expenses">Office Supplies Expenses</option>
                  <option value="Semi-Expendable Machinery & Equipment">Semi-Expendable Machinery & Equipment</option>
                  <option value="Semi-Expendable – Other Equipment">Semi-Expendable – Other Equipment</option>
                  <option value="Training Expenses">Training Expenses</option>
                  <option value="Labor and Wages">Labor and Wages</option>
                  <option value="Legal Services">Legal Services</option>
                  <option value="Rental / Lease Expense">Rental / Lease Expense</option>
                  <option value="Other Maintenance & Operating Expenses">Other Maintenance & Operating Expenses</option>
                  <option value="Capital Outlay">Capital Outlay</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Approved Allotment Amount (₱) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="0.00"
                  value={subBudget}
                  onChange={e => setSubBudget(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 font-mono text-white text-xs outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalSubOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30"
                >
                  Save Allotment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
