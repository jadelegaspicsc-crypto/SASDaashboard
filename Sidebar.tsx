import React from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Wallet, 
  Receipt, 
  Package, 
  Tags, 
  Truck, 
  ClipboardList, 
  Sparkles, 
  FileText, 
  BarChart3, 
  Cloud, 
  History, 
  ShieldAlert,
  Download,
  Users
} from 'lucide-react';
import { formatPeso } from '../utils/auditExport';

export type NavTab = 
  | 'dashboard'
  | 'budget'
  | 'expenses'
  | 'inventory'
  | 'pricelist'
  | 'restock'
  | 'issuance'
  | 'procurement'
  | 'ris'
  | 'reports'
  | 'supabase'
  | 'team'
  | 'audit';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onExportExcel: () => void;
}

interface NavItem {
  id: NavTab;
  label: string;
  icon: React.ElementType;
  badge: string | null;
  badgeColor?: string | null;
}

interface NavGroup {
  section: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  onExportExcel
}) => {
  const { lowStockItems, totalApprovedBudget, remainingBudget } = useData();
  const { permissions } = useAuth();

  const navItems: NavGroup[] = [
    {
      section: 'MONITORING & PLANNING',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
        { id: 'budget', label: 'WFP Budget Plan', icon: Wallet, badge: null },
        { id: 'expenses', label: 'Expense Entries', icon: Receipt, badge: null },
      ]
    },
    {
      section: 'SUPPLIES & INVENTORY',
      items: [
        { 
          id: 'inventory' as NavTab, 
          label: 'Inventory Supplies', 
          icon: Package, 
          badge: lowStockItems.length > 0 ? `${lowStockItems.length} Low` : null,
          badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
        },
        { id: 'pricelist' as NavTab, label: 'Master Price List', icon: Tags, badge: null },
        { id: 'restock' as NavTab, label: 'Restocking Records', icon: Truck, badge: null },
        { id: 'issuance' as NavTab, label: 'Supply Issuances', icon: ClipboardList, badge: null },
        { 
          id: 'procurement' as NavTab, 
          label: 'Auto Procurement', 
          icon: Sparkles, 
          badge: lowStockItems.length > 0 ? 'Triggered' : null,
          badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30 font-semibold'
        },
      ]
    },
    {
      section: 'REPORTS & AUDIT',
      items: [
        { id: 'ris' as NavTab, label: 'RIS Generator (App. 63)', icon: FileText, badge: null },
        { id: 'reports' as NavTab, label: 'Audit & Reports', icon: BarChart3, badge: 'PDF & Excel' },
        { id: 'audit' as NavTab, label: 'System Audit Trail', icon: History, badge: null },
      ]
    },
    {
      section: 'CLOUD & SETTINGS',
      items: [
        { id: 'supabase' as NavTab, label: 'Supabase & Deploy', icon: Cloud, badge: null },
        { id: 'team' as NavTab, label: 'Team & Accounts', icon: Users, badge: null },
      ]
    }
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 h-[calc(100vh-61px)] sticky top-[61px] overflow-y-auto no-print select-none">
      
      {/* Navigation Groups */}
      <div className="flex-1 py-4 px-3 space-y-6">
        {navItems.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 px-3 py-1">
              {group.section}
            </div>

            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/30 translate-x-0.5'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border shrink-0 ${
                      item.badgeColor || (isActive ? 'bg-white/20 text-white border-white/30' : 'bg-slate-800 text-slate-400 border-slate-700')
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Quick Export & Summary Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40">
        <button
          onClick={onExportExcel}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all shadow-sm"
        >
          <Download className="w-3.5 h-3.5 text-emerald-400" />
          <span>Export Audit (Excel)</span>
        </button>

        <div className="mt-2.5 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 text-[11px] space-y-1">
          <div className="flex justify-between text-slate-400">
            <span>Approved Budget:</span>
            <span className="font-mono text-slate-300 font-medium">{formatPeso(totalApprovedBudget)}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Remaining Allotment:</span>
            <span className={`font-mono font-medium ${remainingBudget < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {formatPeso(remainingBudget)}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
