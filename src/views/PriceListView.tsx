import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { PriceItem } from '../types';
import { formatPeso, formatDate } from '../utils/auditExport';
import { 
  Tags, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Info, 
  Calendar,
  X 
} from 'lucide-react';

export const PriceListView: React.FC = () => {
  const { 
    priceList, 
    addPriceItem, 
    updatePriceItem, 
    deletePriceItem, 
    fiscalYear 
  } = useData();

  const { permissions } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPrice, setEditingPrice] = useState<PriceItem | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('pc');
  const [price, setPrice] = useState<string>('');
  const [category, setCategory] = useState('Office Supplies');

  const filteredPrices = useMemo(() => {
    return priceList.filter(p => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const mName = p.name.toLowerCase().includes(q);
        const mCat = (p.category || '').toLowerCase().includes(q);
        if (!mName && !mCat) return false;
      }
      return true;
    });
  }, [priceList, searchTerm]);

  const handleOpenAdd = () => {
    setEditingPrice(null);
    setName('');
    setUnit('pc');
    setPrice('');
    setCategory('Office Supplies');
    setModalOpen(true);
  };

  const handleOpenEdit = (p: PriceItem) => {
    setEditingPrice(p);
    setName(p.name);
    setUnit(p.unit);
    setPrice(p.price.toString());
    setCategory(p.category || 'Office Supplies');
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedPrice = parseFloat(price);
    if (!name.trim() || isNaN(parsedPrice) || parsedPrice <= 0) {
      alert('Please fill out all required fields with a valid positive price.');
      return;
    }

    if (editingPrice) {
      updatePriceItem(editingPrice.id, {
        name: name.trim(),
        unit: unit.trim(),
        price: parsedPrice,
        category: category.trim()
      });
    } else {
      addPriceItem({
        name: name.trim(),
        unit: unit.trim(),
        price: parsedPrice,
        category: category.trim(),
        invId: null
      });
    }

    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Tags className="w-6 h-6 text-emerald-400" />
            <span>Master Price List (Reference Costs)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Master reference prices used for automated procurement requests and restocking calculations
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span>FY {fiscalYear} Reference Matrix</span>
          </div>

          {permissions.canManageInventory && (
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-2 shadow-md shadow-blue-600/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add / Update Price</span>
            </button>
          )}
        </div>
      </div>

      {/* Info Notice Box */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <strong>Master Reference Price Principle:</strong> Unit prices defined here serve as the baseline for all incoming Restocking Records, RIS estimates, and Automated Procurement Requests. Past completed restocking transactions retain their original historical prices for strict government accounting compliance.
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search price item description or category..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
          />
        </div>

        <div className="text-xs text-slate-400">
          Total items: <strong className="text-white font-mono">{filteredPrices.length}</strong>
        </div>
      </div>

      {/* Price Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
              <tr>
                <th className="py-3 px-4">Item Name / Specification</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">Unit</th>
                <th className="py-3 px-4 text-right">Official Reference Price (₱)</th>
                <th className="py-3 px-4 text-center">Last Updated</th>
                {permissions.canManageInventory && <th className="py-3 px-4 text-center">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {filteredPrices.map(item => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-semibold text-white">
                    {item.name}
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] border border-slate-700">
                      {item.category || 'General'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-slate-400">
                    {item.unit}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-right text-emerald-400 text-sm">
                    {formatPeso(item.price)}
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-slate-400">
                    {formatDate(item.updatedDate)}
                  </td>
                  {permissions.canManageInventory && (
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-blue-400 transition-colors"
                          title="Edit price"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Remove price reference for "${item.name}"?`)) {
                              deletePriceItem(item.id);
                            }
                          }}
                          className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                          title="Delete price entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}

              {filteredPrices.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No price entries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Price Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">
                {editingPrice ? 'Update Unit Price' : 'Add Price Entry'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Item Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sign Pen (Blue, 0.5mm)"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Unit of Measure *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. box, ream, pc"
                    value={unit}
                    onChange={e => setUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Unit Price (₱) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="0.00"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Classification / Category</label>
                <input
                  type="text"
                  placeholder="e.g. Writing Instruments, Paper Products"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-blue-500"
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
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/30"
                >
                  Save Price
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
