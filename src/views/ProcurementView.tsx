import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { ProcurementRequest, ProcurementItem, PRStatus } from '../types';
import { formatPeso, formatDate } from '../utils/auditExport';
import { 
  Sparkles, 
  Plus, 
  CheckCircle2, 
  Clock, 
  PackageCheck, 
  Edit3, 
  Trash2, 
  AlertTriangle, 
  FileText, 
  Send, 
  X,
  FileCheck
} from 'lucide-react';

export const ProcurementView: React.FC = () => {
  const { 
    procurementRequests, 
    inventory, 
    priceList, 
    lowStockItems, 
    checkAndGenerateAutoProcurement, 
    addProcurementRequest, 
    updateProcurementRequest, 
    deleteProcurementRequest,
    approveProcurementRequest,
    receiveProcurementRequest,
    fiscalYear 
  } = useData();

  const { permissions, currentUser } = useAuth();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPR, setEditingPR] = useState<ProcurementRequest | null>(null);

  // Form Fields
  const [urgency, setUrgency] = useState<'Standard' | 'Urgent' | 'Emergency'>('Urgent');
  const [purpose, setPurpose] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<ProcurementItem[]>([]);

  const handleTriggerAuto = () => {
    const pr = checkAndGenerateAutoProcurement();
    if (!pr) {
      alert('All inventory items are currently above their minimum safety stock threshold. No auto-replenishment is required at this time.');
    }
  };

  const handleOpenAddManual = () => {
    setEditingPR(null);
    setUrgency('Standard');
    setPurpose(`Procurement Request for Q${Math.ceil((new Date().getMonth() + 1) / 3)} office supplies replenishment`);
    setNotes('');

    // Pre-populate with low stock items if any, or first 3 items
    const defaultItems = lowStockItems.length > 0 
      ? lowStockItems 
      : inventory.slice(0, 3);

    const initialPRItems: ProcurementItem[] = defaultItems.map(item => {
      const pl = priceList.find(p => p.invId === item.id || p.name.toLowerCase() === item.name.toLowerCase());
      const cost = pl ? pl.price : 100;
      const reorderQty = Math.max(item.minStock * 2 - item.quantity, item.minStock, 5);
      return {
        invId: item.id,
        name: item.name,
        unit: item.unit,
        currentStock: item.quantity,
        minStock: item.minStock,
        requestedQty: reorderQty,
        estimatedUnitCost: cost,
        estimatedTotalCost: reorderQty * cost
      };
    });

    setItems(initialPRItems);
    setModalOpen(true);
  };

  const handleOpenEdit = (pr: ProcurementRequest) => {
    setEditingPR(pr);
    setUrgency(pr.urgency);
    setPurpose(pr.purpose);
    setNotes(pr.notes || '');
    setItems(pr.items);
    setModalOpen(true);
  };

  const handleItemQtyChange = (index: number, newQty: number) => {
    setItems(prev => prev.map((it, i) => {
      if (i === index) {
        const qty = Math.max(1, newQty);
        return {
          ...it,
          requestedQty: qty,
          estimatedTotalCost: qty * it.estimatedUnitCost
        };
      }
      return it;
    }));
  };

  const handleAddItemToPR = (invId: number) => {
    const inv = inventory.find(i => i.id === invId);
    if (!inv || items.some(it => it.invId === invId)) return;

    const pl = priceList.find(p => p.invId === inv.id || p.name.toLowerCase() === inv.name.toLowerCase());
    const cost = pl ? pl.price : 100;
    const reorderQty = Math.max(inv.minStock, 5);

    setItems(prev => [
      ...prev,
      {
        invId: inv.id,
        name: inv.name,
        unit: inv.unit,
        currentStock: inv.quantity,
        minStock: inv.minStock,
        requestedQty: reorderQty,
        estimatedUnitCost: cost,
        estimatedTotalCost: reorderQty * cost
      }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSavePR = (e: React.FormEvent) => {
    e.preventDefault();
    if (!purpose.trim() || items.length === 0) return;

    const totalCost = items.reduce((s, it) => s + it.estimatedTotalCost, 0);

    if (editingPR) {
      updateProcurementRequest(editingPR.id, {
        urgency,
        purpose: purpose.trim(),
        notes: notes.trim(),
        items,
        totalEstimatedCost: totalCost
      });
    } else {
      addProcurementRequest({
        date: new Date().toISOString().slice(0, 10),
        urgency,
        purpose: purpose.trim(),
        notes: notes.trim(),
        items,
        totalEstimatedCost: totalCost,
        status: 'Draft',
        requestedBy: currentUser?.name || 'Supply Custodian'
      });
    }

    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Automated Generator Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-400" />
            <span>Automated Procurement Requests (Auto-PR)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Predefined threshold triggers, automated Purchase Requests (PR), approval workflow, and 1-click restock
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleTriggerAuto}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-600 hover:opacity-90 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Run Auto-Threshold Trigger</span>
          </button>

          {permissions.canCreateProcurement && (
            <button
              onClick={handleOpenAddManual}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 inline mr-1" />
              Manual PR
            </button>
          )}
        </div>
      </div>

      {/* Threshold Monitor Status Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            lowStockItems.length > 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
          }`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <span>Threshold Reorder Engine</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                lowStockItems.length > 0 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' 
                  : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
              }`}>
                {lowStockItems.length > 0 ? `${lowStockItems.length} Critical Items` : 'Optimal Stock'}
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              When supplies reach or fall below their predefined minimum safety limit, the system automatically builds an official Reorder Procurement Request based on master reference unit costs.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0 text-right">
          <div>
            <div className="text-[11px] text-slate-400">Total PRs Created</div>
            <div className="text-lg font-mono font-extrabold text-white">{procurementRequests.length}</div>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div>
            <div className="text-[11px] text-slate-400">Approved / PO Issued</div>
            <div className="text-lg font-mono font-extrabold text-indigo-400">
              {procurementRequests.filter(p => p.status === 'Approved' || p.status === 'PO Issued').length}
            </div>
          </div>
        </div>
      </div>

      {/* Procurement Requests List */}
      <div className="space-y-4">
        {procurementRequests.map(pr => {
          const isReceived = pr.status === 'Received & Restocked';
          const isApproved = pr.status === 'Approved' || pr.status === 'PO Issued';

          return (
            <div key={pr.id} className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-md space-y-4">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-extrabold text-sm px-2.5 py-1 rounded-lg bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                    {pr.id}
                  </span>
                  <div>
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{pr.purpose}</span>
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>Date: {formatDate(pr.date)}</span>
                      <span>·</span>
                      <span>Requested by: <strong className="text-slate-300">{pr.requestedBy}</strong></span>
                      {pr.poNumber && (
                        <>
                          <span>·</span>
                          <span className="text-blue-400 font-mono font-semibold">PO #{pr.poNumber}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">Estimated Total</div>
                    <div className="text-base font-mono font-extrabold text-emerald-400">
                      {formatPeso(pr.totalEstimatedCost)}
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                    isReceived 
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : isApproved
                      ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                      : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                  }`}>
                    {pr.status}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold bg-slate-950/60 border-y border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Item Description</th>
                      <th className="py-2.5 px-3 text-center">Unit</th>
                      <th className="py-2.5 px-3 text-center">Stock at Trigger</th>
                      <th className="py-2.5 px-3 text-center">Min Threshold</th>
                      <th className="py-2.5 px-3 text-center">Reorder Quantity</th>
                      <th className="py-2.5 px-3 text-right">Est. Unit Price</th>
                      <th className="py-2.5 px-3 text-right">Est. Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {pr.items.map((it, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-slate-200">{it.name}</td>
                        <td className="py-2.5 px-3 text-center font-mono text-slate-400">{it.unit}</td>
                        <td className="py-2.5 px-3 text-center font-mono text-amber-400 font-bold">{it.currentStock}</td>
                        <td className="py-2.5 px-3 text-center font-mono text-slate-400">{it.minStock}</td>
                        <td className="py-2.5 px-3 text-center font-mono font-extrabold text-blue-400">+{it.requestedQty}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-300">{formatPeso(it.estimatedUnitCost)}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">{formatPeso(it.estimatedTotalCost)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Workflow Actions Footer */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
                <div className="text-xs text-slate-400">
                  {pr.approvedBy ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approved by {pr.approvedBy} on {pr.approvalDate}</span>
                    </span>
                  ) : (
                    <span>Awaiting Administrative Review &amp; Allotment Certification</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  
                  {/* Approve Action (Admin only) */}
                  {!isApproved && !isReceived && permissions.canApproveProcurement && (
                    <button
                      onClick={() => approveProcurementRequest(pr.id)}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1 shadow transition-all cursor-pointer"
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>Approve &amp; Issue PO</span>
                    </button>
                  )}

                  {/* Mark Delivery Received (Adds stock to inventory & books expense!) */}
                  {isApproved && !isReceived && permissions.canReceiveProcurement && (
                    <button
                      onClick={() => {
                        if (confirm(`Confirm delivery receiving for ${pr.id}? This will automatically add quantities to inventory and book the expense under WFP supplies allotment.`)) {
                          receiveProcurementRequest(pr.id);
                        }
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
                    >
                      <PackageCheck className="w-4 h-4" />
                      <span>Receive Delivery &amp; Auto-Restock</span>
                    </button>
                  )}

                  {!isReceived && permissions.canCreateProcurement && (
                    <button
                      onClick={() => handleOpenEdit(pr)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                      title="Edit PR details"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {permissions.canDeleteExpenses && (
                    <button
                      onClick={() => {
                        if (confirm(`Delete procurement request ${pr.id}?`)) {
                          deleteProcurementRequest(pr.id);
                        }
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400"
                      title="Delete PR"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

            </div>
          );
        })}

        {procurementRequests.length === 0 && (
          <div className="py-16 text-center text-slate-400 rounded-2xl bg-slate-900 border border-slate-800">
            <Sparkles className="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-400" />
            <div className="text-base font-semibold text-slate-300">No Procurement Requests Generated</div>
            <div className="text-xs text-slate-400 mt-1">
              Click &quot;Run Auto-Threshold Trigger&quot; to inspect low stocks and generate reorder requests.
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit PR Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">
                {editingPR ? `Edit Procurement Request (${editingPR.id})` : 'New Procurement Requisition'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePR} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Urgency Level</label>
                  <select
                    value={urgency}
                    onChange={e => setUrgency(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Standard">Standard Replenishment</option>
                    <option value="Urgent">Urgent (Low Safety Threshold)</option>
                    <option value="Emergency">Emergency (Immediate Need)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Purpose / Justification *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Replenishment of stock below threshold"
                    value={purpose}
                    onChange={e => setPurpose(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Items in PR */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Requested Supplies
                  </label>
                  
                  {/* Quick add dropdown */}
                  <select
                    onChange={e => {
                      if (e.target.value) {
                        handleAddItemToPR(Number(e.target.value));
                        e.target.value = '';
                      }
                    }}
                    className="text-xs bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-slate-300 outline-none cursor-pointer"
                  >
                    <option value="">+ Add supply from inventory...</option>
                    {inventory.map(inv => (
                      <option key={inv.id} value={inv.id}>
                        {inv.name} (stock: {inv.quantity})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  {items.map((it, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs">
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-white truncate">{it.name}</div>
                        <div className="text-[11px] text-slate-400">
                          Current: {it.currentStock} {it.unit} · Min: {it.minStock} · Unit Cost: {formatPeso(it.estimatedUnitCost)}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-slate-400 text-xs">Reorder:</span>
                        <input
                          type="number"
                          min="1"
                          value={it.requestedQty}
                          onChange={e => handleItemQtyChange(idx, parseInt(e.target.value, 10) || 1)}
                          className="w-16 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white text-center font-mono font-bold"
                        />
                        <span className="font-mono font-bold text-emerald-400 w-24 text-right">
                          {formatPeso(it.estimatedTotalCost)}
                        </span>
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="p-1 rounded text-slate-400 hover:text-rose-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Calculation */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400 font-sans">Total Estimated Cost:</span>
                <span className="text-emerald-400 font-extrabold text-base">
                  {formatPeso(items.reduce((s, it) => s + it.estimatedTotalCost, 0))}
                </span>
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
                  {editingPR ? 'Update PR' : 'Create Procurement Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
