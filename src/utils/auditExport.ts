import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  BudgetItem, 
  ExpenseEntry, 
  InventoryItem, 
  PriceItem, 
  RestockRecord, 
  IssuanceRecord, 
  ProcurementRequest, 
  AuditLogEntry,
  RISData
} from '../types';

export const formatPeso = (n: number | string): string => {
  const val = Number(n) || 0;
  return '₱' + val.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export const formatDate = (d: string): string => {
  if (!d) return '—';
  try {
    const parts = d.split('T')[0].split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
  } catch (e) {
    // fallback
  }
  return d;
};

/**
 * Generates and downloads a comprehensive multi-sheet Excel (.xlsx) workbook for audit purposes.
 */
export function exportFullAuditWorkbook(data: {
  budgetItems: BudgetItem[];
  expenses: ExpenseEntry[];
  inventory: InventoryItem[];
  priceList: PriceItem[];
  restock: RestockRecord[];
  issuances: IssuanceRecord[];
  procurements: ProcurementRequest[];
  auditLogs: AuditLogEntry[];
  fiscalYear?: number;
}) {
  const wb = XLSX.utils.book_new();

  // 1. WFP Budget Summary Sheet
  const budgetRows: any[] = [];
  let totalApproved = 0;
  let totalObligated = 0;
  let totalDisbursed = 0;

  data.budgetItems.forEach(item => {
    item.subs.forEach(sub => {
      const subExpenses = data.expenses.filter(e => e.itemId === item.id && e.subId === sub.id);
      const obligated = subExpenses.reduce((s, e) => s + Number(e.amount), 0);
      const disbursed = subExpenses.filter(e => e.status === 'Disbursed').reduce((s, e) => s + Number(e.amount), 0);
      const balance = sub.budget - obligated;
      const utilRate = sub.budget > 0 ? ((obligated / sub.budget) * 100).toFixed(2) + '%' : '0.00%';

      totalApproved += sub.budget;
      totalObligated += obligated;
      totalDisbursed += disbursed;

      budgetRows.push({
        'Budget Category': item.name,
        'Sub-Category / Allotment Line': sub.label,
        'Object of Expenditure': sub.type,
        'Approved Allotment (₱)': sub.budget,
        'Total Obligated (₱)': obligated,
        'Total Disbursed (₱)': disbursed,
        'Remaining Balance (₱)': balance,
        'Utilization Rate': utilRate,
        'Status': balance < 0 ? 'Exceeded' : obligated / sub.budget > 0.85 ? 'Near Limit' : 'On Track'
      });
    });
  });

  // Grand Total row
  budgetRows.push({
    'Budget Category': 'GRAND TOTAL',
    'Sub-Category / Allotment Line': 'All Programs & Activities',
    'Object of Expenditure': 'MOOE + Capital Outlay',
    'Approved Allotment (₱)': totalApproved,
    'Total Obligated (₱)': totalObligated,
    'Total Disbursed (₱)': totalDisbursed,
    'Remaining Balance (₱)': totalApproved - totalObligated,
    'Utilization Rate': ((totalObligated / totalApproved) * 100).toFixed(2) + '%',
    'Status': (totalApproved - totalObligated) < 0 ? 'Deficit' : 'Balanced'
  });

  const wsBudget = XLSX.utils.json_to_sheet(budgetRows);
  XLSX.utils.book_append_sheet(wb, wsBudget, 'WFP_Budget_Summary');

  // 2. Expense Ledger Sheet
  const expenseRows = data.expenses.map(e => {
    const item = data.budgetItems.find(i => i.id === e.itemId);
    const sub = item?.subs.find(s => s.id === e.subId);
    return {
      'Expense ID': e.id,
      'Date': e.date,
      'OR / Reference No': e.ref || '—',
      'Budget Category': item?.name || e.itemId,
      'Sub-Category': sub?.label || e.subId,
      'Object of Expenditure': sub?.type || '—',
      'Description / Particulars': e.desc,
      'Amount (₱)': Number(e.amount),
      'Status': e.status,
      'Recorded By': e.createdByName || 'System',
      'Fiscal Year': e.fiscalYear || 2026
    };
  });
  const wsExpenses = XLSX.utils.json_to_sheet(expenseRows);
  XLSX.utils.book_append_sheet(wb, wsExpenses, 'Expense_Ledger');

  // 3. Inventory Stock Count Sheet
  const invRows = data.inventory.map(inv => {
    const pl = data.priceList.find(p => p.invId === inv.id || p.name.toLowerCase() === inv.name.toLowerCase());
    const unitPrice = pl ? pl.price : 0;
    const valuation = inv.quantity * unitPrice;
    let status = 'In Stock';
    if (inv.quantity === 0) status = 'Out of Stock';
    else if (inv.quantity <= inv.minStock) status = 'Low Stock';

    return {
      'Item ID': inv.id,
      'Item Description': inv.name,
      'Unit': inv.unit,
      'Current Physical Count': inv.quantity,
      'Minimum Threshold': inv.minStock,
      'Stock Status': status,
      'Reference Unit Price (₱)': unitPrice,
      'Total Stock Value (₱)': valuation,
      'Storage Location': inv.location || 'Central Supply Room'
    };
  });
  const wsInv = XLSX.utils.json_to_sheet(invRows);
  XLSX.utils.book_append_sheet(wb, wsInv, 'Inventory_Stock_Count');

  // 4. Price Master List Sheet
  const priceRows = data.priceList.map(p => ({
    'Price ID': p.id,
    'Item Name': p.name,
    'Unit of Measure': p.unit,
    'Official Unit Price (₱)': p.price,
    'Classification': p.category || 'General Supplies',
    'Last Updated': p.updatedDate
  }));
  const wsPrice = XLSX.utils.json_to_sheet(priceRows);
  XLSX.utils.book_append_sheet(wb, wsPrice, 'Price_Master_List');

  // 5. Restocking Sheet
  const restockRows: any[] = [];
  data.restock.forEach(r => {
    r.items.forEach(it => {
      restockRows.push({
        'Restock ID': r.id,
        'Date Received': r.date,
        'Doc Type': r.docType,
        'Ref / Control No': r.refNum || '—',
        'Item Received': it.name,
        'Quantity': it.qty,
        'Unit Cost (₱)': it.unitCost,
        'Subtotal (₱)': it.total,
        'Receiving Officer': r.receivedBy || 'Supply Custodian',
        'Remarks': r.remarks || ''
      });
    });
  });
  const wsRestock = XLSX.utils.json_to_sheet(restockRows);
  XLSX.utils.book_append_sheet(wb, wsRestock, 'Restocking_Audit');

  // 6. Issuances Sheet
  const issuanceRows: any[] = [];
  data.issuances.forEach(iss => {
    iss.items.forEach(it => {
      issuanceRows.push({
        'Issuance ID': iss.id,
        'Date Released': iss.date,
        'Recipient / Requester': iss.requester,
        'Division / Unit': iss.division || 'OACSAS Unit',
        'Item Issued': it.name,
        'Quantity Released': it.qty,
        'Status': iss.status,
        'Issued By': iss.issuedBy || 'Supply Custodian',
        'Remarks': iss.remarks || ''
      });
    });
  });
  const wsIssuances = XLSX.utils.json_to_sheet(issuanceRows);
  XLSX.utils.book_append_sheet(wb, wsIssuances, 'Supply_Issuances');

  // 7. Procurement Requests Sheet
  const prRows: any[] = [];
  data.procurements.forEach(pr => {
    pr.items.forEach(it => {
      prRows.push({
        'PR Number': pr.id,
        'Date Generated': pr.date,
        'Urgency': pr.urgency,
        'Item Description': it.name,
        'Unit': it.unit,
        'Stock at Trigger': it.currentStock,
        'Min Threshold': it.minStock,
        'Reorder Quantity': it.requestedQty,
        'Estimated Unit Cost (₱)': it.estimatedUnitCost,
        'Estimated Subtotal (₱)': it.estimatedTotalCost,
        'PR Status': pr.status,
        'Requested By': pr.requestedBy,
        'Approved By': pr.approvedBy || 'Pending Approval',
        'PO Number': pr.poNumber || '—'
      });
    });
  });
  const wsPR = XLSX.utils.json_to_sheet(prRows);
  XLSX.utils.book_append_sheet(wb, wsPR, 'Procurement_Requests');

  // 8. Audit Trail Sheet
  const logRows = data.auditLogs.map(l => ({
    'Timestamp': l.timestamp,
    'User': l.userName,
    'Role': l.userRole,
    'Action': l.action,
    'Module': l.module,
    'Event Details': l.details
  }));
  const wsLogs = XLSX.utils.json_to_sheet(logRows);
  XLSX.utils.book_append_sheet(wb, wsLogs, 'System_Audit_Trail');

  // Write and trigger download
  const fy = data.fiscalYear || 2026;
  const fileName = `OACSAS_WFP_Supplies_Audit_Report_FY${fy}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

/**
 * Generates an official Government Audit PDF report with headers, metrics, and tables.
 */
export function exportAuditPDF(data: {
  reportType: 'comprehensive' | 'budget' | 'inventory' | 'expenses';
  budgetItems: BudgetItem[];
  expenses: ExpenseEntry[];
  inventory: InventoryItem[];
  priceList: PriceItem[];
  fiscalYear?: number;
  preparedBy?: string;
}) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const fy = data.fiscalYear || 2026;
  const now = new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });

  // Header Banner
  doc.setFillColor(15, 33, 64);
  doc.rect(0, 0, 210, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('REPUBLIC OF THE PHILIPPINES · CIVIL SERVICE COMMISSION', 105, 9, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('OFFICE OF THE ASSISTANT COMMISSIONER FOR SUPPORT AND ADMINISTRATIVE SERVICES', 105, 15, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(200, 220, 255);
  doc.text(`WORK AND FINANCIAL PLAN (WFP) & SUPPLIES AUDIT REPORT · FY ${fy}`, 105, 22, { align: 'center' });

  // Subheader
  let startY = 35;
  doc.setTextColor(40, 50, 70);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);

  let title = 'COMPREHENSIVE BUDGET & INVENTORY AUDIT REPORT';
  if (data.reportType === 'budget') title = 'WFP BUDGET ALLOCATION & UTILIZATION REPORT';
  if (data.reportType === 'inventory') title = 'OFFICE SUPPLIES PHYSICAL INVENTORY REPORT';
  if (data.reportType === 'expenses') title = 'FINANCIAL EXPENSE & OBLIGATION LEDGER';

  doc.text(title, 14, startY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 115, 130);
  doc.text(`Generated on: ${now} | Prepared by: ${data.preparedBy || 'OACSAS System'}`, 14, startY + 5);

  // Financial Summary Cards
  const totalBudget = data.budgetItems.reduce((s, it) => s + it.subs.reduce((sb, sub) => sb + sub.budget, 0), 0);
  const totalObligated = data.expenses.reduce((s, e) => s + Number(e.amount), 0);
  const totalBalance = totalBudget - totalObligated;
  const utilRate = totalBudget > 0 ? ((totalObligated / totalBudget) * 100).toFixed(2) + '%' : '0%';

  const lowStockCount = data.inventory.filter(i => i.quantity <= i.minStock).length;

  autoTable(doc, {
    startY: startY + 10,
    head: [['Approved Budget (FY 2026)', 'Total Obligated', 'Remaining Balance', 'Utilization Rate', 'Low Stock Alert']],
    body: [[formatPeso(totalBudget), formatPeso(totalObligated), formatPeso(totalBalance), utilRate, `${lowStockCount} Items`]],
    theme: 'plain',
    styles: {
      fontSize: 9,
      font: 'helvetica',
      textColor: [20, 30, 50],
      cellPadding: 3,
      halign: 'center'
    },
    headStyles: {
      fillColor: [240, 244, 250],
      textColor: [50, 70, 100],
      fontStyle: 'bold',
      lineColor: [210, 220, 235],
      lineWidth: 0.2
    },
    bodyStyles: {
      lineColor: [210, 220, 235],
      lineWidth: 0.2,
      fontStyle: 'bold'
    }
  });

  let currentY = (doc as any).lastAutoTable.finalY + 8;

  if (data.reportType === 'comprehensive' || data.reportType === 'budget') {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(15, 33, 64);
    doc.text('I. WFP Budget Allocations & Real-Time Expense Tracking', 14, currentY);

    const bRows: any[] = [];
    data.budgetItems.forEach(item => {
      const iSpent = data.expenses.filter(e => e.itemId === item.id).reduce((s, e) => s + Number(e.amount), 0);
      const iBudget = item.subs.reduce((s, sub) => s + sub.budget, 0);
      const iBal = iBudget - iSpent;
      const iRate = iBudget > 0 ? ((iSpent / iBudget) * 100).toFixed(1) + '%' : '0%';

      bRows.push([
        item.name,
        formatPeso(iBudget),
        formatPeso(iSpent),
        formatPeso(iBal),
        iRate
      ]);
    });

    autoTable(doc, {
      startY: currentY + 3,
      head: [['Budget Line Item', 'Allotment (₱)', 'Obligated (₱)', 'Balance (₱)', 'Util %']],
      body: bRows,
      theme: 'striped',
      headStyles: { fillColor: [15, 44, 89], textColor: [255, 255, 255], fontSize: 8.5 },
      styles: { fontSize: 8, cellPadding: 2.5 },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { halign: 'right' },
        2: { halign: 'right' },
        3: { halign: 'right' },
        4: { halign: 'center' }
      }
    });

    currentY = (doc as any).lastAutoTable.finalY + 8;
  }

  if (data.reportType === 'comprehensive' || data.reportType === 'inventory') {
    // If not enough room on page, add page
    if (currentY > 210) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(15, 33, 64);
    doc.text('II. Physical Inventory Count & Stock Valuation', 14, currentY);

    const invRows = data.inventory.map(i => {
      const pl = data.priceList.find(p => p.invId === i.id || p.name.toLowerCase() === i.name.toLowerCase());
      const price = pl ? pl.price : 0;
      const val = i.quantity * price;
      let status = 'In Stock';
      if (i.quantity === 0) status = 'Out of Stock';
      else if (i.quantity <= i.minStock) status = 'Low Stock';

      return [
        i.name,
        i.unit,
        i.quantity.toString(),
        i.minStock.toString(),
        formatPeso(price),
        formatPeso(val),
        status
      ];
    });

    autoTable(doc, {
      startY: currentY + 3,
      head: [['Item Description', 'Unit', 'Qty', 'Min', 'Unit Price', 'Total Value', 'Status']],
      body: invRows,
      theme: 'striped',
      headStyles: { fillColor: [15, 75, 89], textColor: [255, 255, 255], fontSize: 8 },
      styles: { fontSize: 7.5, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 65 },
        1: { halign: 'center' },
        2: { halign: 'center' },
        3: { halign: 'center' },
        4: { halign: 'right' },
        5: { halign: 'right' },
        6: { halign: 'center' }
      }
    });

    currentY = (doc as any).lastAutoTable.finalY + 8;
  }

  if (data.reportType === 'comprehensive' || data.reportType === 'expenses') {
    if (currentY > 200) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(15, 33, 64);
    doc.text('III. Recent Expense Transactions & Disbursements', 14, currentY);

    const expRows = data.expenses.slice(0, 15).map(e => [
      formatDate(e.date),
      e.ref || '—',
      e.desc,
      formatPeso(e.amount),
      e.status
    ]);

    autoTable(doc, {
      startY: currentY + 3,
      head: [['Date', 'OR/Ref', 'Particulars / Description', 'Amount (₱)', 'Status']],
      body: expRows,
      theme: 'striped',
      headStyles: { fillColor: [50, 40, 89], textColor: [255, 255, 255], fontSize: 8 },
      styles: { fontSize: 7.5, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 22 },
        1: { cellWidth: 25 },
        2: { cellWidth: 85 },
        3: { halign: 'right' },
        4: { halign: 'center' }
      }
    });

    currentY = (doc as any).lastAutoTable.finalY + 8;
  }

  // Signatory Block
  if (currentY > 240) {
    doc.addPage();
    currentY = 20;
  }

  currentY += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(40, 50, 70);

  // 3-column signature block
  const colWidth = 60;
  
  // Col 1: Prepared by
  doc.text('Prepared by:', 14, currentY);
  doc.setFont('helvetica', 'bold');
  doc.text(data.preparedBy || 'Jade Legaspi', 14, currentY + 12);
  doc.setFont('helvetica', 'normal');
  doc.text('Administrative Officer / Staff', 14, currentY + 16);

  // Col 2: Certified Correct
  doc.text('Certified Correct:', 14 + colWidth, currentY);
  doc.setFont('helvetica', 'bold');
  doc.text('Carlos Mendoza, CPA', 14 + colWidth, currentY + 12);
  doc.setFont('helvetica', 'normal');
  doc.text('Chief Budget & Financial Officer', 14 + colWidth, currentY + 16);

  // Col 3: Approved by
  doc.text('Approved by:', 14 + colWidth * 2, currentY);
  doc.setFont('helvetica', 'bold');
  doc.text('Jade Legaspi', 14 + colWidth * 2, currentY + 12);
  doc.setFont('helvetica', 'normal');
  doc.text('Assistant Commissioner, OACSAS', 14 + colWidth * 2, currentY + 16);

  // Add Page Numbers
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(140, 150, 160);
    doc.text(`OACSAS Internal Audit Document · Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
  }

  // Save PDF
  doc.save(`OACSAS_${data.reportType.toUpperCase()}_AUDIT_REPORT_FY${fy}.pdf`);
}

/**
 * Builds HTML for Appendix 63 Requisition and Issue Slip
 */
export function buildAppendix63HTML(d: RISData): string {
  const rows = [...d.items];
  while (rows.length < 18) {
    rows.push({ stockNo: '', unit: '', desc: '', qty: '' });
  }

  const itemRowsHTML = rows.map((it, idx) => `
    <tr style="height: 20pt; ${idx % 2 === 1 ? 'background-color: #fafbfc;' : ''}">
      <td style="border: 1px solid #333; padding: 2pt 4pt; font-size: 8.5pt; text-align: center;">${it.stockNo || ''}</td>
      <td style="border: 1px solid #333; padding: 2pt 4pt; font-size: 8.5pt; text-align: center;">${it.unit || ''}</td>
      <td style="border: 1px solid #333; padding: 2pt 6pt; font-size: 8.5pt;">${it.desc || ''}</td>
      <td style="border: 1px solid #333; padding: 2pt 4pt; font-size: 8.5pt; text-align: center; font-weight: bold;">${it.qty || ''}</td>
      <td style="border: 1px solid #333; padding: 2pt 4pt; font-size: 8.5pt; text-align: center;"></td>
      <td style="border: 1px solid #333; padding: 2pt 4pt; font-size: 8.5pt; text-align: center;"></td>
      <td style="border: 1px solid #333; padding: 2pt 4pt; font-size: 8.5pt; text-align: center;"></td>
      <td style="border: 1px solid #333; padding: 2pt 4pt; font-size: 8.5pt;"></td>
    </tr>`).join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>RIS ${d.risNo || 'Appendix 63'}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Times New Roman', Times, serif; font-size: 9.5pt; color: #111; background: #fff; padding: 20mm; }
    table { width: 100%; border-collapse: collapse; }
    @page { margin: 15mm; size: A4 portrait; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <div style="max-width: 760px; margin: 0 auto;">
    <div style="text-align: right; font-size: 8pt; margin-bottom: 2pt;">Appendix 63</div>
    <div style="text-align: center; font-size: 13pt; font-weight: bold; letter-spacing: 0.5px; margin-bottom: 8pt;">REQUISITION AND ISSUE SLIP</div>

    <table style="margin-bottom: 2pt;">
      <tr style="height: 18pt;">
        <td style="border: 1px solid #333; padding: 2pt 6pt; width: 55%;">Entity Name :&nbsp;<span style="border-bottom: 1px solid #333; display: inline-block; min-width: 180pt; font-weight: bold;">${d.entity || 'Civil Service Commission'}</span></td>
        <td style="border: 1px solid #333; padding: 2pt 6pt;">Fund Cluster :&nbsp;<span style="border-bottom: 1px solid #333; display: inline-block; min-width: 100pt;">${d.fund || '01 - Regular Agency Fund'}</span></td>
      </tr>
      <tr style="height: 18pt;">
        <td style="border: 1px solid #333; padding: 2pt 6pt;">Division :&nbsp;<span style="border-bottom: 1px solid #333; display: inline-block; min-width: 200pt;">${d.division || 'Support and Administrative Services'}</span></td>
        <td style="border: 1px solid #333; padding: 2pt 6pt;">Responsibility Center Code :&nbsp;<span style="border-bottom: 1px solid #333; display: inline-block; min-width: 70pt;">${d.respCode || '1-01-000'}</span></td>
      </tr>
      <tr style="height: 18pt;">
        <td style="border: 1px solid #333; padding: 2pt 6pt;">Office :&nbsp;<span style="border-bottom: 1px solid #333; display: inline-block; min-width: 208pt;">${d.office || 'Office of the Assistant Commissioner (OACSAS)'}</span></td>
        <td style="border: 1px solid #333; padding: 2pt 6pt;">RIS No. :&nbsp;<span style="border-bottom: 1px solid #333; display: inline-block; min-width: 100pt; font-weight: bold;">${d.risNo || ''}</span></td>
      </tr>
    </table>

    <table>
      <thead>
        <tr style="height: 19pt; background: #f0f0f0;">
          <th colspan="4" style="border: 1px solid #333; padding: 2pt; font-size: 8.5pt; text-align: center; font-weight: bold; width: 50%;">Requisition</th>
          <th colspan="2" style="border: 1px solid #333; padding: 2pt; font-size: 8.5pt; text-align: center; font-weight: bold; width: 20%;">Stock Available?</th>
          <th colspan="2" style="border: 1px solid #333; padding: 2pt; font-size: 8.5pt; text-align: center; font-weight: bold; width: 30%;">Issue</th>
        </tr>
        <tr style="height: 18pt; background: #f8f8f8;">
          <th style="border: 1px solid #333; padding: 2pt; font-size: 8pt; width: 10%; text-align: center;">Stock No.</th>
          <th style="border: 1px solid #333; padding: 2pt; font-size: 8pt; width: 7%; text-align: center;">Unit</th>
          <th style="border: 1px solid #333; padding: 2pt; font-size: 8pt; width: 23%; text-align: center;">Description</th>
          <th style="border: 1px solid #333; padding: 2pt; font-size: 8pt; width: 10%; text-align: center;">Quantity</th>
          <th style="border: 1px solid #333; padding: 2pt; font-size: 8pt; width: 10%; text-align: center;">Yes</th>
          <th style="border: 1px solid #333; padding: 2pt; font-size: 8pt; width: 10%; text-align: center;">No</th>
          <th style="border: 1px solid #333; padding: 2pt; font-size: 8pt; width: 10%; text-align: center;">Quantity</th>
          <th style="border: 1px solid #333; padding: 2pt; font-size: 8pt; width: 20%; text-align: center;">Remarks</th>
        </tr>
      </thead>
      <tbody>
        ${itemRowsHTML}
        <tr style="height: 24pt;">
          <td colspan="8" style="border: 1px solid #333; padding: 3pt 6pt; font-size: 8.5pt;">
            <strong>Purpose:</strong>&nbsp;&nbsp;${d.purpose || ''}
          </td>
        </tr>
      </tbody>
    </table>

    <table style="border: 1px solid #333; border-top: none;">
      <colgroup>
        <col style="width: 25%;">
        <col style="width: 25%;">
        <col style="width: 25%;">
        <col style="width: 25%;">
      </colgroup>
      <tr>
        <td style="border-right: 1px solid #333; vertical-align: top; padding: 4pt 6pt;">
          <div style="font-weight: bold; font-size: 8.5pt; margin-bottom: 6pt;">Requested by:</div>
          <div style="font-size: 8pt; color: #444; margin-bottom: 8pt;">Signature : ___________________</div>
          <div style="font-size: 8pt; margin-bottom: 4pt;">Printed Name : <strong>${d.reqName || ''}</strong></div>
          <div style="font-size: 8pt; margin-bottom: 4pt;">Designation : ${d.reqDesig || ''}</div>
          <div style="font-size: 8pt;">Date : ${d.reqDate || ''}</div>
        </td>
        <td style="border-right: 1px solid #333; vertical-align: top; padding: 4pt 6pt;">
          <div style="font-weight: bold; font-size: 8.5pt; margin-bottom: 6pt;">Approved by:</div>
          <div style="font-size: 8pt; color: #444; margin-bottom: 8pt;">Signature : ___________________</div>
          <div style="font-size: 8pt; margin-bottom: 4pt;">Printed Name : <strong>${d.apprName || ''}</strong></div>
          <div style="font-size: 8pt; margin-bottom: 4pt;">Designation : ${d.apprDesig || ''}</div>
          <div style="font-size: 8pt;">Date : ${d.apprDate || ''}</div>
        </td>
        <td style="border-right: 1px solid #333; vertical-align: top; padding: 4pt 6pt;">
          <div style="font-weight: bold; font-size: 8.5pt; margin-bottom: 6pt;">Issued by:</div>
          <div style="font-size: 8pt; color: #444; margin-bottom: 8pt;">Signature : ___________________</div>
          <div style="font-size: 8pt; margin-bottom: 4pt;">Printed Name : _________________</div>
          <div style="font-size: 8pt; margin-bottom: 4pt;">Designation : Property/Supply Officer</div>
          <div style="font-size: 8pt;">Date : ___________________</div>
        </td>
        <td style="vertical-align: top; padding: 4pt 6pt;">
          <div style="font-weight: bold; font-size: 8.5pt; margin-bottom: 6pt;">Received by:</div>
          <div style="font-size: 8pt; color: #444; margin-bottom: 8pt;">Signature : ___________________</div>
          <div style="font-size: 8pt; margin-bottom: 4pt;">Printed Name : _________________</div>
          <div style="font-size: 8pt; margin-bottom: 4pt;">Designation : ___________________</div>
          <div style="font-size: 8pt;">Date : ___________________</div>
        </td>
      </tr>
    </table>

    <div style="display: flex; justify-content: space-between; font-size: 7.5pt; color: #777; margin-top: 4pt;">
      <span>OACSAS Office Supplies Management System</span>
      <span>AO 6/15/02</span>
    </div>
  </div>
</body>
</html>`;
}
