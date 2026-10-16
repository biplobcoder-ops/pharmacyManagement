// src/lib/pdfExport.js
// PDF export utility — jsPDF + autotable
// ✅ FIXED: ৳ (Bengali Taka) → "BDT " (ASCII-safe)

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ✅ NEW: PDF-safe currency formatter
// jsPDF er default font (Helvetica) Bengali ৳ support kore na
// Tai "BDT " prefix use korchi
const pdfCurrency = (amount) => {
  if (amount === null || amount === undefined) return 'BDT 0';
  const num = Number(amount);
  if (isNaN(num)) return 'BDT 0';
  return `BDT ${num.toLocaleString('en-IN', {
    maximumFractionDigits: 2
  })}`;
};

/**
 * Generic PDF export
 */
export function exportToPDF({
  title = 'Report',
  subtitle = '',
  columns = [],
  data = [],
  company = {},
  meta = {},
  filename = 'report'
}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // ===== HEADER =====
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  doc.text(company.name || 'PharmaFlow', 14, 18);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);

  let companyY = 24;
  if (company.address) {
    doc.text(company.address, 14, companyY);
    companyY += 4;
  }
  if (company.phone) {
    doc.text(`Phone: ${company.phone}`, 14, companyY);
    companyY += 4;
  }
  if (company.email) {
    doc.text(`Email: ${company.email}`, 14, companyY);
    // eslint-disable-next-line no-useless-assignment
    companyY += 4;
  }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  doc.text(title, pageWidth - 14, 18, { align: 'right' });

  if (subtitle) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(subtitle, pageWidth - 14, 24, { align: 'right' });
  }

  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(
    `Generated: ${new Date().toLocaleString('en-GB')}`,
    pageWidth - 14,
    30,
    { align: 'right' }
  );

  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  doc.line(14, 34, pageWidth - 14, 34);

  // ===== META INFO =====
  let startY = 40;

  if (meta && Object.keys(meta).length > 0) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(80, 80, 80);
    doc.text('Report Details:', 14, startY);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);

    let metaY = startY + 5;
    Object.entries(meta).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        doc.text(`${key}: ${value}`, 14, metaY);
        metaY += 4;
      }
    });

    startY = metaY + 2;
  }

  // ===== TABLE =====
  const tableColumns = columns.map((c) => ({
    header: c.header,
    dataKey: c.key
  }));

  const tableRows = data.map((row) => {
    const obj = {};
    columns.forEach((c) => {
      const value = c.value ? c.value(row) : row[c.key];
      obj[c.key] = value ?? '';
    });
    return obj;
  });

  autoTable(doc, {
    startY: startY,
    head: [tableColumns.map((c) => c.header)],
    body: tableRows.map((row) => tableColumns.map((c) => row[c.dataKey])),
    theme: 'striped',
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'left'
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [50, 50, 50]
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    styles: {
      cellPadding: 2,
      overflow: 'linebreak',
      lineColor: [230, 230, 230],
      lineWidth: 0.1
    },
    margin: { left: 14, right: 14 },
    didDrawPage: (data) => {
      const pageCount = doc.internal.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Page ${data.pageNumber} of ${pageCount}`,
        pageWidth - 14,
        pageHeight - 10,
        { align: 'right' }
      );
      doc.text(
        company.name || 'PharmaFlow',
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }
  });

  doc.save(`${filename}-${Date.now()}.pdf`);
}

/**
 * Export multiple tables in one PDF
 */
export function exportMultiTablePDF({
  title = 'Report',
  subtitle = '',
  sections = [],
  company = {},
  filename = 'report'
}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  doc.text(company.name || 'PharmaFlow', 14, 18);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  let companyY = 24;
  if (company.address) {
    doc.text(company.address, 14, companyY);
    companyY += 4;
  }
  if (company.phone) {
    doc.text(`Phone: ${company.phone}`, 14, companyY);
    // eslint-disable-next-line no-useless-assignment
    companyY += 4;
  }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  doc.text(title, pageWidth - 14, 18, { align: 'right' });

  if (subtitle) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(subtitle, pageWidth - 14, 24, { align: 'right' });
  }

  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(
    `Generated: ${new Date().toLocaleString('en-GB')}`,
    pageWidth - 14,
    30,
    { align: 'right' }
  );

  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  doc.line(14, 34, pageWidth - 14, 34);

  let currentY = 42;

  sections.forEach((section) => {
    // Check if new page needed
    if (currentY > pageHeight - 40) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text(section.title, 14, currentY);
    currentY += 6;

    const tableColumns = section.columns.map((c) => c.header);
    const tableRows = section.data.map((row) =>
      section.columns.map((c) => {
        const value = c.value ? c.value(row) : row[c.key];
        return value ?? '';
      })
    );

    autoTable(doc, {
      startY: currentY,
      head: [tableColumns],
      body: tableRows,
      theme: 'striped',
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontSize: 9,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [50, 50, 50]
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      styles: {
        cellPadding: 2,
        overflow: 'linebreak',
        lineColor: [230, 230, 230],
        lineWidth: 0.1
      },
      margin: { left: 14, right: 14 }
    });

    currentY = doc.lastAutoTable.finalY + 10;
  });

  const pageCount = doc.internal.getNumberOfPages();
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(
    `Page ${pageCount}`,
    pageWidth - 14,
    pageHeight - 10,
    { align: 'right' }
  );

  doc.save(`${filename}-${Date.now()}.pdf`);
}

/**
 * Simple invoice PDF (for Sales/Purchases)
 * ✅ FIXED: ৳ → BDT
 */
export function exportInvoicePDF({
  title = 'Invoice',
  invoice = {},
  items = [],
  company = {},
  customer = {},
  filename = 'invoice'
}) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  doc.text(company.name || 'PharmaFlow', 14, 20);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  let y = 26;
  if (company.address) { doc.text(company.address, 14, y); y += 5; }
  if (company.phone) { doc.text(`Phone: ${company.phone}`, 14, y); y += 5; }
  // eslint-disable-next-line no-useless-assignment
  if (company.email) { doc.text(company.email, 14, y); y += 5; }

  // Invoice title (right)
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(59, 130, 246);
  doc.text(title.toUpperCase(), pageWidth - 14, 20, { align: 'right' });

  // Invoice details
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`#${invoice.number || ''}`, pageWidth - 14, 28, { align: 'right' });
  doc.text(`Date: ${invoice.date || ''}`, pageWidth - 14, 34, { align: 'right' });
  doc.text(`Status: ${invoice.status || ''}`, pageWidth - 14, 40, { align: 'right' });

  // Bill To
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  doc.text('Bill To:', 14, 50);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  let customerY = 56;
  if (customer.name) { doc.text(customer.name, 14, customerY); customerY += 5; }
  if (customer.phone) { doc.text(customer.phone, 14, customerY); customerY += 5; }
  if (customer.email) { doc.text(customer.email, 14, customerY); customerY += 5; }
  if (customer.address) { doc.text(customer.address, 14, customerY); }

  // Table
  autoTable(doc, {
    startY: 75,
    head: [['#', 'Item', 'Qty', 'Price', 'Total']],
    body: items.map((item, i) => [
      i + 1,
      item.name || '',
      item.quantity || '',
      pdfCurrency(item.price || 0),
      pdfCurrency(item.total || 0)
    ]),
    theme: 'grid',
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontSize: 10,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 9
    },
    columnStyles: {
      2: { halign: 'center' },
      3: { halign: 'right' },
      4: { halign: 'right' }
    },
    margin: { left: 14, right: 14 }
  });

  // Totals
  const finalY = doc.lastAutoTable.finalY + 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);

  const rightX = pageWidth - 14;
  const labelX = pageWidth - 60;

  doc.text('Subtotal:', labelX, finalY);
  doc.text(pdfCurrency(invoice.subtotal || 0), rightX, finalY, { align: 'right' });

  doc.text('Discount:', labelX, finalY + 6);
  doc.text(`- ${pdfCurrency(invoice.discount || 0)}`, rightX, finalY + 6, { align: 'right' });

  doc.text('Tax:', labelX, finalY + 12);
  doc.text(pdfCurrency(invoice.tax || 0), rightX, finalY + 12, { align: 'right' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  doc.text('Total:', labelX, finalY + 20);
  doc.text(pdfCurrency(invoice.total || 0), rightX, finalY + 20, { align: 'right' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text('Paid:', labelX, finalY + 28);
  doc.text(pdfCurrency(invoice.paid || 0), rightX, finalY + 28, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(invoice.due > 0 ? 220 : 80, invoice.due > 0 ? 38 : 80, invoice.due > 0 ? 38 : 80);
  doc.text('Due:', labelX, finalY + 34);
  doc.text(pdfCurrency(invoice.due || 0), rightX, finalY + 34, { align: 'right' });

  // Footer
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(150, 150, 150);
  doc.text(
    'Thank you for your business!',
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 15,
    { align: 'center' }
  );

  doc.save(`${filename}-${Date.now()}.pdf`);
}

// ✅ Export pdfCurrency for use in other files
export { pdfCurrency };