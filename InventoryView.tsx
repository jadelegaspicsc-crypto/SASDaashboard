import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { InventoryItem } from '../types';
import { formatPeso } from '../utils/auditExport';
import { 
  Package, 
  Plus, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  Trash2, 
  Sparkles, 
  MapPin, 
  FolderPlus,
  X
} from 'lucide-react';
import { NavTab } from '../components/Sidebar';

interface InventoryViewProps {
  onNavigate: (tab: NavTab) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({ onNavigate }) => {
  const { 
    inventory, 
    priceList, 
    addInventoryItem, 
    updateInventoryItem, 
    deleteInventoryItem,
    checkAndGenerateAutoProcurement,
    lowStockItems
  } = useData();

  const { permissions } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('pc');
  const [quantity, setQuantity] = useState<string>('');
  const [minStock, setMinStock] = useState<string>('');
  const [category, setCategory] = useState('Office Supplies');
  const [location, setLocation] = useState('Supply Cabinet');

  const categories = useMemo(() => {
    const set = new Set<string>();
    inventory.forEach(i => { if (i.category) set.add(i.category); });
    return Array.from(set);
  }, [inventory]);

  const filteredItems = useMemo(() => {
    return inventory.filter(item => {
      // Status filter
      if (filterStatus === 'low' && item.quantity > item.minStock) return false;
      if (filterStatus === 'out' && item.quantity !== 0) return false;
      if (filterStatus === 'in' && item.quantity <= item.minStock) return false;

      // Category filter
      if (filterCategory && item.category !== filterCategory) return false;

      // Search term
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchLoc = (item.location || '').toLowerCase().includes(q);
        const matchCat = (item.category || '').toLowerCase().includes(q);
        if (!matchName && !matchLoc && !matchCat) return false;
      }

      return true;
    });
  }, [inventory, filterStatus, filterCategory, searchTerm]);

  // Total valuation
  const totalValuation = useMemo(() => {
    return inventory.reduce((sum, item) => {
      const pl = priceList.find(p => p.invId === item.id || p.name.toLowerCase() === item.name.toLowerCase());
      const price = pl ? pl.price : 0;
      return sum + (item.quantity * price);
    }, 0);
  }, [inventory, priceList]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setName('');
    setUnit('pc');
    setQuantity('');
    setMinStock('10');
    setCategory('Office Supplies');
    setLocation('Central Supply Room');
    setModalOpen(true);
  };

  const handleOpenEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setName(item.name);
    setUnit(item.unit);
    setQuantity(item.quantity.toString());
    setMinStock(item.minStock.toString());
    setCategory(item.category || 'Office Supplies');
    setLocation(item.location || 'Central Supply Room');
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(quantity, 10);
    const min = parseInt(minStock, 10);

    if (!name.trim() || isNaN(qty) || isNaN(min)) {
      alert('Please fill out all required fields with valid quantities.');
      return;
    }

    if (editingItem) {
      updateInventoryItem(editingItem.id, {
        name: name.trim(),
        unit: unit.trim(),
        quantity: Math.max(0, qty),
        minStock: Math.max(0, min),
        category: category.trim(),
        location: location.trim()
      });
    } else {
      addInventoryItem({
        name: name.trim(),
        unit: unit.trim(),
        quantity: Math.max(0, qty),
        minStock: Math.max(0, min),
        category: category.trim(),
        location: location.trim()
      });
    }

    setModalOpen(false);
  };

  const handleAutoPR = () => {
    checkAndGenerateAutoProcurement();
    onNavigate('procurement');
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Top Action Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-purple-400" />
            <span>Office Supplies Inventory Tracking</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time stock quantities, safety reorder thresholds, and physical valuation
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {lowStockItems.length > 0 && (
            <button
              onClick={handleAutoPR}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Auto Procurement ({lowStockItems.length})</span>
            </button>
          )}

          {permissions.canManageInventory && (
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-2 shadow-md shadow-blue-600/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Supply Item</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Supply Items</div>
          <div className="text-xl font-extrabold font-mono text-white mt-1">{inventory.length}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Cataloged items</div>
        </div>

        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Physical Valuation</div>
          <div className="text-xl font-extrabold font-mono text-emerald-400 mt-1">{formatPeso(totalValuation)}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Estimated on-hand value</div>
        </div>

        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Safety Threshold Alert</div>
          <div className="text-xl font-extrabold font-mono text-amber-400 mt-1">{lowStockItems.length}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Items needing reorder</div>
        </div>

        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Stock Availability</div>
          <div className="text-xl font-extrabold font-mono text-blue-400 mt-1">
            {inventory.length > 0 ? (((inventory.length - lowStockItems.length) / inventory.length) * 100).toFixed(0) : 0}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Sufficiently stocked</div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search item, category, location..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-xs text-white outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="">All Stock Statuses</option>
            <option value="low">Low Stock (At or Below Threshold)</option>
            <option value="out">Out of Stock (Zero Quantity)</option>
            <option value="in">Normal In Stock</option>
          </select>

          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-xs text-white outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
          <div>
            Showing <strong className="text-white">{filteredItems.length}</strong> of <strong className="text-white">{inventory.length}</strong> inventory records
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> In Stock
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> Low Stock
            </span>
            <span className="flex items-center gap-1 text-rose-400">
              <span className="w-2 h-2 rounded-full bg-rose-400" /> Out of Stock
            </span>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
              <tr>
                <th className="py-3 px-4">Item Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">Unit</th>
                <th className="py-3 px-4 text-center">Current Stock</th>
                <th className="py-3 px-4 text-center">Min Threshold</th>
                <th className="py-3 px-4 text-right">Reference Price</th>
                <th className="py-3 px-4 text-right">Stock Valuation</th>
                <th className="py-3 px-4 text-center">Status</th>
                {permissions.canManageInventory && <th className="py-3 px-4 text-center">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {filteredItems.map(item => {
                const pl = priceList.find(p => p.invId === item.id || p.name.toLowerCase() === item.name.toLowerCase());
                const unitPrice = pl ? pl.price : 0;
                const valuation = item.quantity * unitPrice;
                const isOutOfStock = item.quantity === 0;
                const isLowStock = !isOutOfStock && item.quantity <= item.minStock;

                return (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white text-xs">{item.name}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        <span>{item.location || 'Central Supply Room'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[10px]">
                        {item.category || 'General'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-slate-400 font-mono">
                      {item.unit}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-sm font-extrabold">
                      <span className={isOutOfStock ? 'text-rose-400' : isLowStock ? 'text-amber-400' : 'text-slate-100'}>
                        {item.quantity}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-slate-400">
                      {item.minStock}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-300">
                      {pl ? formatPeso(unitPrice) : <span className="text-amber-400 text-[10px]">No Price</span>}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-emerald-400">
                      {formatPeso(valuation)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        isOutOfStock 
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' 
                          : isLowStock 
                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 animate-pulse' 
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      }`}>
                        {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                    {permissions.canManageInventory && (
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-blue-400 transition-colors"
                            title="Edit supply details"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete supply item "${item.name}" from inventory?`)) {
                                deleteInventoryItem(item.id);
                              }
                            }}
                            className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                            title="Delete supply"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}

              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                    <div className="text-sm font-medium text-slate-300">No inventory items found</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Inventory Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">
                {editingItem ? 'Edit Inventory Supply Item' : 'Add New Supply Item'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Item Description / Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. A4 Copy Paper (80gsm, 500 sheets)"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Unit of Measure *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ream, box, pc"
                    value={unit}
                    onChange={e => setUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Current Stock Qty *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="0"
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Min Safety Threshold *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="10"
                    value={minStock}
                    onChange={e => setMinStock(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Paper Products, Writing"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Storage Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Supply Room Shelf 2"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400">
                <strong>Safety Stock Notice:</strong> When stock drops to or below the minimum safety threshold, the system automatically triggers an automated procurement reorder request.
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
                  {editingItem ? 'Update Stock Item' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
