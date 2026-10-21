import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { RISData } from '../types';
import { buildAppendix63HTML } from '../utils/auditExport';
import { 
  FileText, 
  Printer, 
  Eye, 
  Plus, 
  Trash2, 
  RotateCcw, 
  Building2, 
  UserCheck, 
  Info,
  Sparkles
} from 'lucide-react';

export const RISGeneratorView: React.FC = () => {
  const { priceList, inventory, lowStockItems, fiscalYear } = useData();
  const { currentUser } = useAuth();

  const [entity, setEntity] = useState('Civil Service Commission');
  const [fund, setFund] = useState('01 - Regular Agency Fund');
  const [division, setDivision] = useState('Support and Administrative Services');
  const [respCode, setRespCode] = useState('1-01-000');
  const [office, setOffice] = useState('Office of the Assistant Commissioner (OACSAS)');
  const [risNo, setRisNo] = useState(`RIS-${fiscalYear}-001`);
  const [purpose, setPurpose] = useState('Official supply requisition for regular office administration and executive operations.');

  const [reqName, setReqName] = useState(currentUser?.name || 'Jade Legaspi');
  const [reqDesig, setReqDesig] = useState(currentUser?.designation || 'Assistant Commissioner');
  const [reqDate, setReqDate] = useState(() => new Date().toISOString().slice(0, 10));

  const [apprName, setApprName] = useState('Jade Legaspi');
  const [apprDesig, setApprDesig] = useState('Assistant Commissioner, OACSAS');
  const [apprDate, setApprDate] = useState(() => new Date().toISOString().slice(0, 10));

  const [items, setItems] = useState<Array<{ stockNo: string; unit: string; desc: string; qty: string | number }>>([
    { stockNo: '7510-01', unit: 'box', desc: 'Ballpen (Black, 0.7mm)', qty: 10 },
    { stockNo: '7510-02', unit: 'ream', desc: 'A4 Copy Paper (80gsm, 500 sheets)', qty: 25 },
    { stockNo: '7510-03', unit: 'pad', desc: 'Sticky Notes (3x3 inch, Yellow)', qty: 15 },
    { stockNo: '7510-04', unit: 'pc', desc: 'Correction Tape (5mm x 8m)', qty: 12 },
    { stockNo: '7510-05', unit: 'box', desc: 'Staple Wire #35', qty: 10 }
  ]);

  const [previewHTML, setPreviewHTML] = useState<string | null>(null);

  const getFormData = (): RISData => {
    return {
      entity: entity.trim(),
      fund: fund.trim(),
      division: division.trim(),
      respCode: respCode.trim(),
      office: office.trim(),
      risNo: risNo.trim(),
      purpose: purpose.trim(),
      reqName: reqName.trim(),
      reqDesig: reqDesig.trim(),
      reqDate: reqDate,
      apprName: apprName.trim(),
      apprDesig: apprDesig.trim(),
      apprDate: apprDate,
      items: items.filter(it => it.desc.trim())
    };
  };

  const handlePrint = () => {
    const data = getFormData();
    const html = buildAppendix63HTML(data);
    const win = window.open('', '_blank', 'width=900,height=750');
    if (!win) {
      alert('Pop-up blocked. Please enable pop-ups to print the official RIS.');
      return;
    }
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
    }, 400);
  };

  const handlePreview = () => {
    const data = getFormData();
    const html = buildAppendix63HTML(data);
    setPreviewHTML(html);
  };

  const handleAddItem = () => {
    setItems(prev => [...prev, { stockNo: '', unit: 'pc', desc: '', qty: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, val: any) => {
    setItems(prev => prev.map((it, i) => {
      if (i === index) {
        return { ...it, [field]: val };
      }
      return it;
    }));
  };

  const handleSelectDesc = (index: number, plName: string) => {
    const pl = priceList.find(p => p.name === plName);
    setItems(prev => prev.map((it, i) => {
      if (i === index) {
        return {
          ...it,
          desc: plName,
          unit: pl ? pl.unit : it.unit
        };
      }
      return it;
    }));
  };

  const handlePopulateLowStocks = () => {
    if (lowStockItems.length === 0) {
      alert('No items currently below safety threshold.');
      return;
    }

    const lowStockRISItems = lowStockItems.map((item, idx) => ({
      stockNo: `7510-${String(idx + 1).padStart(2, '0')}`,
      unit: item.unit,
      desc: item.name,
      qty: Math.max(item.minStock * 2 - item.quantity, 5)
    }));

    setItems(lowStockRISItems);
    setPurpose(`Official replenishment for ${lowStockItems.length} office supply items below minimum safety buffer`);
  };

  const handleClear = () => {
    if (!confirm('Clear all form fields?')) return;
    setItems([{ stockNo: '', unit: '', desc: '', qty: '' }]);
    setPurpose('');
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-400" />
            <span>RIS Generator (Appendix 63)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Official Requisition and Issue Slip generator compliant with government accounting &amp; auditing standards
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {lowStockItems.length > 0 && (
            <button
              onClick={handlePopulateLowStocks}
              className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Fill Low Stocks ({lowStockItems.length})</span>
            </button>
          )}

          <button
            onClick={handlePreview}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-slate-400" />
            <span>Preview</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Generate &amp; Print RIS</span>
          </button>
        </div>
      </div>

      {/* Info Notice */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3 text-xs text-slate-300">
        <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <div>
          Fill in the entity details and requisition line items. Clicking <strong>Generate &amp; Print RIS</strong> will format the official Appendix 63 government requisition document ready for signature and submission to the General Services Division.
        </div>
      </div>

      {/* Section 1: Entity & Office Info */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-2">
          <Building2 className="w-4 h-4" />
          <span>Entity &amp; Responsibility Center Information</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Entity Name</label>
            <input
              type="text"
              value={entity}
              onChange={e => setEntity(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Fund Cluster</label>
            <input
              type="text"
              value={fund}
              onChange={e => setFund(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Division</label>
            <input
              type="text"
              value={division}
              onChange={e => setDivision(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Responsibility Center Code</label>
            <input
              type="text"
              value={respCode}
              onChange={e => setRespCode(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Office</label>
            <input
              type="text"
              value={office}
              onChange={e => setOffice(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">RIS Control No.</label>
            <input
              type="text"
              value={risNo}
              onChange={e => setRisNo(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-blue-500 font-mono font-bold text-blue-400"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Requisition Items */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span>Requisition Items (Appendix 63)</span>
          </div>

          <button
            onClick={handleAddItem}
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Row</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold bg-slate-950 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3 w-32">Stock No.</th>
                <th className="py-2.5 px-3 w-28 text-center">Unit</th>
                <th className="py-2.5 px-3">Item Description</th>
                <th className="py-2.5 px-3 w-28 text-center">Qty Requested</th>
                <th className="py-2.5 px-3 w-12 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {items.map((it, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30">
                  <td className="py-2 px-3">
                    <input
                      type="text"
                      placeholder="e.g. 7510-01"
                      value={it.stockNo}
                      onChange={e => handleItemChange(idx, 'stockNo', e.target.value)}
                      className="w-full px-2 py-1 rounded bg-slate-950 border border-slate-700 text-white font-mono text-xs outline-none"
                    />
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="text"
                      placeholder="box / ream"
                      value={it.unit}
                      onChange={e => handleItemChange(idx, 'unit', e.target.value)}
                      className="w-full px-2 py-1 rounded bg-slate-950 border border-slate-700 text-white font-mono text-xs outline-none text-center"
                    />
                  </td>
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Item specification..."
                        value={it.desc}
                        onChange={e => handleItemChange(idx, 'desc', e.target.value)}
                        className="flex-1 px-2.5 py-1 rounded bg-slate-950 border border-slate-700 text-white text-xs outline-none"
                      />
                      <select
                        onChange={e => {
                          if (e.target.value) handleSelectDesc(idx, e.target.value);
                        }}
                        className="w-36 px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300 text-xs outline-none cursor-pointer"
                      >
                        <option value="">Pick from Price List</option>
                        {priceList.map(p => (
                          <option key={p.id} value={p.name}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={it.qty}
                      onChange={e => handleItemChange(idx, 'qty', e.target.value)}
                      className="w-full px-2 py-1 rounded bg-slate-950 border border-slate-700 text-white font-mono font-bold text-xs outline-none text-center"
                    />
                  </td>
                  <td className="py-2 px-3 text-center">
                    {items.length > 1 && (
                      <button
                        onClick={() => handleRemoveItem(idx)}
                        className="p-1 rounded text-slate-400 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 3: Purpose & Signatories */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Purpose of Requisition *</label>
          <textarea
            rows={2}
            value={purpose}
            onChange={e => setPurpose(e.target.value)}
            placeholder="State the official purpose of this requisition..."
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-blue-500 resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
          
          {/* Requested By */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="text-xs uppercase font-bold text-slate-300 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-blue-400" />
              <span>Requested by:</span>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Printed Name</label>
              <input
                type="text"
                value={reqName}
                onChange={e => setReqName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Designation</label>
              <input
                type="text"
                value={reqDesig}
                onChange={e => setReqDesig(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Date</label>
              <input
                type="date"
                value={reqDate}
                onChange={e => setReqDate(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Approved By */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="text-xs uppercase font-bold text-slate-300 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>Approved by:</span>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Printed Name</label>
              <input
                type="text"
                value={apprName}
                onChange={e => setApprName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Designation</label>
              <input
                type="text"
                value={apprDesig}
                onChange={e => setApprDesig(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Date</label>
              <input
                type="date"
                value={apprDate}
                onChange={e => setApprDate(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs outline-none focus:border-blue-500"
              />
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <button
            onClick={handleClear}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 text-xs font-medium transition-colors"
          >
            Clear All
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePreview}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Eye className="w-4 h-4 text-slate-400" />
              <span>Preview RIS</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-blue-600/30 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Generate &amp; Print Official RIS</span>
            </button>
          </div>
        </div>
      </div>

      {/* Live Preview Frame Modal */}
      {previewHTML && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-slate-900">
            <div className="p-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
              <span className="font-bold text-sm text-slate-800">Official RIS Appendix 63 Live Preview</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Document</span>
                </button>
                <button
                  onClick={() => setPreviewHTML(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-6 bg-slate-50">
              <iframe
                title="RIS Preview"
                srcDoc={previewHTML}
                className="w-full min-h-[600px] border border-slate-300 rounded shadow-md bg-white"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
