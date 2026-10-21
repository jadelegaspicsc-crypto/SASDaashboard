import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider, useData } from './context/DataContext';
import { Header } from './components/Header';
import { Sidebar, NavTab } from './components/Sidebar';
import { LoginModal } from './components/LoginModal';
import { UserManagementModal } from './components/UserManagementModal';

// Views
import { DashboardView } from './views/DashboardView';
import { BudgetView } from './views/BudgetView';
import { ExpensesView } from './views/ExpensesView';
import { InventoryView } from './views/InventoryView';
import { PriceListView } from './views/PriceListView';
import { RestockView } from './views/RestockView';
import { IssuanceView } from './views/IssuanceView';
import { ProcurementView } from './views/ProcurementView';
import { RISGeneratorView } from './views/RISGeneratorView';
import { ReportsView } from './views/ReportsView';
import { SupabaseSettingsView } from './views/SupabaseSettingsView';
import { AuditTrailView } from './views/AuditTrailView';
import { TeamManagementView } from './views/TeamManagementView';

import { exportFullAuditWorkbook } from './utils/auditExport';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [userManagementModalOpen, setUserManagementModalOpen] = useState(false);

  const { 
    budgetItems, 
    expenses, 
    inventory, 
    priceList, 
    restockRecords, 
    issuanceRecords, 
    procurementRequests, 
    auditLogs, 
    fiscalYear 
  } = useData();

  const handleExportExcel = () => {
    exportFullAuditWorkbook({
      budgetItems,
      expenses,
      inventory,
      priceList,
      restock: restockRecords,
      issuances: issuanceRecords,
      procurements: procurementRequests,
      auditLogs,
      fiscalYear
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Top Header */}
      <Header
        onOpenSupabase={() => setActiveTab('supabase')}
        onOpenProcurement={() => setActiveTab('procurement')}
        onOpenLogin={() => setLoginModalOpen(true)}
        onOpenUserManagement={() => setUserManagementModalOpen(true)}
      />

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onExportExcel={handleExportExcel}
        />

        {/* Main Workspace Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto pb-12">
            {activeTab === 'dashboard' && (
              <DashboardView
                onNavigate={setActiveTab}
                onOpenAddExpense={() => setActiveTab('expenses')}
                onOpenRestock={() => setActiveTab('restock')}
                onOpenIssuance={() => setActiveTab('issuance')}
              />
            )}
            {activeTab === 'budget' && <BudgetView />}
            {activeTab === 'expenses' && <ExpensesView />}
            {activeTab === 'inventory' && <InventoryView onNavigate={setActiveTab} />}
            {activeTab === 'pricelist' && <PriceListView />}
            {activeTab === 'restock' && <RestockView />}
            {activeTab === 'issuance' && <IssuanceView />}
            {activeTab === 'procurement' && <ProcurementView />}
            {activeTab === 'ris' && <RISGeneratorView />}
            {activeTab === 'reports' && <ReportsView />}
            {activeTab === 'supabase' && <SupabaseSettingsView />}
            {activeTab === 'team' && <TeamManagementView />}
            {activeTab === 'audit' && <AuditTrailView />}
          </div>
        </main>
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />

      {/* User & Team Management Modal */}
      <UserManagementModal
        isOpen={userManagementModalOpen}
        onClose={() => setUserManagementModalOpen(false)}
      />

    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}
