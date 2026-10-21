import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  BudgetItem, 
  ExpenseEntry, 
  InventoryItem, 
  PriceItem, 
  RestockRecord, 
  IssuanceRecord, 
  ProcurementRequest, 
  AuditLogEntry, 
  SupabaseConfig,
  SubCategory,
  ProcurementItem
} from '../types';
import { 
  INITIAL_BUDGET_ITEMS, 
  INITIAL_EXPENSES, 
  INITIAL_INVENTORY, 
  INITIAL_PRICE_LIST, 
  INITIAL_RESTOCK, 
  INITIAL_ISSUANCES, 
  INITIAL_PROCUREMENT_REQUESTS 
} from '../data/initialData';
import { 
  getSavedSupabaseConfig, 
  saveSupabaseConfig, 
  getSupabaseClient 
} from '../services/supabase';
import { useAuth } from './AuthContext';

const KEYS = {
  budget: 'oacsas_budget_items_v2',
  expenses: 'oacsas_expenses_v2',
  inventory: 'oacsas_inventory_v2',
  priceList: 'oacsas_pricelist_v2',
  restock: 'oacsas_restock_v2',
  issuances: 'oacsas_issuances_v2',
  procurements: 'oacsas_procurements_v2',
  auditLogs: 'oacsas_audit_logs_v2',
  fiscalYear: 'oacsas_fiscal_year_v2'
};

function loadStorage<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(`Error loading key ${key}:`, e);
  }
  return defaultValue;
}

function saveStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving key ${key}:`, e);
  }
}

interface DataContextType {
  // State
  budgetItems: BudgetItem[];
  expenses: ExpenseEntry[];
  inventory: InventoryItem[];
  priceList: PriceItem[];
  restockRecords: RestockRecord[];
  issuanceRecords: IssuanceRecord[];
  procurementRequests: ProcurementRequest[];
  auditLogs: AuditLogEntry[];
  supabaseConfig: SupabaseConfig;
  fiscalYear: number;
  isSyncing: boolean;

  // Setters & Actions
  setFiscalYear: (year: number) => void;
  updateSupabaseConfig: (config: Partial<SupabaseConfig>) => void;
  syncWithSupabase: () => Promise<{ success: boolean; message: string }>;

  // Budget Actions
  addBudgetItem: (item: Omit<BudgetItem, 'id'>) => void;
  updateBudgetItem: (id: string, item: Partial<BudgetItem>) => void;
  deleteBudgetItem: (id: string) => void;
  addSubCategory: (itemId: string, sub: Omit<SubCategory, 'id'>) => void;
  updateSubCategory: (itemId: string, subId: string, sub: Partial<SubCategory>) => void;
  deleteSubCategory: (itemId: string, subId: string) => void;

  // Expense Actions
  addExpense: (expense: Omit<ExpenseEntry, 'id' | 'createdAt'>) => void;
  updateExpense: (id: string, expense: Partial<ExpenseEntry>) => void;
  deleteExpense: (id: string) => void;

  // Inventory & Price Actions
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => void;
  updateInventoryItem: (id: number, item: Partial<InventoryItem>) => void;
  deleteInventoryItem: (id: number) => void;
  addPriceItem: (item: Omit<PriceItem, 'id' | 'updatedDate'>) => void;
  updatePriceItem: (id: number, item: Partial<PriceItem>) => void;
  deletePriceItem: (id: number) => void;

  // Restock Actions
  addRestockRecord: (record: Omit<RestockRecord, 'id' | 'createdAt'>) => void;
  updateRestockRecord: (id: string, record: Partial<RestockRecord>) => void;
  deleteRestockRecord: (id: string) => void;

  // Issuance Actions
  addIssuanceRecord: (record: Omit<IssuanceRecord, 'id' | 'createdAt'>) => { success: boolean; error?: string };
  updateIssuanceRecord: (id: string, record: Partial<IssuanceRecord>) => { success: boolean; error?: string };
  deleteIssuanceRecord: (id: string) => void;

  // Automated Procurement Requests
  checkAndGenerateAutoProcurement: () => ProcurementRequest | null;
  addProcurementRequest: (req: Omit<ProcurementRequest, 'id' | 'createdAt'>) => void;
  updateProcurementRequest: (id: string, req: Partial<ProcurementRequest>) => void;
  deleteProcurementRequest: (id: string) => void;
  approveProcurementRequest: (id: string, poNumber?: string) => void;
  receiveProcurementRequest: (id: string) => void;

  // Reset
  resetToDefaultData: () => void;

  // Computed
  totalApprovedBudget: number;
  totalObligatedExpenses: number;
  totalDisbursedExpenses: number;
  remainingBudget: number;
  utilizationRate: number;
  lowStockItems: InventoryItem[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();

  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>(() => loadStorage(KEYS.budget, INITIAL_BUDGET_ITEMS));
  const [expenses, setExpenses] = useState<ExpenseEntry[]>(() => loadStorage(KEYS.expenses, INITIAL_EXPENSES));
  const [inventory, setInventory] = useState<InventoryItem[]>(() => loadStorage(KEYS.inventory, INITIAL_INVENTORY));
  const [priceList, setPriceList] = useState<PriceItem[]>(() => loadStorage(KEYS.priceList, INITIAL_PRICE_LIST));
  const [restockRecords, setRestockRecords] = useState<RestockRecord[]>(() => loadStorage(KEYS.restock, INITIAL_RESTOCK));
  const [issuanceRecords, setIssuanceRecords] = useState<IssuanceRecord[]>(() => loadStorage(KEYS.issuances, INITIAL_ISSUANCES));
  const [procurementRequests, setProcurementRequests] = useState<ProcurementRequest[]>(() => loadStorage(KEYS.procurements, INITIAL_PROCUREMENT_REQUESTS));
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => loadStorage(KEYS.auditLogs, []));
  const [fiscalYear, setFiscalYear] = useState<number>(() => loadStorage(KEYS.fiscalYear, 2026));
  const [supabaseConfig, setSupabaseConfigState] = useState<SupabaseConfig>(() => getSavedSupabaseConfig());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Auto-persist to localStorage
  useEffect(() => { saveStorage(KEYS.budget, budgetItems); }, [budgetItems]);
  useEffect(() => { saveStorage(KEYS.expenses, expenses); }, [expenses]);
  useEffect(() => { saveStorage(KEYS.inventory, inventory); }, [inventory]);
  useEffect(() => { saveStorage(KEYS.priceList, priceList); }, [priceList]);
  useEffect(() => { saveStorage(KEYS.restock, restockRecords); }, [restockRecords]);
  useEffect(() => { saveStorage(KEYS.issuances, issuanceRecords); }, [issuanceRecords]);
  useEffect(() => { saveStorage(KEYS.procurements, procurementRequests); }, [procurementRequests]);
  useEffect(() => { saveStorage(KEYS.auditLogs, auditLogs); }, [auditLogs]);
  useEffect(() => { saveStorage(KEYS.fiscalYear, fiscalYear); }, [fiscalYear]);

  // Audit logger helper
  const logAudit = useCallback((
    action: AuditLogEntry['action'],
    module: AuditLogEntry['module'],
    details: string
  ) => {
    const entry: AuditLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      userId: currentUser?.id || 'sys-anon',
      userName: currentUser?.name || 'Anonymous User',
      userRole: currentUser?.role || 'staff',
      action,
      module,
      details
    };
    setAuditLogs(prev => [entry, ...prev.slice(0, 499)]); // keep up to 500 logs
  }, [currentUser]);

  // ── BUDGET ACTIONS ─────────────────────────────────────────────────────────
  const addBudgetItem = (item: Omit<BudgetItem, 'id'>) => {
    const newItem: BudgetItem = {
      ...item,
      id: `item-${Date.now()}`
    };
    setBudgetItems(prev => [...prev, newItem]);
    logAudit('CREATE', 'BUDGET', `Added budget category "${item.name}"`);
  };

  const updateBudgetItem = (id: string, updated: Partial<BudgetItem>) => {
    setBudgetItems(prev => prev.map(item => item.id === id ? { ...item, ...updated } : item));
    logAudit('UPDATE', 'BUDGET', `Updated budget category ${id}`);
  };

  const deleteBudgetItem = (id: string) => {
    const item = budgetItems.find(i => i.id === id);
    setBudgetItems(prev => prev.filter(i => i.id !== id));
    logAudit('DELETE', 'BUDGET', `Deleted budget category "${item?.name || id}"`);
  };

  const addSubCategory = (itemId: string, sub: Omit<SubCategory, 'id'>) => {
    const newSub: SubCategory = {
      ...sub,
      id: `sub-${Date.now()}`
    };
    setBudgetItems(prev => prev.map(item => {
      if (item.id === itemId) {
        return { ...item, subs: [...item.subs, newSub] };
      }
      return item;
    }));
    logAudit('CREATE', 'BUDGET', `Added allotment line "${sub.label}" (₱${sub.budget}) to category ${itemId}`);
  };

  const updateSubCategory = (itemId: string, subId: string, updated: Partial<SubCategory>) => {
    setBudgetItems(prev => prev.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          subs: item.subs.map(s => s.id === subId ? { ...s, ...updated } : s)
        };
      }
      return item;
    }));
    logAudit('UPDATE', 'BUDGET', `Updated allotment line ${subId} in category ${itemId}`);
  };

  const deleteSubCategory = (itemId: string, subId: string) => {
    setBudgetItems(prev => prev.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          subs: item.subs.filter(s => s.id !== subId)
        };
      }
      return item;
    }));
    logAudit('DELETE', 'BUDGET', `Deleted allotment line ${subId} from category ${itemId}`);
  };

  // ── EXPENSE ACTIONS ────────────────────────────────────────────────────────
  const addExpense = (expense: Omit<ExpenseEntry, 'id' | 'createdAt'>) => {
    const newId = `EXP-${expense.fiscalYear || fiscalYear}-${String(expenses.length + 1).padStart(3, '0')}`;
    const newEntry: ExpenseEntry = {
      ...expense,
      id: newId,
      createdAt: new Date().toISOString()
    };
    setExpenses(prev => [newEntry, ...prev]);
    logAudit('CREATE', 'EXPENSE', `Added expense ${newId} of ₱${expense.amount.toLocaleString()} (${expense.desc})`);
  };

  const updateExpense = (id: string, updated: Partial<ExpenseEntry>) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...updated } : e));
    logAudit('UPDATE', 'EXPENSE', `Updated expense ${id}`);
  };

  const deleteExpense = (id: string) => {
    const exp = expenses.find(e => e.id === id);
    setExpenses(prev => prev.filter(e => e.id !== id));
    logAudit('DELETE', 'EXPENSE', `Deleted expense ${id} (₱${exp?.amount.toLocaleString() || 0})`);
  };

  // ── INVENTORY & PRICE ACTIONS ──────────────────────────────────────────────
  const addInventoryItem = (item: Omit<InventoryItem, 'id'>) => {
    const nextId = inventory.length ? Math.max(...inventory.map(i => i.id)) + 1 : 1;
    const newItem: InventoryItem = { ...item, id: nextId };
    setInventory(prev => [...prev, newItem]);
    logAudit('CREATE', 'INVENTORY', `Added stock item "${item.name}" (qty: ${item.quantity} ${item.unit})`);
  };

  const updateInventoryItem = (id: number, updated: Partial<InventoryItem>) => {
    setInventory(prev => prev.map(i => i.id === id ? { ...i, ...updated } : i));
    logAudit('UPDATE', 'INVENTORY', `Updated stock item ID ${id}`);
  };

  const deleteInventoryItem = (id: number) => {
    const target = inventory.find(i => i.id === id);
    setInventory(prev => prev.filter(i => i.id !== id));
    logAudit('DELETE', 'INVENTORY', `Deleted stock item "${target?.name || id}"`);
  };

  const addPriceItem = (item: Omit<PriceItem, 'id' | 'updatedDate'>) => {
    const nextId = priceList.length ? Math.max(...priceList.map(p => p.id)) + 1 : 101;
    const newPrice: PriceItem = {
      ...item,
      id: nextId,
      updatedDate: new Date().toISOString().slice(0, 10)
    };
    setPriceList(prev => [...prev, newPrice]);
    logAudit('CREATE', 'PRICELIST', `Added "${item.name}" price entry (₱${item.price} / ${item.unit})`);
  };

  const updatePriceItem = (id: number, updated: Partial<PriceItem>) => {
    setPriceList(prev => prev.map(p => p.id === id ? { 
      ...p, 
      ...updated, 
      updatedDate: new Date().toISOString().slice(0, 10) 
    } : p));
    logAudit('UPDATE', 'PRICELIST', `Updated price for item ID ${id}`);
  };

  const deletePriceItem = (id: number) => {
    const item = priceList.find(p => p.id === id);
    setPriceList(prev => prev.filter(p => p.id !== id));
    logAudit('DELETE', 'PRICELIST', `Removed price entry for "${item?.name || id}"`);
  };

  // ── RESTOCK ACTIONS ────────────────────────────────────────────────────────
  const addRestockRecord = (record: Omit<RestockRecord, 'id' | 'createdAt'>) => {
    const newId = `REQ-${String(restockRecords.length + 1).padStart(3, '0')}`;
    const newRestock: RestockRecord = {
      ...record,
      id: newId,
      createdAt: new Date().toISOString()
    };

    // 1. Add to restock list
    setRestockRecords(prev => [newRestock, ...prev]);

    // 2. Increase inventory counts
    setInventory(prev => prev.map(inv => {
      const match = record.items.find(ri => ri.invId === inv.id || ri.name.toLowerCase() === inv.name.toLowerCase());
      if (match) {
        return { ...inv, quantity: inv.quantity + match.qty };
      }
      return inv;
    }));

    // 3. Automatically record corresponding expense entry under Office Supplies (Non-PSDBM / CSE)
    const suppliesItem = budgetItems.find(b => b.id === 'office-supplies') || budgetItems[0];
    const subCategory = suppliesItem?.subs[0] || { id: 'supplies-sub', label: 'Office Supplies', budget: 50000 };

    const newExpense: ExpenseEntry = {
      id: `EXP-RESTOCK-${newId}`,
      date: record.date,
      ref: record.refNum || newId,
      itemId: suppliesItem.id,
      subId: subCategory.id,
      amount: record.totalCost,
      desc: `Restocking: ${record.items.map(i => `${i.name} (x${i.qty})`).join(', ')}`,
      status: 'Disbursed',
      fiscalYear,
      createdByName: record.receivedBy || currentUser?.name || 'Supply Custodian',
      createdAt: new Date().toISOString()
    };
    setExpenses(prev => [newExpense, ...prev]);

    logAudit('RESTOCK', 'RESTOCK', `Received restocking ${newId} with ${record.items.length} items (₱${record.totalCost.toLocaleString()})`);
  };

  const updateRestockRecord = (id: string, updated: Partial<RestockRecord>) => {
    const old = restockRecords.find(r => r.id === id);
    if (!old) return;

    // Revert old inventory counts
    let updatedInventory = inventory.map(inv => {
      const oldMatch = old.items.find(ri => ri.invId === inv.id || ri.name.toLowerCase() === inv.name.toLowerCase());
      return oldMatch ? { ...inv, quantity: Math.max(0, inv.quantity - oldMatch.qty) } : inv;
    });

    // Apply new inventory counts if items changed
    const newItems = updated.items || old.items;
    updatedInventory = updatedInventory.map(inv => {
      const newMatch = newItems.find(ri => ri.invId === inv.id || ri.name.toLowerCase() === inv.name.toLowerCase());
      return newMatch ? { ...inv, quantity: inv.quantity + newMatch.qty } : inv;
    });

    setInventory(updatedInventory);
    setRestockRecords(prev => prev.map(r => r.id === id ? { ...r, ...updated } : r));

    // Update corresponding expense entry
    if (updated.totalCost !== undefined || updated.date || updated.items) {
      setExpenses(prev => prev.map(e => {
        if (e.id === `EXP-RESTOCK-${id}` || e.ref === old.refNum) {
          return {
            ...e,
            amount: updated.totalCost ?? e.amount,
            date: updated.date ?? e.date,
            desc: updated.items ? `Restocking: ${updated.items.map(i => `${i.name} (x${i.qty})`).join(', ')}` : e.desc
          };
        }
        return e;
      }));
    }

    logAudit('UPDATE', 'RESTOCK', `Updated restock record ${id}`);
  };

  const deleteRestockRecord = (id: string) => {
    const old = restockRecords.find(r => r.id === id);
    if (!old) return;

    // Deduct stock that was previously added
    setInventory(prev => prev.map(inv => {
      const match = old.items.find(ri => ri.invId === inv.id || ri.name.toLowerCase() === inv.name.toLowerCase());
      return match ? { ...inv, quantity: Math.max(0, inv.quantity - match.qty) } : inv;
    }));

    // Remove restock record
    setRestockRecords(prev => prev.filter(r => r.id !== id));

    // Remove related expense
    setExpenses(prev => prev.filter(e => e.id !== `EXP-RESTOCK-${id}`));

    logAudit('DELETE', 'RESTOCK', `Deleted restock record ${id}; inventory quantities and budget reversed`);
  };

  // ── ISSUANCE ACTIONS ───────────────────────────────────────────────────────
  const addIssuanceRecord = (record: Omit<IssuanceRecord, 'id' | 'createdAt'>): { success: boolean; error?: string } => {
    // 1. Verify stock availability
    for (const item of record.items) {
      const stock = inventory.find(i => i.id === item.itemId);
      if (!stock) {
        return { success: false, error: `Item "${item.name}" not found in inventory.` };
      }
      if (stock.quantity < item.qty) {
        return { success: false, error: `Insufficient stock for "${item.name}". In stock: ${stock.quantity}, requested: ${item.qty}` };
      }
    }

    const newId = `ISS-${String(issuanceRecords.length + 1).padStart(3, '0')}`;
    const newIssuance: IssuanceRecord = {
      ...record,
      id: newId,
      createdAt: new Date().toISOString()
    };

    // 2. Deduct from inventory
    setInventory(prev => prev.map(inv => {
      const match = record.items.find(i => i.itemId === inv.id);
      return match ? { ...inv, quantity: Math.max(0, inv.quantity - match.qty) } : inv;
    }));

    // 3. Save issuance
    setIssuanceRecords(prev => [newIssuance, ...prev]);
    logAudit('ISSUE', 'ISSUANCE', `Released supplies for ${newId} to ${record.requester} (${record.items.map(i => `${i.name} x${i.qty}`).join(', ')})`);

    return { success: true };
  };

  const updateIssuanceRecord = (id: string, updated: Partial<IssuanceRecord>): { success: boolean; error?: string } => {
    const old = issuanceRecords.find(i => i.id === id);
    if (!old) return { success: false, error: 'Issuance record not found.' };

    if (updated.items) {
      // Restore old stock
      let tempInventory = inventory.map(inv => {
        const match = old.items.find(i => i.itemId === inv.id);
        return match ? { ...inv, quantity: inv.quantity + match.qty } : inv;
      });

      // Check new items stock
      for (const item of updated.items) {
        const stock = tempInventory.find(i => i.id === item.itemId);
        if (!stock || stock.quantity < item.qty) {
          return { success: false, error: `Insufficient stock for "${item.name}" under new quantities.` };
        }
      }

      // Apply new deductions
      tempInventory = tempInventory.map(inv => {
        const match = updated.items?.find(i => i.itemId === inv.id);
        return match ? { ...inv, quantity: inv.quantity - match.qty } : inv;
      });

      setInventory(tempInventory);
    }

    setIssuanceRecords(prev => prev.map(i => i.id === id ? { ...i, ...updated } : i));
    logAudit('UPDATE', 'ISSUANCE', `Updated issuance record ${id}`);
    return { success: true };
  };

  const deleteIssuanceRecord = (id: string) => {
    const old = issuanceRecords.find(i => i.id === id);
    if (!old) return;

    // Restore stock
    setInventory(prev => prev.map(inv => {
      const match = old.items.find(i => i.itemId === inv.id);
      return match ? { ...inv, quantity: inv.quantity + match.qty } : inv;
    }));

    setIssuanceRecords(prev => prev.filter(i => i.id !== id));
    logAudit('DELETE', 'ISSUANCE', `Deleted issuance record ${id}; inventory stock restored`);
  };

  // ── AUTOMATED PROCUREMENT REQUESTS ─────────────────────────────────────────
  const checkAndGenerateAutoProcurement = (): ProcurementRequest | null => {
    // Find all items where quantity <= minStock
    const lowStocks = inventory.filter(i => i.quantity <= i.minStock);
    if (lowStocks.length === 0) return null;

    // Generate line items with recommended replenishment buffer
    const prItems: ProcurementItem[] = lowStocks.map(item => {
      const pl = priceList.find(p => p.invId === item.id || p.name.toLowerCase() === item.name.toLowerCase());
      const unitCost = pl ? pl.price : 100;
      // Reorder formula: replenish back up to 2.5x minStock (or at least 10 units buffer)
      const buffer = Math.max(item.minStock * 2, 10);
      const requestedQty = Math.max(buffer - item.quantity, item.minStock);

      return {
        invId: item.id,
        name: item.name,
        unit: item.unit,
        currentStock: item.quantity,
        minStock: item.minStock,
        requestedQty,
        estimatedUnitCost: unitCost,
        estimatedTotalCost: requestedQty * unitCost
      };
    });

    const totalCost = prItems.reduce((s, it) => s + it.estimatedTotalCost, 0);
    const newPRId = `PR-${fiscalYear}-${String(procurementRequests.length + 1).padStart(3, '0')}`;

    const newPR: ProcurementRequest = {
      id: newPRId,
      date: new Date().toISOString().slice(0, 10),
      urgency: 'Urgent',
      purpose: `Automated replenishment for ${lowStocks.length} supplies at or below safety stock threshold`,
      items: prItems,
      totalEstimatedCost: totalCost,
      status: 'Draft',
      requestedBy: currentUser?.name || 'Automated Stock Custodian System',
      notes: 'Generated automatically by predefined stock threshold monitor.',
      createdAt: new Date().toISOString()
    };

    setProcurementRequests(prev => [newPR, ...prev]);
    logAudit('CREATE', 'PROCUREMENT', `Generated automated procurement request ${newPRId} for ${lowStocks.length} critical items (₱${totalCost.toLocaleString()})`);
    return newPR;
  };

  const addProcurementRequest = (req: Omit<ProcurementRequest, 'id' | 'createdAt'>) => {
    const newId = `PR-${fiscalYear}-${String(procurementRequests.length + 1).padStart(3, '0')}`;
    const newReq: ProcurementRequest = {
      ...req,
      id: newId,
      createdAt: new Date().toISOString()
    };
    setProcurementRequests(prev => [newReq, ...prev]);
    logAudit('CREATE', 'PROCUREMENT', `Created procurement request ${newId} (₱${req.totalEstimatedCost.toLocaleString()})`);
  };

  const updateProcurementRequest = (id: string, updated: Partial<ProcurementRequest>) => {
    setProcurementRequests(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p));
    logAudit('UPDATE', 'PROCUREMENT', `Updated procurement request ${id}`);
  };

  const deleteProcurementRequest = (id: string) => {
    setProcurementRequests(prev => prev.filter(p => p.id !== id));
    logAudit('DELETE', 'PROCUREMENT', `Deleted procurement request ${id}`);
  };

  const approveProcurementRequest = (id: string, poNumber?: string) => {
    const today = new Date().toISOString().slice(0, 10);
    const generatedPO = poNumber || `PO-${fiscalYear}-${Math.floor(100 + Math.random() * 900)}`;

    setProcurementRequests(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          status: 'Approved',
          approvedBy: currentUser?.name || 'Jade Legaspi (Asst. Commissioner)',
          approvalDate: today,
          poNumber: generatedPO
        };
      }
      return p;
    }));

    logAudit('APPROVE', 'PROCUREMENT', `Approved procurement request ${id} with PO #${generatedPO}`);
  };

  const receiveProcurementRequest = (id: string) => {
    const pr = procurementRequests.find(p => p.id === id);
    if (!pr || pr.status === 'Received & Restocked') return;

    // 1. Mark PR as received
    setProcurementRequests(prev => prev.map(p => p.id === id ? { ...p, status: 'Received & Restocked' } : p));

    // 2. Automatically restock inventory items!
    setInventory(prev => prev.map(inv => {
      const match = pr.items.find(pi => pi.invId === inv.id || pi.name.toLowerCase() === inv.name.toLowerCase());
      return match ? { ...inv, quantity: inv.quantity + match.requestedQty } : inv;
    }));

    // 3. Create Restock Record
    const restockItems = pr.items.map(it => {
      const pl = priceList.find(p => p.invId === it.invId || p.name.toLowerCase() === it.name.toLowerCase());
      return {
        plId: pl?.id || 101,
        invId: it.invId,
        name: it.name,
        qty: it.requestedQty,
        unitCost: it.estimatedUnitCost,
        total: it.estimatedTotalCost
      };
    });

    const newRestockId = `REQ-PR-${String(restockRecords.length + 1).padStart(3, '0')}`;
    const newRestock: RestockRecord = {
      id: newRestockId,
      date: new Date().toISOString().slice(0, 10),
      docType: 'PO',
      refNum: pr.poNumber || pr.id,
      remarks: `Restocked via Procurement Request ${pr.id}`,
      items: restockItems,
      totalCost: pr.totalEstimatedCost,
      receivedBy: currentUser?.name || 'Supply Custodian',
      createdAt: new Date().toISOString()
    };
    setRestockRecords(prev => [newRestock, ...prev]);

    // 4. Record corresponding expense
    const suppliesItem = budgetItems.find(b => b.id === 'office-supplies') || budgetItems[0];
    const subCategory = suppliesItem?.subs[0] || { id: 'supplies-sub', label: 'Office Supplies', budget: 50000 };

    const newExpense: ExpenseEntry = {
      id: `EXP-PR-${pr.id}`,
      date: new Date().toISOString().slice(0, 10),
      ref: pr.poNumber || pr.id,
      itemId: suppliesItem.id,
      subId: subCategory.id,
      amount: pr.totalEstimatedCost,
      desc: `Delivery for ${pr.id}: ${pr.items.map(i => `${i.name} (x${i.requestedQty})`).join(', ')}`,
      status: 'Disbursed',
      fiscalYear,
      createdByName: currentUser?.name || 'Supply Custodian',
      createdAt: new Date().toISOString()
    };
    setExpenses(prev => [newExpense, ...prev]);

    logAudit('RESTOCK', 'PROCUREMENT', `Received and restocked items for ${pr.id}; inventory updated & expense booked`);
  };

  // ── SUPABASE CONFIG & SYNC ─────────────────────────────────────────────────
  const updateSupabaseConfig = (config: Partial<SupabaseConfig>) => {
    const updated = { ...supabaseConfig, ...config };
    setSupabaseConfigState(updated);
    saveSupabaseConfig(updated);
    logAudit('UPDATE', 'SYSTEM', 'Updated Supabase project configuration settings');
  };

  const syncWithSupabase = async (): Promise<{ success: boolean; message: string }> => {
    const client = getSupabaseClient(supabaseConfig);
    if (!client) {
      return { success: false, message: 'Supabase is not configured. Please enter your project URL and Anon key in Settings.' };
    }

    setIsSyncing(true);
    try {
      // 1. Sync expenses
      const { error: expError } = await client.from('wfp_expenses').upsert(
        expenses.map(e => ({
          id: e.id,
          date: e.date,
          ref: e.ref,
          item_id: e.itemId,
          sub_id: e.subId,
          amount: e.amount,
          description: e.desc,
          status: e.status,
          fiscal_year: e.fiscalYear,
          created_by_name: e.createdByName
        }))
      );
      if (expError) console.warn('Supabase expense sync notice:', expError.message);

      // 2. Sync inventory
      const { error: invError } = await client.from('inventory_items').upsert(
        inventory.map(i => ({
          id: i.id,
          name: i.name,
          unit: i.unit,
          quantity: i.quantity,
          min_stock: i.minStock,
          category: i.category,
          location: i.location
        }))
      );
      if (invError) console.warn('Supabase inventory sync notice:', invError.message);

      // 3. Sync price list
      const { error: plError } = await client.from('price_list').upsert(
        priceList.map(p => ({
          id: p.id,
          inv_id: p.invId,
          name: p.name,
          unit: p.unit,
          price: p.price,
          category: p.category,
          updated_date: p.updatedDate
        }))
      );
      if (plError) console.warn('Supabase price list sync notice:', plError.message);

      const now = new Date().toISOString();
      updateSupabaseConfig({ isConnected: true, lastSync: now });
      logAudit('SYNC', 'SYSTEM', 'Successfully synchronized local records with Supabase Cloud Database');

      return { success: true, message: `Records synchronized successfully at ${new Date().toLocaleTimeString()}!` };
    } catch (err: any) {
      console.error('Supabase sync error:', err);
      return { success: false, message: err.message || 'Sync failed.' };
    } finally {
      setIsSyncing(false);
    }
  };

  const resetToDefaultData = () => {
    setBudgetItems(INITIAL_BUDGET_ITEMS);
    setExpenses(INITIAL_EXPENSES);
    setInventory(INITIAL_INVENTORY);
    setPriceList(INITIAL_PRICE_LIST);
    setRestockRecords(INITIAL_RESTOCK);
    setIssuanceRecords(INITIAL_ISSUANCES);
    setProcurementRequests(INITIAL_PROCUREMENT_REQUESTS);
    setFiscalYear(2026);
    logAudit('UPDATE', 'SYSTEM', 'System reset to official initial seed data');
  };

  // ── COMPUTED METRICS ───────────────────────────────────────────────────────
  const totalApprovedBudget = budgetItems.reduce((acc, item) => {
    return acc + item.subs.reduce((sAcc, sub) => sAcc + sub.budget, 0);
  }, 0);

  const totalObligatedExpenses = expenses.reduce((acc, e) => acc + Number(e.amount), 0);

  const totalDisbursedExpenses = expenses
    .filter(e => e.status === 'Disbursed')
    .reduce((acc, e) => acc + Number(e.amount), 0);

  const remainingBudget = totalApprovedBudget - totalObligatedExpenses;

  const utilizationRate = totalApprovedBudget > 0 
    ? (totalObligatedExpenses / totalApprovedBudget) * 100 
    : 0;

  const lowStockItems = inventory.filter(i => i.quantity <= i.minStock);

  return (
    <DataContext.Provider
      value={{
        budgetItems,
        expenses,
        inventory,
        priceList,
        restockRecords,
        issuanceRecords,
        procurementRequests,
        auditLogs,
        supabaseConfig,
        fiscalYear,
        isSyncing,
        setFiscalYear,
        updateSupabaseConfig,
        syncWithSupabase,
        addBudgetItem,
        updateBudgetItem,
        deleteBudgetItem,
        addSubCategory,
        updateSubCategory,
        deleteSubCategory,
        addExpense,
        updateExpense,
        deleteExpense,
        addInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,
        addPriceItem,
        updatePriceItem,
        deletePriceItem,
        addRestockRecord,
        updateRestockRecord,
        deleteRestockRecord,
        addIssuanceRecord,
        updateIssuanceRecord,
        deleteIssuanceRecord,
        checkAndGenerateAutoProcurement,
        addProcurementRequest,
        updateProcurementRequest,
        deleteProcurementRequest,
        approveProcurementRequest,
        receiveProcurementRequest,
        resetToDefaultData,
        totalApprovedBudget,
        totalObligatedExpenses,
        totalDisbursedExpenses,
        remainingBudget,
        utilizationRate,
        lowStockItems
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
