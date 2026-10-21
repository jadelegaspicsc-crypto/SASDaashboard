import { BudgetItem, InventoryItem, PriceItem, ExpenseEntry, RestockRecord, IssuanceRecord, ProcurementRequest } from '../types';

export const INITIAL_BUDGET_ITEMS: BudgetItem[] = [
  {
    id: 'purchase-equipment',
    name: 'Purchase of Office Equipment & Appliances',
    icon: 'Printer',
    color: '#6366f1',
    colorBg: 'rgba(99,102,241,0.14)',
    subs: [
      { id: 'comb-machine', label: 'Comb Binding Machine (Heavy Duty)', type: 'Semi-Expendable Machinery & Equipment', budget: 20000 },
      { id: 'tower-fan', label: 'Tower Fan', type: 'Semi-Expendable Machinery & Equipment', budget: 18000 },
      { id: 'drinking-glass', label: 'Sets of Drinking Glass', type: 'Semi-Expendable – Other Equipment', budget: 3000 },
      { id: 'cup-saucer', label: 'Sets of Cup and Saucer', type: 'Semi-Expendable – Other Equipment', budget: 3000 }
    ]
  },
  {
    id: 'traveling',
    name: 'Travelling Related Expenses',
    icon: 'Plane',
    color: '#3b82f6',
    colorBg: 'rgba(59,130,246,0.14)',
    subs: [
      { id: 'air-tickets', label: 'Air Tickets – Local Travels (Asst. Commissioner)', type: 'Traveling Expenses – Local', budget: 200000.04 },
      { id: 'rfid-toll', label: 'RFID Toll & Parking Fee', type: 'Traveling Expenses – Local', budget: 30000 }
    ]
  },
  {
    id: 'learning-dev',
    name: 'Learning and Development',
    icon: 'GraduationCap',
    color: '#14b8a6',
    colorBg: 'rgba(20,184,166,0.14)',
    subs: [
      { id: 'ld-training', label: 'L&D – 5 Staff & 1 Asst. Commissioner (₱6,000 × 6 pax)', type: 'Training Expenses', budget: 36000 }
    ]
  },
  {
    id: 'meetings-csc',
    name: 'Conduct of Meetings / Activities with CSC & Other Agencies',
    icon: 'Users',
    color: '#f59e0b',
    colorBg: 'rgba(245,158,11,0.14)',
    subs: [
      { id: 'meals-csc', label: 'Meals for Meetings (₱325 × 35 pax × 12 months)', type: 'Representation Expenses', budget: 136500 }
    ]
  },
  {
    id: 'meetings-sas',
    name: 'Conduct of Meetings with SAS Cluster Offices',
    icon: 'Building2',
    color: '#a855f7',
    colorBg: 'rgba(168,85,247,0.14)',
    subs: [
      { id: 'meals-sas', label: 'Meals / Representation (₱325 × 20 pax × 7 meetings)', type: 'Representation Expenses', budget: 45500 },
      { id: 'supplies-sas', label: 'Other Supplies & Materials (Interfold Tissue, Plates, etc.)', type: 'Other Maintenance & Operating Expenses', budget: 8000 }
    ]
  },
  {
    id: 'pantry',
    name: 'Pantry Supplies',
    icon: 'Coffee',
    color: '#22c55e',
    colorBg: 'rgba(34,197,94,0.14)',
    subs: [
      { id: 'pantry-sup', label: 'Pantry Supplies & Other Materials', type: 'Other Maintenance & Operating Expenses', budget: 8000 }
    ]
  },
  {
    id: 'notarial',
    name: 'Notarial Services',
    icon: 'FileCheck2',
    color: '#ef4444',
    colorBg: 'rgba(239,68,68,0.14)',
    subs: [
      { id: 'notarial-fees', label: 'Notarial Fees for Documents', type: 'Legal Services', budget: 5000 }
    ]
  },
  {
    id: 'office-supplies',
    name: 'Office Supplies & Other Materials (Non-PSDBM)',
    icon: 'FileSpreadsheet',
    color: '#0ea5e9',
    colorBg: 'rgba(14,165,233,0.14)',
    subs: [
      { id: 'other-sup', label: 'A3 Paper, Stamps, Inks, Frames, Storage Boxes, etc.', type: 'Other Maintenance & Operating Expenses', budget: 25000 },
      { id: 'cse-sup', label: 'Office Supplies – CSE (PS DBM Catalogue)', type: 'Office Supplies Expenses', budget: 58977.04 }
    ]
  },
  {
    id: 'team-building',
    name: 'OACSAS Team Building Activity',
    icon: 'HeartHandshake',
    color: '#f97316',
    colorBg: 'rgba(249,115,22,0.14)',
    subs: [
      { id: 'tba', label: 'Meals / Accommodation / Gasoline / Supplies (6 pax × 2 days)', type: 'Charged to OFAM', budget: 36000 }
    ]
  },
  {
    id: 'ops-planning',
    name: 'OACSAS Operations Planning',
    icon: 'GanttChart',
    color: '#84cc16',
    colorBg: 'rgba(132,204,22,0.14)',
    subs: [
      { id: 'plan-meals', label: 'Meals (6 pax × 2 days)', type: 'Representation Expenses', budget: 10000 },
      { id: 'plan-sup', label: 'Other Supplies & Materials', type: 'Other Maintenance & Operating Expenses', budget: 2000 }
    ]
  },
  {
    id: 'year-end',
    name: 'OACSAS Year-End Assessment',
    icon: 'CalendarDays',
    color: '#ec4899',
    colorBg: 'rgba(236,72,153,0.14)',
    subs: [
      { id: 'ye-meals', label: 'Meals (6 pax × 2 days)', type: 'Representation Expenses', budget: 4000 },
      { id: 'ye-accommo', label: 'Accommodation', type: 'Rental / Lease Expense', budget: 8000 }
    ]
  },
  {
    id: 'yearend-sas',
    name: 'Year-End Assessment with SAS Cluster Offices',
    icon: 'UsersRound',
    color: '#2dd4bf',
    colorBg: 'rgba(45,212,191,0.14)',
    subs: [
      { id: 'yesas-meals', label: 'Meals (₱650 × 29 pax)', type: 'Representation Expenses', budget: 18850 }
    ]
  },
  {
    id: 'cos-workers',
    name: 'Hiring of Contract of Service (COS) Workers',
    icon: 'UserCheck',
    color: '#a3e635',
    colorBg: 'rgba(163,230,53,0.14)',
    subs: [
      { id: 'cos-sg10', label: 'SG 10 – 1 COS Worker (₱32,300.40/mo × 12)', type: 'Labor and Wages', budget: 387604.80 },
      { id: 'cos-sg11', label: 'SG 11 – 1 COS Worker (₱38,046/mo × 12)', type: 'Labor and Wages', budget: 456552.00 },
      { id: 'cos-sg18', label: 'SG 18 – 1 COS Worker (₱64,581.60/mo × 12)', type: 'Labor and Wages', budget: 774979.20 }
    ]
  },
  {
    id: 'si1',
    name: 'SI#1: Capacity Building – Common Financial Documents',
    icon: 'Award',
    color: '#fb923c',
    colorBg: 'rgba(251,146,60,0.14)',
    subs: [
      { id: 'si1-fin-meals', label: 'Meals – Finalization (₱325 × 6 pax × 2 mtgs)', type: 'Representation Expenses', budget: 3900 },
      { id: 'si1-fin-sup', label: 'Other Supplies – Finalization', type: 'Other Maintenance & Operating Expenses', budget: 500 },
      { id: 'si1-trn-meals', label: 'Meals – 2-Day Training (₱400 × 85 pax)', type: 'Representation Expenses', budget: 34000 },
      { id: 'si1-trn-sup', label: 'Other Supplies – Training', type: 'Other Maintenance & Operating Expenses', budget: 4000 },
      { id: 'si1-trn-kits', label: 'Training Kits (₱150 × 80 pax)', type: 'Other Maintenance & Operating Expenses', budget: 12000 },
      { id: 'si1-eval-meals', label: 'Meals – Post-Evaluation (₱325 × 6 pax)', type: 'Representation Expenses', budget: 1950 },
      { id: 'si1-eval-sup', label: 'Other Supplies – Post-Evaluation', type: 'Other Maintenance & Operating Expenses', budget: 200 }
    ]
  },
  {
    id: 'si2',
    name: 'SI#2: Implementation Review – CSC Onboarding Program',
    icon: 'Presentation',
    color: '#38bdf8',
    colorBg: 'rgba(56,189,248,0.14)',
    subs: [
      { id: 'si2-fin-meals', label: 'Meals – Finalization (₱325 × 15 pax × 2 mtgs)', type: 'Representation Expenses', budget: 9750 },
      { id: 'si2-fin-sup', label: 'Other Supplies – Finalization', type: 'Other Maintenance & Operating Expenses', budget: 500 },
      { id: 'si2-fgd-meals', label: 'FGD Meals (₱325 × 20 pax × 2 mtgs)', type: 'Representation Expenses', budget: 13000 },
      { id: 'si2-fgd-sup', label: 'Other Supplies – FGD', type: 'Other Maintenance & Operating Expenses', budget: 500 },
      { id: 'si2-eval-meals', label: 'Meals – Post-Evaluation (₱325 × 6 pax)', type: 'Representation Expenses', budget: 1950 },
      { id: 'si2-eval-sup', label: 'Other Supplies – Post-Evaluation', type: 'Other Maintenance & Operating Expenses', budget: 200 }
    ]
  }
];

export const INITIAL_PRICE_LIST: PriceItem[] = [
  { id: 101, invId: 1, name: 'Ballpen (Black, 0.7mm)', unit: 'box', price: 185.00, category: 'Writing Instruments', updatedDate: '2026-01-10' },
  { id: 102, invId: 2, name: 'Sign Pen (Blue, 0.5mm)', unit: 'box', price: 420.00, category: 'Writing Instruments', updatedDate: '2026-01-10' },
  { id: 103, invId: 3, name: 'A4 Copy Paper (80gsm, 500 sheets)', unit: 'ream', price: 245.50, category: 'Paper Products', updatedDate: '2026-01-12' },
  { id: 104, invId: 4, name: 'Legal / Folio Paper (80gsm)', unit: 'ream', price: 280.00, category: 'Paper Products', updatedDate: '2026-01-12' },
  { id: 105, invId: 5, name: 'Correction Tape (5mm x 8m)', unit: 'pc', price: 42.00, category: 'Office Supplies', updatedDate: '2026-01-15' },
  { id: 106, invId: 6, name: 'Sticky Notes (3x3 inch, Yellow)', unit: 'pad', price: 38.50, category: 'Paper Products', updatedDate: '2026-01-15' },
  { id: 107, invId: 7, name: 'Heavy Duty Stapler with Remover', unit: 'unit', price: 650.00, category: 'Office Equipment', updatedDate: '2026-01-20' },
  { id: 108, invId: 8, name: 'Staple Wire #35', unit: 'box', price: 55.00, category: 'Office Supplies', updatedDate: '2026-01-20' },
  { id: 109, invId: 9, name: 'Expanding Folder with String (Long)', unit: 'pack', price: 320.00, category: 'Filing & Storage', updatedDate: '2026-01-22' },
  { id: 110, invId: 10, name: 'Data Folder with Clear Pocket (Long)', unit: 'pc', price: 85.00, category: 'Filing & Storage', updatedDate: '2026-01-22' },
  { id: 111, invId: 11, name: 'Paper Clips (Jumbo, 50mm)', unit: 'box', price: 48.00, category: 'Office Supplies', updatedDate: '2026-01-25' },
  { id: 112, invId: 12, name: 'Sanitizing Alcohol 70% (Gallon)', unit: 'gal', price: 450.00, category: 'Janitorial & Pantry', updatedDate: '2026-01-28' },
  { id: 113, invId: 13, name: 'Interfold Paper Towel (175 pulls)', unit: 'pack', price: 65.00, category: 'Janitorial & Pantry', updatedDate: '2026-01-28' }
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  { id: 1, name: 'Ballpen (Black, 0.7mm)', unit: 'box', quantity: 18, minStock: 10, category: 'Writing Instruments', location: 'Cabinet A-1' },
  { id: 2, name: 'Sign Pen (Blue, 0.5mm)', unit: 'box', quantity: 4, minStock: 8, category: 'Writing Instruments', location: 'Cabinet A-1' }, // Low stock!
  { id: 3, name: 'A4 Copy Paper (80gsm, 500 sheets)', unit: 'ream', quantity: 45, minStock: 25, category: 'Paper Products', location: 'Supply Room Shelf 2' },
  { id: 4, name: 'Legal / Folio Paper (80gsm)', unit: 'ream', quantity: 12, minStock: 15, category: 'Paper Products', location: 'Supply Room Shelf 2' }, // Low stock!
  { id: 5, name: 'Correction Tape (5mm x 8m)', unit: 'pc', quantity: 2, minStock: 12, category: 'Office Supplies', location: 'Cabinet A-2' }, // Low stock!
  { id: 6, name: 'Sticky Notes (3x3 inch, Yellow)', unit: 'pad', quantity: 24, minStock: 15, category: 'Paper Products', location: 'Cabinet A-3' },
  { id: 7, name: 'Heavy Duty Stapler with Remover', unit: 'unit', quantity: 5, minStock: 3, category: 'Office Equipment', location: 'Cabinet B-1' },
  { id: 8, name: 'Staple Wire #35', unit: 'box', quantity: 30, minStock: 15, category: 'Office Supplies', location: 'Cabinet B-1' },
  { id: 9, name: 'Expanding Folder with String (Long)', unit: 'pack', quantity: 3, minStock: 8, category: 'Filing & Storage', location: 'Supply Room Shelf 3' }, // Low stock!
  { id: 10, name: 'Data Folder with Clear Pocket (Long)', unit: 'pc', quantity: 35, minStock: 20, category: 'Filing & Storage', location: 'Supply Room Shelf 3' },
  { id: 11, name: 'Paper Clips (Jumbo, 50mm)', unit: 'box', quantity: 22, minStock: 10, category: 'Office Supplies', location: 'Cabinet A-2' },
  { id: 12, name: 'Sanitizing Alcohol 70% (Gallon)', unit: 'gal', quantity: 8, minStock: 5, category: 'Janitorial & Pantry', location: 'Pantry Utility Cabinet' },
  { id: 13, name: 'Interfold Paper Towel (175 pulls)', unit: 'pack', quantity: 40, minStock: 20, category: 'Janitorial & Pantry', location: 'Pantry Utility Cabinet' }
];

export const INITIAL_EXPENSES: ExpenseEntry[] = [
  {
    id: 'EXP-2026-001',
    date: '2026-01-15',
    ref: 'OR-2026-014',
    itemId: 'meetings-csc',
    subId: 'meals-csc',
    amount: 11375.00,
    desc: 'Catering service for CSC monthly coordination meeting (Jan 2026)',
    status: 'Disbursed',
    fiscalYear: 2026,
    createdByName: 'Jade Legaspi',
    createdAt: '2026-01-15T09:30:00Z'
  },
  {
    id: 'EXP-2026-002',
    date: '2026-01-20',
    ref: 'OR-2026-032',
    itemId: 'cos-workers',
    subId: 'cos-sg10',
    amount: 32300.40,
    desc: 'January 2026 professional compensation for SG 10 COS Administrative Assistant',
    status: 'Disbursed',
    fiscalYear: 2026,
    createdByName: 'Jade Legaspi',
    createdAt: '2026-01-20T14:15:00Z'
  },
  {
    id: 'EXP-2026-003',
    date: '2026-01-20',
    ref: 'OR-2026-033',
    itemId: 'cos-workers',
    subId: 'cos-sg11',
    amount: 38046.00,
    desc: 'January 2026 professional compensation for SG 11 COS Budget Analyst',
    status: 'Disbursed',
    fiscalYear: 2026,
    createdByName: 'Jade Legaspi',
    createdAt: '2026-01-20T14:20:00Z'
  },
  {
    id: 'EXP-2026-004',
    date: '2026-01-20',
    ref: 'OR-2026-034',
    itemId: 'cos-workers',
    subId: 'cos-sg18',
    amount: 64581.60,
    desc: 'January 2026 professional compensation for SG 18 COS Senior Technical Specialist',
    status: 'Disbursed',
    fiscalYear: 2026,
    createdByName: 'Jade Legaspi',
    createdAt: '2026-01-20T14:25:00Z'
  },
  {
    id: 'EXP-2026-005',
    date: '2026-01-28',
    ref: 'RIS-2026-001',
    itemId: 'office-supplies',
    subId: 'cse-sup',
    amount: 14730.00,
    desc: 'Q1 Regular replenishment of office CSE paper and writing consumables from PS-DBM',
    status: 'Disbursed',
    fiscalYear: 2026,
    createdByName: 'Supply Custodian',
    createdAt: '2026-01-28T11:00:00Z'
  },
  {
    id: 'EXP-2026-006',
    date: '2026-02-12',
    ref: 'PO-2026-088',
    itemId: 'traveling',
    subId: 'air-tickets',
    amount: 28450.00,
    desc: 'PAL flight tickets for Regional SAS Cluster Inspection in Cebu & Davao (Assistant Commissioner)',
    status: 'Obligated',
    fiscalYear: 2026,
    createdByName: 'Jade Legaspi',
    createdAt: '2026-02-12T10:00:00Z'
  },
  {
    id: 'EXP-2026-007',
    date: '2026-02-18',
    ref: 'RFID-FEB-01',
    itemId: 'traveling',
    subId: 'rfid-toll',
    amount: 4500.00,
    desc: 'Autosweep and Easytrip RFID replenishment for service vehicle official travels',
    status: 'Disbursed',
    fiscalYear: 2026,
    createdByName: 'Jade Legaspi',
    createdAt: '2026-02-18T16:30:00Z'
  },
  {
    id: 'EXP-2026-008',
    date: '2026-02-24',
    ref: 'PR-2026-019',
    itemId: 'pantry',
    subId: 'pantry-sup',
    amount: 1850.00,
    desc: 'Monthly drinking water dispensers replenishment and coffee/tea pantry supplies',
    status: 'Disbursed',
    fiscalYear: 2026,
    createdByName: 'Supply Custodian',
    createdAt: '2026-02-24T08:45:00Z'
  }
];

export const INITIAL_RESTOCK: RestockRecord[] = [
  {
    id: 'REQ-001',
    date: '2026-01-25',
    docType: 'RIS',
    refNum: 'RIS-2026-001',
    remarks: 'Approved Q1 supply requisition via Central Store',
    items: [
      { plId: 101, invId: 1, name: 'Ballpen (Black, 0.7mm)', qty: 20, unitCost: 185.00, total: 3700.00 },
      { plId: 103, invId: 3, name: 'A4 Copy Paper (80gsm, 500 sheets)', qty: 45, unitCost: 245.50, total: 11047.50 },
      { plId: 108, invId: 8, name: 'Staple Wire #35', qty: 20, unitCost: 55.00, total: 1100.00 }
    ],
    totalCost: 15847.50,
    fileName: null,
    fileData: null,
    fileType: null,
    receivedBy: 'Supply Custodian',
    createdAt: '2026-01-25T11:00:00Z'
  }
];

export const INITIAL_ISSUANCES: IssuanceRecord[] = [
  {
    id: 'ISS-001',
    date: '2026-02-05',
    requester: 'Atty. Maria Santos',
    division: 'Legal & SAS Executive Office',
    items: [
      { itemId: 1, name: 'Ballpen (Black, 0.7mm)', qty: 2 },
      { itemId: 3, name: 'A4 Copy Paper (80gsm, 500 sheets)', qty: 5 },
      { itemId: 6, name: 'Sticky Notes (3x3 inch, Yellow)', qty: 3 }
    ],
    status: 'Released',
    remarks: 'Preparation for Executive Briefing packets',
    issuedBy: 'Supply Custodian',
    createdAt: '2026-02-05T13:40:00Z'
  },
  {
    id: 'ISS-002',
    date: '2026-02-14',
    requester: 'Engr. Roberto Cruz',
    division: 'General Support Services',
    items: [
      { itemId: 5, name: 'Correction Tape (5mm x 8m)', qty: 4 },
      { itemId: 4, name: 'Legal / Folio Paper (80gsm)', qty: 3 }
    ],
    status: 'Released',
    remarks: 'Facilities inspection reports',
    issuedBy: 'Supply Custodian',
    createdAt: '2026-02-14T10:15:00Z'
  }
];

export const INITIAL_PROCUREMENT_REQUESTS: ProcurementRequest[] = [
  {
    id: 'PR-2026-001',
    date: '2026-02-20',
    urgency: 'Urgent',
    purpose: 'Automated Procurement Request: Replenishment of stocks below minimum safety threshold (Sign Pens, Legal Paper, Correction Tapes, Expanding Folders)',
    items: [
      { invId: 2, name: 'Sign Pen (Blue, 0.5mm)', unit: 'box', currentStock: 4, minStock: 8, requestedQty: 12, estimatedUnitCost: 420.00, estimatedTotalCost: 5040.00 },
      { invId: 4, name: 'Legal / Folio Paper (80gsm)', unit: 'ream', currentStock: 12, minStock: 15, requestedQty: 25, estimatedUnitCost: 280.00, estimatedTotalCost: 7000.00 },
      { invId: 5, name: 'Correction Tape (5mm x 8m)', unit: 'pc', currentStock: 2, minStock: 12, requestedQty: 20, estimatedUnitCost: 42.00, estimatedTotalCost: 840.00 },
      { invId: 9, name: 'Expanding Folder with String (Long)', unit: 'pack', currentStock: 3, minStock: 8, requestedQty: 15, estimatedUnitCost: 320.00, estimatedTotalCost: 4800.00 }
    ],
    totalEstimatedCost: 17680.00,
    status: 'Approved',
    requestedBy: 'System Auto-Trigger (Supply Custodian)',
    approvedBy: 'Jade Legaspi (Asst. Commissioner)',
    approvalDate: '2026-02-21',
    poNumber: 'PO-2026-039',
    notes: 'Approved under MOOE CSE supply allotment.',
    createdAt: '2026-02-20T15:20:00Z'
  }
];
