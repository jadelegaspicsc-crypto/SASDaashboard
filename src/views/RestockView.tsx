import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { RestockRecord, RestockItem, DocType } from '../types';
import { formatPeso, formatDate } from '../utils/auditExport';
import { 
  Truck, 
  Plus, 
  FileText, 
  Paperclip, 
  Edit3, 
  Trash2, 
  Upload, 
  X, 
  Eye, 
  Calendar,
  CheckCircle2
} from 'lucide-react';

export const RestockView: React.FC = () => {
  const { 
    restockRecords, 
    priceList, 
    addRestockRecord, 
    updateRestockRecord, 
    deleteRestockRecord, 
    fiscalYear 
  } = useData();

  const { permissions, currentUser } = useAuth();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<RestockRecord | null>(null);

  // Form Fields
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [docType, setDocType] = useState<DocType>('RIS');
  const [refNum, setRefNum] = useState('');
  const [remarks, setRemarks] = useState('');
  const [items, setItems] = useState<Array<{ plId: number; qty: number }>>([
    { plId: priceList[0]?.id || 101, qty: 10 }
  ]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileData, setFileData] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);

  // Attachment Viewer Modal
  const [viewingFile, setViewingFile] = useState<{ name: string; data: string; type: string } | null>(null);

  const calculateTotal = (itemList: Array<{ plId: number; qty: number }>) => {
    return itemList.reduce((sum, it) => {
      const pl = priceList.find(p => p.id === it.plId);
      const cost = pl ? pl.price : 0;
      return sum + (it.qty * cost);
    }, 0);
  };

  const handleOpenAdd = () => {
    setEditingRecord(null);
    setDate(new Date().toISOString().slice(0, 10));
    setDocType('RIS');
    setRefNum('');
    setRemarks('');
    setItems([{ plId: priceList[0]?.id || 101, qty: 10 }]);
    setFileName(null);
    setFileData(null);
    setFileType(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (record: RestockRecord) => {
    setEditingRecord(record);
    setDate(record.date);
    setDocType(record.docType);
    setRefNum(record.refNum || '');
    setRemarks(record.remarks || '');
    setItems(record.items.map(it => ({
      plId: it.plId,
      qty: it.qty
    })));
    setFileName(record.fileName || null);
    setFileData(record.fileData || null);
    setFileType(record.fileType || null);
    setModalOpen(true);
  };

  const handleAddItemRow = () => {
    setItems(prev => [...prev, { plId: priceList[0]?.id || 101, qty: 1 }]);
  };

  const handleRemoveItemRow = (index: number) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: 'plId' | 'qty', value: any) => {
    setItems(prev => prev.map((it, i) => {
      if (i === index) {
        return { ...it, [field]: value };
      }
      return it;
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit.');
      return;
    }

    setFileName(file.name);
    setFileType(file.type);

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setFileData(uploadEvent.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const compiledItems: RestockItem[] = items.map(it => {
      const pl = priceList.find(p => p.id === it.plId);
      const name = pl ? pl.name : 'Unknown Item';
      const unitCost = pl ? pl.price : 0;
      const total = it.qty * unitCost;
      return {
        plId: it.plId,
        invId: pl?.invId || null,
        name,
        qty: it.qty,
        unitCost,
        total
      };
    });

    const totalCost = compiledItems.reduce((s, it) => s + it.total, 0);

    if (editingRecord) {
      updateRestockRecord(editingRecord.id, {
        date,
        docType,
        refNum: refNum.trim(),
        remarks: remarks.trim(),
        items: compiledItems,
        totalCost,
        fileName,
        fileData,
        fileType
      });
    } else {
      addRestockRecord({
        date,
        docType,
        refNum: refNum.trim(),
        remarks: remarks.trim(),
        items: compiledItems,
        totalCost,
        fileName,
        fileData,
        fileType,
        receivedBy: currentUser?.name || 'Supply Custodian'
      });
    }

    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Truck className="w-6 h-6 text-purple-400" />
            <span>Restocking &amp; Delivery Receiving Records</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Receiving slips, purchase orders (PO), and inspection delivery receipts with auto-filled reference costs
          </p>
        </div>

        {permissions.canRestock && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-2 shadow-md shadow-blue-600/30 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Restock Record</span>
          </button>
        )}
      </div>

      {/* Restocking Cards List */}
      <div className="space-y-4">
        {restockRecords.map(record => (
          <div key={record.id} className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-md space-y-4">
            
            {/* Header row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <span className="font-mono font-extrabold text-sm px-2.5 py-1 rounded-lg bg-purple-500/15 text-purple-400 border border-purple-500/30">
                  {record.id}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formatDate(record.date)}</span>
                </span>
                {record.receivedBy && (
                  <span className="text-xs text-slate-500 hidden md:inline">
                    · Received by: <strong className="text-slate-400">{record.receivedBy}</strong>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <span className="text-xs text-slate-400 mr-2">Total Amount:</span>
                  <span className="font-mono font-extrabold text-emerald-400 text-base">
                    {formatPeso(record.totalCost)}
                  </span>
                </div>

                {permissions.canRestock && (
                  <div className="flex items-center gap-1.5 ml-2">
                    <button
                      onClick={() => handleOpenEdit(record)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title="Edit restock record"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete restocking record ${record.id}? Physical stock and expenses will be reversed.`)) {
                          deleteRestockRecord(record.id);
                        }
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 transition-colors"
                      title="Delete restock record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Reference Badge & Attachment */}
            {(record.refNum || record.remarks || record.fileName) && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[10px]">
                    {record.docType}
                  </span>
                  <span className="font-mono font-medium text-slate-200">
                    {record.refNum || 'N/A'}
                  </span>
                  {record.remarks && (
                    <span className="text-slate-400 border-l border-slate-700 pl-2">
                      {record.remarks}
                    </span>
                  )}
                </div>

                {record.fileName && record.fileData && (
                  <button
                    onClick={() => setViewingFile({ name: record.fileName!, data: record.fileData!, type: record.fileType || '' })}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs transition-colors cursor-pointer"
                  >
                    <Paperclip className="w-3.5 h-3.5 text-blue-400" />
                    <span className="truncate max-w-[150px]">{record.fileName}</span>
                  </button>
                )}
              </div>
            )}

            {/* Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold bg-slate-950/60 border-y border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Item Description</th>
                    <th className="py-2.5 px-3 text-center">Qty Received</th>
                    <th className="py-2.5 px-3 text-right">Unit Cost</th>
                    <th className="py-2.5 px-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {record.items.map((it, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-2.5 px-3 font-medium text-slate-200">
                        {it.name}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-100">
                        +{it.qty}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-300">
                        {formatPeso(it.unitCost)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">
                        {formatPeso(it.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        ))}

        {restockRecords.length === 0 && (
          <div className="py-16 text-center text-slate-400 rounded-2xl bg-slate-900 border border-slate-800">
            <Truck className="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-400" />
            <div className="text-base font-semibold text-slate-300">No Restocking Records Yet</div>
            <div className="text-xs text-slate-400 mt-1">
              Click &quot;New Restock Record&quot; to log incoming supply deliveries.
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Restock Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">
                {editingRecord ? `Edit Restock Record (${editingRecord.id})` : 'New Restocking Record'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 mt-4">
              
              {/* Document Reference Block */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="text-xs uppercase font-bold text-blue-400 tracking-wider">
                  Reference Document
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Document Type</label>
                    <select
                      value={docType}
                      onChange={e => setDocType(e.target.value as DocType)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value="RIS">Requisition and Issue Slip (RIS)</option>
                      <option value="PO">Purchase Order (PO)</option>
                      <option value="DR">Delivery Receipt (DR)</option>
                      <option value="SI">Sales Invoice (SI)</option>
                      <option value="OR">Official Receipt (OR)</option>
                      <option value="Other">Other Document</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Control / Ref Number</label>
                    <input
                      type="text"
                      placeholder="e.g. RIS-2026-001 or PO-2026-088"
                      value={refNum}
                      onChange={e => setRefNum(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Remarks / Inspection Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. Delivered complete by PS-DBM / Supplier"
                    value={remarks}
                    onChange={e => setRemarks(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs outline-none focus:border-blue-500"
                  />
                </div>

                {/* File Attachment */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Attach Scan / Photo (Optional, Max 5MB)</label>
                  <div className="flex items-center gap-3">
                    <label className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-dashed border-slate-700 hover:border-slate-500 text-slate-300 text-xs cursor-pointer transition-colors">
                      <Upload className="w-4 h-4 text-blue-400" />
                      <span className="truncate">{fileName || 'Choose attachment (PDF, PNG, JPG)...'}</span>
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                    {fileName && (
                      <button
                        type="button"
                        onClick={() => {
                          setFileName(null);
                          setFileData(null);
                          setFileType(null);
                        }}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Date Received *</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-blue-500"
                />
              </div>

              {/* Items Received Builder */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Supplies Received
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
                    const pl = priceList.find(p => p.id === it.plId);
                    const cost = pl ? pl.price : 0;
                    const subtotal = it.qty * cost;

                    return (
                      <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                        <div className="flex-1">
                          <select
                            value={it.plId}
                            onChange={e => handleItemChange(idx, 'plId', Number(e.target.value))}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs outline-none focus:border-blue-500 cursor-pointer"
                          >
                            {priceList.map(p => (
                              <option key={p.id} value={p.id}>
                                {p.name} ({formatPeso(p.price)} / {p.unit})
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
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs outline-none focus:border-blue-500 text-center"
                          />
                        </div>

                        <div className="w-28 text-right font-mono font-bold text-xs text-emerald-400 shrink-0">
                          {formatPeso(subtotal)}
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
                    );
                  })}
                </div>
              </div>

              {/* Total Calculation Banner */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400 font-sans">Total Delivery Cost:</span>
                <span className="text-emerald-400 font-extrabold text-base">
                  {formatPeso(calculateTotal(items))}
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
                  {editingRecord ? 'Update Restock Record' : 'Save Restock Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Attachment Preview Modal */}
      {viewingFile && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-sm truncate">{viewingFile.name}</h3>
              <button onClick={() => setViewingFile(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto py-4 flex items-center justify-center">
              {viewingFile.type.startsWith('image/') ? (
                <img src={viewingFile.data} alt={viewingFile.name} className="max-h-[60vh] rounded-lg object-contain" />
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-blue-400 mx-auto mb-2" />
                  <div className="text-sm text-slate-300">{viewingFile.name}</div>
                  <a
                    href={viewingFile.data}
                    download={viewingFile.name}
                    className="mt-3 inline-block px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
                  >
                    Download File
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
