// src/features/dashboard/dashboardPdf.js
// Dashboard summary PDF export
// ✅ FIXED: ৳ → "BDT " (ASCII-safe)

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { pdfCurrency } from '@/lib/pdfExport';
import { formatNumber } from '@/lib/utils';

export function exportDashboardPDF({ data, company = {}, filename = 'dashboard-summary' }) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // ===== HEADER =====
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  doc.text(company.name || 'PharmaFlow', 14, 20);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  let y = 26;
  if (company.address) { doc.text(company.address, 14, y); y += 4; }
  // eslint-disable-next-line no-useless-assignment
  if (company.phone) { doc.text(`Phone: ${company.phone}`, 14, y); y += 4; }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  doc.text('Dashboard Summary', pageWidth - 14, 20, { align: 'right' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(
    `Date: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`,
    pageWidth - 14,
    26,
    { align: 'right' }
  );

  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  doc.line(14, 32, pageWidth - 14, 32);

  // ===== KPI SUMMARY =====
  let currentY = 42;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  doc.text("Today's Overview", 14, currentY);
  currentY += 6;

  const kpis = [
    ["Today's Sales", pdfCurrency(data?.todaySales?.total || 0)],
    ["Today's Purchases", pdfCurrency(data?.todayPurchases?.total || 0)],
    ["Today's Profit", pdfCurrency(data?.todayProfit?.netProfit || 0)],
    ['Inventory Value', pdfCurrency(data?.inventoryValue?.costValue || 0)]
  ];

  autoTable(doc, {
    startY: currentY,
    body: kpis,
    theme: 'plain',
    styles: {
      fontSize: 10,
      cellPadding: 3,
      textColor: [50, 50, 50]
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 60 },
      1: { halign: 'right', cellWidth: 60 }
    },
    margin: { left: 14 }
  });

  currentY = doc.lastAutoTable.finalY + 8;

  // ===== ALERTS =====
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  doc.text('Alerts', 14, currentY);
  currentY += 6;

  const alerts = [
    ['Low Stock Items', formatNumber(data?.inventoryValue?.lowStockCount || 0)],
    ['Expiring Soon', formatNumber(data?.inventoryValue?.expiringSoonCount || 0)],
    ['Expired Batches', formatNumber(data?.inventoryValue?.expiredCount || 0)],
    ['Customer Due', pdfCurrency(data?.customerDue || 0)],
    ['Supplier Due', pdfCurrency(data?.supplierDue || 0)]
  ];

  autoTable(doc, {
    startY: currentY,
    head: [['Alert', 'Value']],
    body: alerts,
    theme: 'striped',
    headStyles: {
      fillColor: [245, 158, 11],
      textColor: 255,
      fontSize: 10,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 10,
      textColor: [50, 50, 50]
    },
    columnStyles: {
      1: { halign: 'right', fontStyle: 'bold' }
    },
    margin: { left: 14, right: 14 }
  });

  currentY = doc.lastAutoTable.finalY + 10;

  // ===== TOP SELLING MEDICINES =====
  const topMedicines = data?.topSellingMedicines || [];
  if (topMedicines.length > 0) {
    if (currentY > pageHeight - 80) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text('Top Selling Medicines', 14, currentY);
    currentY += 6;

    autoTable(doc, {
      startY: currentY,
      head: [['#', 'Medicine', 'Qty Sold', 'Sales']],
      body: topMedicines.slice(0, 10).map((m, i) => [
        i + 1,
        m.medicineName || '—',
        formatNumber(m.quantity || 0),
        pdfCurrency(m.total || 0)
      ]),
      theme: 'striped',
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontSize: 10,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [50, 50, 50]
      },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' },
        2: { halign: 'right' },
        3: { halign: 'right' }
      },
      margin: { left: 14, right: 14 }
    });

    currentY = doc.lastAutoTable.finalY + 10;
  }

  // ===== RECENT TRANSACTIONS =====
  const transactions = data?.recentTransactions || [];
  if (transactions.length > 0) {
    if (currentY > pageHeight - 80) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text('Recent Transactions', 14, currentY);
    currentY += 6;

    autoTable(doc, {
      startY: currentY,
      head: [['Invoice', 'Customer', 'Total', 'Status']],
      body: transactions.slice(0, 10).map((t) => [
        t.invoiceNumber || '—',
        t.customerName || 'Walk-in',
        pdfCurrency(t.total || 0),
        (t.paymentStatus || '').toUpperCase()
      ]),
      theme: 'striped',
      headStyles: {
        fillColor: [16, 185, 129],
        textColor: 255,
        fontSize: 10,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [50, 50, 50]
      },
      columnStyles: {
        2: { halign: 'right' }
      },
      margin: { left: 14, right: 14 }
    });
  }

  // ===== FOOTER =====
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth - 14,
      pageHeight - 10,
      { align: 'right' }
    );
    doc.text(
      'Generated by PharmaFlow',
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  doc.save(`${filename}-${Date.now()}.pdf`);
}