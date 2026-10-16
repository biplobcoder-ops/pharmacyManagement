import { useMemo, useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  startOfDay, endOfDay, subDays,
  startOfMonth, endOfMonth, subMonths,
  startOfYear, endOfYear
} from 'date-fns';

import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

import ReportsTabs from '../components/ReportsTabs';
import ReportFilters from '../components/ReportFilters';
import SalesReportTab from '../components/SalesReportTab';
import ProductWiseTab from '../components/ProductWiseTab';
import CategoryWiseTab from '../components/CategoryWiseTab';
import UserWiseTab from '../components/UserWiseTab';
import PurchaseReportTab from '../components/PurchaseReportTab';
import InventoryReportTab from '../components/InventoryReportTab';

import { exportToPDF, exportMultiTablePDF, pdfCurrency } from '@/lib/pdfExport';
import { formatNumber } from '@/lib/utils';

export default function ReportsPage() {
  const [tab, setTab] = useState('sales');
  const [datePreset, setDatePreset] = useState('last30days');
  const [groupBy, setGroupBy] = useState('day');
  const [isExporting, setIsExporting] = useState(false);

  // Date range
  const dateParams = useMemo(() => {
    const today = new Date();
    let start, end;

    switch (datePreset) {
      case 'today':
        start = startOfDay(today); end = endOfDay(today); break;
      case 'yesterday': {
        const y = subDays(today, 1);
        start = startOfDay(y); end = endOfDay(y); break;
      }
      case 'last7days':
        start = startOfDay(subDays(today, 6)); end = endOfDay(today); break;
      case 'last30days':
        start = startOfDay(subDays(today, 29)); end = endOfDay(today); break;
      case 'thisMonth':
        start = startOfMonth(today); end = endOfMonth(today); break;
      case 'lastMonth': {
        const lm = subMonths(today, 1);
        start = startOfMonth(lm); end = endOfMonth(lm); break;
      }
      case 'thisYear':
        start = startOfYear(today); end = endOfYear(today); break;
      default:
        start = startOfDay(subDays(today, 29)); end = endOfDay(today);
    }

    return { startDate: start.toISOString(), endDate: end.toISOString() };
  }, [datePreset]);

  // Export handler
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const company = {
        name: 'PharmaFlow Pharmacy',
        address: 'Dhanmondi, Dhaka, Bangladesh',
        phone: '+8801700000000',
        email: 'info@pharmaflow.com'
      };

      const presetLabel = datePreset
        .replace('last', 'Last ')
        .replace('this', 'This ')
        .replace(/(\d+)(days|Month|Year)/, '$1 $2');

      if (tab === 'sales') {
        const { data } = await fetchDataForExport('sales');
        exportToPDF({
          title: 'Sales Report',
          subtitle: `Period: ${presetLabel} • Grouped: ${groupBy}`,
          company,
          columns: [
            { header: 'Period', key: 'period' },
            { header: 'Sales', key: 'sales' },
            { header: 'Cost', key: 'cost' },
            { header: 'Profit', key: 'profit' },
            { header: 'Discount', key: 'discount' },
            { header: 'Orders', key: 'count' }
          ],
          data: data.map((d) => ({
            period: d._id || '—',
            sales: pdfCurrency(d.sales || 0),
            cost: pdfCurrency(d.cost || 0),
            profit: pdfCurrency(d.profit || 0),
            discount: pdfCurrency(d.discount || 0),
            count: d.count || 0
          })),
          filename: 'sales-report'
        });
      } else if (tab === 'products') {
        const { data } = await fetchDataForExport('products');
        exportToPDF({
          title: 'Product-wise Sales Report',
          subtitle: `Period: ${presetLabel}`,
          company,
          columns: [
            { header: 'Medicine', key: 'medicine' },
            { header: 'Strength', key: 'strength' },
            { header: 'Qty Sold', key: 'qty' },
            { header: 'Sales', key: 'sales' },
            { header: 'Profit', key: 'profit' }
          ],
          data: data.map((d, i) => ({
            medicine: `${i + 1}. ${d.medicineName || '—'}`,
            strength: d.strength || '—',
            qty: formatNumber(d.totalQuantity || 0),
            sales: pdfCurrency(d.totalSales || 0),
            profit: pdfCurrency(d.totalProfit || 0)
          })),
          filename: 'products-report'
        });
      } else if (tab === 'categories') {
        const { data } = await fetchDataForExport('categories');
        exportToPDF({
          title: 'Category-wise Sales Report',
          subtitle: `Period: ${presetLabel}`,
          company,
          columns: [
            { header: 'Category', key: 'name' },
            { header: 'Qty Sold', key: 'qty' },
            { header: 'Sales', key: 'sales' },
            { header: 'Profit', key: 'profit' },
            { header: 'Share', key: 'percent' }
          ],
          data: data.map((d) => ({
            name: d.categoryName || '—',
            qty: formatNumber(d.totalQuantity || 0),
            sales: pdfCurrency(d.totalSales || 0),
            profit: pdfCurrency(d.totalProfit || 0),
            percent: `${d.percentage || 0}%`
          })),
          filename: 'categories-report'
        });
      } else if (tab === 'users') {
        const { data } = await fetchDataForExport('users');
        exportToPDF({
          title: 'User-wise Sales Report',
          subtitle: `Period: ${presetLabel}`,
          company,
          columns: [
            { header: 'Cashier', key: 'name' },
            { header: 'Email', key: 'email' },
            { header: 'Orders', key: 'orders' },
            { header: 'Sales', key: 'sales' },
            { header: 'Profit', key: 'profit' }
          ],
          data: data.map((d) => ({
            name: d.userName || '—',
            email: d.userEmail || '—',
            orders: formatNumber(d.count || 0),
            sales: pdfCurrency(d.totalSales || 0),
            profit: pdfCurrency(d.totalProfit || 0)
          })),
          filename: 'users-report'
        });
      } else if (tab === 'purchases') {
        const { data } = await fetchDataForExport('purchases');
        exportToPDF({
          title: 'Purchase Report',
          subtitle: `Period: ${presetLabel} • Grouped: ${groupBy}`,
          company,
          columns: [
            { header: 'Period', key: 'period' },
            { header: 'Purchases', key: 'purchases' },
            { header: 'Paid', key: 'paid' },
            { header: 'Due', key: 'due' },
            { header: 'Orders', key: 'count' }
          ],
          data: data.map((d) => ({
            period: d._id || '—',
            purchases: pdfCurrency(d.purchases || 0),
            paid: pdfCurrency(d.paid || 0),
            due: pdfCurrency(d.due || 0),
            count: d.count || 0
          })),
          filename: 'purchases-report'
        });
      } else if (tab === 'inventory') {
        const { report } = await fetchDataForExport('inventory');
        const sections = [];

        if (report.lowStock?.length > 0) {
          sections.push({
            title: 'Low Stock Items',
            columns: [
              { header: 'Medicine', key: 'name' },
              { header: 'Strength', key: 'strength' },
              { header: 'In Stock', key: 'stock' },
              { header: 'Min Level', key: 'min' }
            ],
            data: report.lowStock.map((r) => ({
              name: r.medicine?.name || '—',
              strength: r.medicine?.strength || '—',
              stock: r.totalQty || 0,
              min: r.medicine?.minStockLevel || 0
            }))
          });
        }

        if (report.expiringSoon?.length > 0) {
          sections.push({
            title: 'Expiring Soon (30 days)',
            columns: [
              { header: 'Medicine', key: 'name' },
              { header: 'Batch', key: 'batch' },
              { header: 'Quantity', key: 'qty' },
              { header: 'Expiry Date', key: 'expiry' }
            ],
            data: report.expiringSoon.map((r) => ({
              name: r.medicine?.name || '—',
              batch: r.batchNumber || '—',
              qty: r.quantity || 0,
              expiry: new Date(r.expiryDate).toLocaleDateString('en-GB')
            }))
          });
        }

        if (report.expired?.length > 0) {
          sections.push({
            title: 'Expired Batches',
            columns: [
              { header: 'Medicine', key: 'name' },
              { header: 'Batch', key: 'batch' },
              { header: 'Quantity', key: 'qty' },
              { header: 'Expiry Date', key: 'expiry' }
            ],
            data: report.expired.map((r) => ({
              name: r.medicine?.name || '—',
              batch: r.batchNumber || '—',
              qty: r.quantity || 0,
              expiry: new Date(r.expiryDate).toLocaleDateString('en-GB')
            }))
          });
        }

        exportMultiTablePDF({
          title: 'Inventory Report',
          subtitle: `Generated: ${new Date().toLocaleString()}`,
          company,
          sections,
          filename: 'inventory-report'
        });
      }

      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export PDF');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Reports"
        subtitle="Analyze sales, purchases, inventory and business performance."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="hidden sm:inline">Exporting...</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export PDF</span>
              </>
            )}
          </Button>
        }
      />

      <div className="space-y-6">
        <ReportsTabs value={tab} onChange={setTab} />

        <Card className="p-4">
          <ReportFilters
            tab={tab}
            datePreset={datePreset}
            onDatePresetChange={setDatePreset}
            groupBy={groupBy}
            onGroupByChange={setGroupBy}
          />
        </Card>

        <div>
          {tab === 'sales' && <SalesReportTab dateParams={dateParams} groupBy={groupBy} />}
          {tab === 'products' && <ProductWiseTab dateParams={dateParams} />}
          {tab === 'categories' && <CategoryWiseTab dateParams={dateParams} />}
          {tab === 'users' && <UserWiseTab dateParams={dateParams} />}
          {tab === 'purchases' && <PurchaseReportTab dateParams={dateParams} groupBy={groupBy} />}
          {tab === 'inventory' && <InventoryReportTab />}
        </div>
      </div>
    </>
  );
}

// ✅ API fetch helper
async function fetchDataForExport(type) {
  const token = localStorage.getItem('accessToken');
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const endpoints = {
    sales: '/reports/sales',
    products: '/reports/sales/product-wise',
    categories: '/reports/sales/category-wise',
    users: '/reports/sales/user-wise',
    purchases: '/reports/purchases',
    inventory: '/reports/inventory'
  };

  const res = await fetch(`${baseUrl}${endpoints[type]}?limit=500`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) throw new Error('Fetch failed');

  const json = await res.json();

  if (type === 'inventory') {
    return { report: json.data };
  }

  return { data: json.data?.data || [] };
}