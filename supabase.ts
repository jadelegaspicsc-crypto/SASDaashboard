import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SupabaseConfig } from '../types';

const STORAGE_KEY = 'oacsas_supabase_config_v1';

// Read defaults from environment or localStorage
export function getSavedSupabaseConfig(): SupabaseConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to parse Supabase config', e);
  }

  return {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
    isConnected: false,
    autoSync: false,
    lastSync: null
  };
}

export function saveSupabaseConfig(config: SupabaseConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save Supabase config', e);
  }
}

let activeClient: SupabaseClient | null = null;

export function getSupabaseClient(config?: SupabaseConfig): SupabaseClient | null {
  const cfg = config || getSavedSupabaseConfig();
  if (!cfg.url || !cfg.anonKey) {
    return null;
  }

  if (activeClient && (activeClient as any).supabaseUrl === cfg.url) {
    return activeClient;
  }

  try {
    activeClient = createClient(cfg.url, cfg.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    });
    return activeClient;
  } catch (err) {
    console.error('Error creating Supabase client:', err);
    return null;
  }
}

export async function testSupabaseConnection(url: string, anonKey: string): Promise<{ success: boolean; message: string }> {
  if (!url || !anonKey) {
    return { success: false, message: 'URL and Anon Key are required.' };
  }

  try {
    const client = createClient(url, anonKey);
    // Ping by checking auth or a simple table check
    const { error } = await client.from('wfp_expenses').select('id').limit(1);
    
    // If table doesn't exist yet, it's still a valid connection if status is 404 or 42P01
    if (error && error.code !== '42P01' && !error.message?.includes('relation "wfp_expenses" does not exist')) {
      // If error is invalid API key or URL
      if (error.message.includes('Invalid API key') || error.message.includes('JWT') || error.message.includes('Failed to fetch')) {
        return { success: false, message: `Connection failed: ${error.message}` };
      }
    }

    return { 
      success: true, 
      message: 'Successfully connected to Supabase project! Ready for synchronization.' 
    };
  } catch (err: any) {
    return { success: false, message: err.message || 'Failed to connect to Supabase.' };
  }
}

/**
 * Generates SQL migration script for Supabase SQL Editor
 */
export function getSupabaseSQLScript(): string {
  return `-- =========================================================================
-- OACSAS WFP BUDGET & SUPPLIES MANAGEMENT SYSTEM - SUPABASE SCHEMA
-- Execute this script in your Supabase SQL Editor: Dashboard -> SQL Editor -> New Query
-- =========================================================================

-- 1. Budget Line Items
CREATE TABLE IF NOT EXISTS public.wfp_budget_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT,
    color TEXT,
    color_bg TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Sub-Categories (Allotments)
CREATE TABLE IF NOT EXISTS public.wfp_sub_categories (
    id TEXT PRIMARY KEY,
    item_id TEXT REFERENCES public.wfp_budget_items(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    type TEXT NOT NULL, -- Object of Expenditure
    budget NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Expense Entries (Obligations & Disbursements)
CREATE TABLE IF NOT EXISTS public.wfp_expenses (
    id TEXT PRIMARY KEY,
    date DATE NOT NULL,
    ref TEXT,
    item_id TEXT REFERENCES public.wfp_budget_items(id) ON DELETE RESTRICT,
    sub_id TEXT REFERENCES public.wfp_sub_categories(id) ON DELETE RESTRICT,
    amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    description TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Obligated', 'Disbursed', 'Pending')),
    fiscal_year INT DEFAULT 2026,
    created_by_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Master Price List
CREATE TABLE IF NOT EXISTS public.price_list (
    id BIGINT PRIMARY KEY,
    inv_id BIGINT,
    name TEXT NOT NULL,
    unit TEXT NOT NULL,
    price NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    category TEXT,
    updated_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Office Supplies Inventory
CREATE TABLE IF NOT EXISTS public.inventory_items (
    id BIGINT PRIMARY KEY,
    name TEXT NOT NULL,
    unit TEXT NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    min_stock INT NOT NULL DEFAULT 0,
    category TEXT,
    location TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Restocking Records
CREATE TABLE IF NOT EXISTS public.restock_records (
    id TEXT PRIMARY KEY,
    date DATE NOT NULL,
    doc_type TEXT NOT NULL,
    ref_num TEXT,
    remarks TEXT,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_cost NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    file_name TEXT,
    file_data TEXT,
    file_type TEXT,
    received_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Issuance Records
CREATE TABLE IF NOT EXISTS public.issuance_records (
    id TEXT PRIMARY KEY,
    date DATE NOT NULL,
    requester TEXT NOT NULL,
    division TEXT,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'Released',
    remarks TEXT,
    issued_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Automated Procurement Requests
CREATE TABLE IF NOT EXISTS public.procurement_requests (
    id TEXT PRIMARY KEY,
    date DATE NOT NULL,
    urgency TEXT NOT NULL DEFAULT 'Standard',
    purpose TEXT NOT NULL,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_estimated_cost NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'Draft',
    requested_by TEXT NOT NULL,
    approved_by TEXT,
    approval_date DATE,
    po_number TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Audit Trail & Activity Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_role TEXT NOT NULL,
    action TEXT NOT NULL,
    module TEXT NOT NULL,
    details TEXT NOT NULL
);

-- Indexes for lightning fast queries
CREATE INDEX IF NOT EXISTS idx_wfp_expenses_date ON public.wfp_expenses(date);
CREATE INDEX IF NOT EXISTS idx_wfp_expenses_item ON public.wfp_expenses(item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_qty ON public.inventory_items(quantity);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(timestamp DESC);

-- Enable Row Level Security (RLS) - Permissive public access for authenticated applet token
ALTER TABLE public.wfp_budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wfp_sub_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wfp_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restock_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issuance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procurement_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Default open read/write policy for anon key clients
CREATE POLICY "Allow anon all on budget" ON public.wfp_budget_items FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on subcategories" ON public.wfp_sub_categories FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on expenses" ON public.wfp_expenses FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on price_list" ON public.price_list FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on inventory" ON public.inventory_items FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on restock" ON public.restock_records FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on issuance" ON public.issuance_records FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on procurement" ON public.procurement_requests FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on audit" ON public.audit_logs FOR ALL TO anon USING (true) WITH CHECK (true);
`;
}
