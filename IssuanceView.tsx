import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { IssuanceRecord, IssuanceItem } from '../types';
import { formatDate } from '../utils/auditExport';
import { 
  ClipboardList, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Calendar, 
  Building, 
  X, 
  AlertCircle 
} from 'lucide-react';

export const IssuanceView: React.FC = () => {
  const { 
    issuanceRecords, 
    inventory, 
    addIssuanceRecord, 
    updateIssuanceRecord, 
    deleteIssuanceRecord, 
    fiscalYear 
  } = useData();

  const { permissions, currentUser } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIssuance, setEditingIssuance] = useState<IssuanceRecord | null>(null);

  // Form Fields
  const [requester, setRequester] = useState('');
  const [division, setDivision] = useState('Support and Administrative Services');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [remarks, setRemarks] = useState('');
  const [items, setItems] = useState<Array<{ itemId: number; qty: number }>>([
    { itemId: inventory[0]?.id || 1, qty: 1 }
  ]);
  const [formError, setFormError] = useState<string | null>(null);

  const filteredRecords = issuanceRecords.filter(r => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const mReq = r.requester.toLowerCase().includes(q);
      const mDiv = (r.division || '').toLowerCase().includes(q);
      const mItem = r.items.some(it => it.name.toLowerCase().includes(q));
      if (!mReq && !mDiv && !mItem) return false;
    }
    return true;
  });

  const handleOpenAdd = () => {
    setEditingIssuance(null);
    setRequester('');
    setDivision('Support and Administrative Services');
    setDate(new Date().toISOString().slice(0, 10));
    setRemarks('');
    setItems([{ itemId: inventory[0]?.id || 1, qty: 1 }]);
    setFormError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (r: IssuanceRecord) => {
    setEditingIssuance(r);
    setRequester(r.requester);
    setDivision(r.division || 'Support and Administrative Services');
    setDate(r.date);
    setRemarks(r.remarks || '');
    setItems(r.items.map(it => ({ itemId: it.itemId, qty: it.qty })));
    setFormError(null);
    setModalOpen(true);
  };

  const handleAddItemRow = () => {
    setItems(prev => [...prev, { itemId: inventory[0]?.id || 1, qty: 1 }]);
  };

  const handleRemoveItemRow = (index: number) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: 'itemId' | 'qty', value: any) => {
    setItems(prev => prev.map((it, i) => {
      if (i === index) {
        return { ...it, [field]: value };
      }
      return it;
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!requester.trim()) {
      setFormError('Please enter the name of the requester.');
      return;
    }

    const compiledItems: IssuanceItem[] = items.map(it => {
      const inv = inventory.find(i => i.id === it.itemId);
      return {
        itemId: it.itemId,
        name: inv ? inv.name : 'Unknown Item',
        qty: it.qty
      };
    });

    if (editingIssuance) {
      const res = updateIssuanceRecord(editingIssuance.id, {
        requester: requester.trim(),
        division: division.trim(),
        date,
        remarks: remarks.trim(),
        items: compiledItems
      });
      if (!res.success) {
        setFormError(res.error || 'Failed to update issuance.');
        return;
      }
    } else {
      const res = addIssuanceRecord({
        requester: requester.trim(),
        division: division.trim(),
        date,
        remarks: remarks.trim(),
        items: compiledItems,
        status: 'Released',
        issuedBy: currentUser?.name || 'Supply Custodian'
      });
      if (!res.success) {
        setFormError(res.error || 'Failed to release supplies.');
        return;
      }
    }

    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-blue-400" />
            <span>Supply Issuance &amp; Requisition Logs</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Supplies released to staff, officials, and division units with automated stock validation
          </p>
        </div>

        {permissions.canIssueSupplies && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-2 shadow-md shadow-blue-600/30 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Issuance</span>
          </button>
        )}
      </div>

      {/* Search Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search requester, division, or item..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
          />
        </div>

        <div className="text-xs text-slate-400">
          Total Issuances: <strong className="text-white font-mono">{filteredRecords.length}</strong>
        </div>
      </div>

      {/* Issuance Records Cards */}
      <div className="space-y-4">
        {filteredRecords.map(record => (
          <div key={record.id} className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-md space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <span className="font-mono font-extrabold text-sm px-2.5 py-1 rounded-lg bg-blue-500/15 text-blue-400 border border-blue-500/30">
                  {record.id}
                </span>
                <div>
                  <div className="text-sm font-bold text-white">{record.requester}</div>
                  <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Building className="w-3 h-3 text-slate-500" />
                      {record.division || 'General Division'}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {formatDate(record.date)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[10px] uppercase font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{record.status}</span>
                </span>

                {permissions.canIssueSupplies && (
                  <div className="flex items-center gap-1.5 ml-2">
                    <button
                      onClick={() => handleOpenEdit(record)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title="Edit issuance"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete issuance ${record.id}? Issued quantities will be returned to inventory stock.`)) {
                          deleteIssuanceRecord(record.id);
                        }
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 transition-colors"
                      title="Delete issuance"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {record.remarks && (
              <div className="text-xs text-slate-400 italic">
                Purpose: &quot;{record.remarks}&quot;
              </div>
            )}

            {/* Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold bg-slate-950/60 border-y border-slate-800">
                  <tr>
                    <th className="py-2 px-3">Item Name</th>
                    <th className="py-2 px-3 text-center">Qty Issued</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {record.items.map((it, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-2.5 px-3 font-medium text-slate-200">
                        {it.name}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-blue-400">
                        {it.qty}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        ))}

        {filteredRecords.length === 0 && (
          <div className="py-16 text-center text-slate-400 rounded-2xl bg-slate-900 border border-slate-800">
            <ClipboardList className="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-400" />
            <div className="text-base font-semibold text-slate-300">No Issuance Records Found</div>
            <div className="text-xs text-slate-400 mt-1">
              Click &quot;New Issuance&quot; to issue supplies to officemates.
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Issuance Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">
                {editingIssuance ? `Edit Issuance (${editingIssuance.id})` : 'New Supply Issuance Slip'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-3 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Requested By (Full Name) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Atty. Maria Santos"
                    value={requester}
                    onChange={e => setRequester(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Division / Office</label>
                  <input
                    type="text"
                    placeholder="e.g. Legal Unit, Executive Office"
                    value={division}
                    onChange={e => setDivision(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Date of Release *</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Purpose / Remarks</label>
                <input
                  type="text"
                  placeholder="e.g. Preparation for CSC Commission Meeting packets"
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-blue-500"
                />
              </div>

              {/* Items Requisition list */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Supplies to Issue
                  </label>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="text-xs text-blue-400 hover:underline font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {items.map((it, idx) => {
                    const inv = inventory.find(i => i.id === it.itemId);
                    const isExceeded = inv ? it.qty > inv.quantity : false;

                    return (
                      <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <select
                              value={it.itemId}
                              onChange={e => handleItemChange(idx, 'itemId', Number(e.target.value))}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs outline-none focus:border-blue-500 cursor-pointer"
                            >
                              {inventory.map(invItem => (
                                <option key={invItem.id} value={invItem.id}>
                                  {invItem.name} (In stock: {invItem.quantity} {invItem.unit})
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="w-24">
                            <input
                              type="number"
                              min="1"
                              required
                              placeholder="Qty"
                              value={it.qty}
                              onChange={e => handleItemChange(idx, 'qty', parseInt(e.target.value, 10) || 1)}
                              className={`w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border text-white font-mono text-xs outline-none text-center ${
                                isExceeded ? 'border-rose-500 text-rose-400 font-bold' : 'border-slate-700'
                              }`}
                            />
                          </div>

                          {items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveItemRow(idx)}
                              className="p-1 rounded text-slate-400 hover:text-rose-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        {inv && isExceeded && (
                          <div className="text-[11px] text-rose-400 font-medium flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            <span>Requested {it.qty} exceeds current available stock ({inv.quantity} {inv.unit})</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
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
                  {editingIssuance ? 'Update Record' : 'Issue Supplies'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
