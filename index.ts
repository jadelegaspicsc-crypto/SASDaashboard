export type Role = 'admin' | 'budget_officer' | 'supply_custodian' | 'staff';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  designation: string;
  division: string;
  passwordHash?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface SubCategory {
  id: string;
  label: string;
  type: string; // Object of Expenditure (e.g., Semi-Expendable, Traveling, Labor, Representation)
  budget: number;
}

export interface BudgetItem {
  id: string;
  name: string;
  icon: string;
  color: string;
  colorBg: string;
  subs: SubCategory[];
}

export type ExpenseStatus = 'Obligated' | 'Disbursed' | 'Pending';

export interface ExpenseEntry {
  id: string;
  date: string;
  ref: string;
  itemId: string;
  subId: string;
  amount: number;
  desc: string;
  status: ExpenseStatus;
  fiscalYear: number;
  createdById?: string;
  createdByName?: string;
  createdAt: string;
}

export interface InventoryItem {
  id: number;
  name: string;
  unit: string;
  quantity: number;
  minStock: number;
  category?: string;
  location?: string;
}

export interface PriceItem {
  id: number;
  invId: number | null;
  name: string;
  unit: string;
  price: number;
  category?: string;
  updatedDate: string;
}

export type DocType = 'RIS' | 'PO' | 'DR' | 'SI' | 'OR' | 'Other';

export interface RestockItem {
  plId: number;
  invId: number | null;
  name: string;
  qty: number;
  unitCost: number;
  total: number;
}

export interface RestockRecord {
  id: string;
  date: string;
  docType: DocType;
  refNum: string;
  remarks: string;
  items: RestockItem[];
  totalCost: number;
  fileName?: string | null;
  fileData?: string | null;
  fileType?: string | null;
  receivedBy?: string;
  createdAt: string;
}

export interface IssuanceItem {
  itemId: number;
  name: string;
  qty: number;
}

export interface IssuanceRecord {
  id: string;
  date: string;
  requester: string;
  division?: string;
  items: IssuanceItem[];
  status: 'Released' | 'Approved' | 'Pending';
  remarks?: string;
  issuedBy?: string;
  createdAt: string;
}

export type PRStatus = 'Draft' | 'Submitted' | 'Approved' | 'PO Issued' | 'Received & Restocked' | 'Cancelled';

export interface ProcurementItem {
  invId: number;
  name: string;
  unit: string;
  currentStock: number;
  minStock: number;
  requestedQty: number;
  estimatedUnitCost: number;
  estimatedTotalCost: number;
}

export interface ProcurementRequest {
  id: string; // e.g. PR-2026-001
  date: string;
  urgency: 'Standard' | 'Urgent' | 'Emergency';
  purpose: string;
  items: ProcurementItem[];
  totalEstimatedCost: number;
  status: PRStatus;
  requestedBy: string;
  approvedBy?: string;
  approvalDate?: string;
  poNumber?: string;
  notes?: string;
  createdAt: string;
}

export interface RISData {
  entity: string;
  fund: string;
  division: string;
  respCode: string;
  office: string;
  risNo: string;
  purpose: string;
  reqName: string;
  reqDesig: string;
  reqDate: string;
  apprName: string;
  apprDesig: string;
  apprDate: string;
  items: Array<{
    stockNo: string;
    unit: string;
    desc: string;
    qty: string | number;
  }>;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: Role;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'EXPORT' | 'RESTOCK' | 'ISSUE' | 'APPROVE' | 'SYNC';
  module: 'BUDGET' | 'EXPENSE' | 'INVENTORY' | 'PRICELIST' | 'RESTOCK' | 'ISSUANCE' | 'PROCUREMENT' | 'SYSTEM';
  details: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
  autoSync: boolean;
  lastSync?: string | null;
}
