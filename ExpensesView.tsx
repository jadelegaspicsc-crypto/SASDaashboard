import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { ExpenseEntry, ExpenseStatus } from '../types';
import { formatPeso, formatDate } from '../utils/auditExport';
import { 
  Receipt, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  FileText, 
  Download,
  X
} from 'lucide-react';

export const ExpensesView: React.FC = () => {
  const { 
    expenses, 
    budgetItems, 
    addExpense, 
    updateExpense, 
    deleteExpense, 
    fiscalYear 
  } = useData();

  const { permissions, currentUser } = useAuth();

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterMonth, setFilterMonth] = useState<string>('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseEntry | null>(null);

  // Form Fields
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [ref, setRef] = useState('');
  const [itemId, setItemId] = useState('');
  const [subId, setSubId] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [desc, setDesc] = useState('');
  const [status, setStatus] = useState<ExpenseStatus>('Obligated');

  // Filtered expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      // Fiscal year match
      if (e.fiscalYear && e.fiscalYear !== fiscalYear) return false;

      // Category filter
      if (filterCategory && e.itemId !== filterCategory) return false;

      // Status filter
      if (filterStatus && e.status !== filterStatus) return false;

      // Month filter
      if (filterMonth && !e.date.startsWith(filterMonth)) return false;

      // Search term
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matchDesc = e.desc.toLowerCase().includes(q);
        const matchRef = (e.ref || '').toLowerCase().includes(q);
        const cat = budgetItems.find(b => b.id === e.itemId);
        const matchCat = (cat?.name || '').toLowerCase().includes(q);
        if (!matchDesc && !matchRef && !matchCat) return false;
      }

      return true;
    });
  }, [expenses, fiscalYear, filterCategory, filterStatus, filterMonth, searchTerm, budgetItems]);

  const totalFilteredAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  }, [filteredExpenses]);

  // Selected subcategory allotment info in modal
  const selectedItem = budgetItems.find(b => b.id === itemId);
  const selectedSub = selectedItem?.subs.find(s => s.id === subId);

  const subStats = useMemo(() => {
    if (!itemId || !subId || !selectedSub) return null;
    const currentObligated = expenses
      .filter(e => e.itemId === itemId && e.subId === subId && (!editingExpense || e.id !== editingExpense.id))
      .reduce((sum, e) => sum + Number(e.amount), 0);
    const balance = selectedSub.budget - currentObligated;
    return {
      budget: selectedSub.budget,
      obligated: currentObligated,
      balance,
      type: selectedSub.type
    };
  }, [itemId, subId, selectedSub, expenses, editingExpense]);

  const handleOpenAdd = () => {
    setEditingExpense(null);
    setDate(new Date().toISOString().slice(0, 10));
    setRef('');
    setItemId(budgetItems[0]?.id || '');
    setSubId(budgetItems[0]?.subs[0]?.id || '');
    setAmount('');
    setDesc('');
    setStatus('Obligated');
    setModalOpen(true);
  };

  const handleOpenEdit = (exp: ExpenseEntry) => {
    setEditingExpense(exp);
    setDate(exp.date);
    setRef(exp.ref || '');
    setItemId(exp.itemId);
    setSubId(exp.subId);
    setAmount(exp.amount.toString());
    setDesc(exp.desc);
    setStatus(exp.status);
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!date || !itemId || !subId || isNaN(parsedAmount) || parsedAmount <= 0 || !desc.trim()) {
      alert('Please fill out all required fields with a valid positive amount.');
      return;
    }

    if (editingExpense) {
      updateExpense(editingExpense.id, {
        date,
        ref: ref.trim(),
        itemId,
        subId,
        amount: parsedAmount,
        desc: desc.trim(),
        status
      });
    } else {
      addExpense({
        date,
        ref: ref.trim(),
        itemId,
        subId,
        amount: parsedAmount,
        desc: desc.trim(),
        status,
        fiscalYear,
        createdById: currentUser?.id,
        createdByName: currentUser?.name || 'Staff'
      });
    }

    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Page Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Receipt className="w-6 h-6 text-rose-500" />
            <span>Expense &amp; Obligation Ledger</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track disbursement vouchers, official receipts, and purchase obligations against FY {fiscalYear} allocations
          </p>
        </div>

        {permissions.canAddExpenses && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-2 shadow-md shadow-blue-600/30 transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search description, OR/ref..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-xs text-white outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="">All Budget Line Items</option>
            {budgetItems.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-xs text-white outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="Obligated">Obligated</option>
            <option value="Disbursed">Disbursed</option>
            <option value="Pending">Pending</option>
          </select>

          {/* Month Filter */}
          <input
            type="month"
            value={filterMonth}
            onChange={e => setFilterMonth(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-xs text-white outline-none focus:border-blue-500 cursor-pointer"
          />
        </div>

        {/* Filter Summary Footer */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
          <div>
            Showing <strong className="text-white">{filteredExpenses.length}</strong> of <strong className="text-white">{expenses.length}</strong> transactions
          </div>
          <div>
            Filtered Total: <strong className="text-rose-400 font-mono text-sm ml-1">{formatPeso(totalFilteredAmount)}</strong>
          </div>
        </div>
      </div>

      {/* Expense Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">OR / Ref No.</th>
                <th className="py-3 px-4">Budget Line Item &amp; Sub-Category</th>
                <th className="py-3 px-4">Particulars / Description</th>
                <th className="py-3 px-4 text-right">Amount (₱)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Recorded By</th>
                {permissions.canEditExpenses && <th className="py-3 px-4 text-center">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {filteredExpenses.map(exp => {
                const item = budgetItems.find(b => b.id === exp.itemId);
                const sub = item?.subs.find(s => s.id === exp.subId);

                return (
                  <tr key={exp.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 text-slate-300 font-medium whitespace-nowrap">
                      {formatDate(exp.date)}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-blue-400 whitespace-nowrap">
                      {exp.ref || '—'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-200">{item?.name || exp.itemId}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-xs">{sub?.label || exp.subId}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-300 max-w-xs">
                      <div className="line-clamp-2">{exp.desc}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-right text-rose-400 whitespace-nowrap">
                      {formatPeso(exp.amount)}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        exp.status === 'Disbursed' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                          : exp.status === 'Obligated' 
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' 
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}>
                        {exp.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                      {exp.createdByName || 'System'}
                    </td>
                    {permissions.canEditExpenses && (
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(exp)}
                            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-blue-400 transition-colors"
                            title="Edit expense details"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          {permissions.canDeleteExpenses && (
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete expense record ${exp.id} (₱${Number(exp.amount).toLocaleString()})?`)) {
                                  deleteExpense(exp.id);
                                }
                              }}
                              className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                              title="Delete expense"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}

              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Receipt className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                    <div className="text-sm font-medium text-slate-300">No expense records found</div>
                    <div className="text-xs text-slate-400 mt-1">Try adjusting your filters or click Add Expense above.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Expense Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">
                {editingExpense ? 'Edit Expense Record' : 'Record New Expense'}
              </h3>
              <button 
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">OR / Reference No.</label>
                  <input
                    type="text"
                    placeholder="e.g. OR-2026-088"
                    value={ref}
                    onChange={e => setRef(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Category selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Budget Line Item *</label>
                <select
                  required
                  value={itemId}
                  onChange={e => {
                    const newId = e.target.value;
                    setItemId(newId);
                    const b = budgetItems.find(item => item.id === newId);
                    setSubId(b?.subs[0]?.id || '');
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-blue-500 cursor-pointer"
                >
                  {budgetItems.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              {/* Sub-category selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Sub-Category (Allotment) *</label>
                <select
                  required
                  value={subId}
                  onChange={e => setSubId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-blue-500 cursor-pointer"
                >
                  {selectedItem?.subs.map(sub => (
                    <option key={sub.id} value={sub.id}>
                      {sub.label} ({formatPeso(sub.budget)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Real-time Subcategory Allotment Insight Box */}
              {subStats && (
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1 font-mono">
                  <div className="text-[11px] text-slate-400 font-sans mb-1">
                    Object of Expenditure: <strong className="text-slate-300">{subStats.type}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">Approved Budget:</span>
                    <span className="text-white font-bold">{formatPeso(subStats.budget)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">Already Obligated:</span>
                    <span className="text-rose-400">{formatPeso(subStats.obligated)}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-800/80 pt-1">
                    <span className="text-slate-400 font-sans">Remaining Balance:</span>
                    <span className={`font-bold ${subStats.balance < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {formatPeso(subStats.balance)}
                    </span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Amount (₱) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as ExpenseStatus)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Obligated">Obligated</option>
                    <option value="Disbursed">Disbursed</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Particulars / Description *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="State the purpose, items or services rendered..."
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30"
                >
                  {editingExpense ? 'Update Expense' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
