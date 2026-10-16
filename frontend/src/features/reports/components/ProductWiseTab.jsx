// src/features/reports/components/ProductWiseTab.jsx

import { useMemo } from 'react';
import { Package, TrendingUp, DollarSign, Hash } from 'lucide-react';
import DataTable from '@/components/common/DataTable';
import ReportStats from './ReportStats';
import { useGetSalesByProductQuery } from '../reportsApi';
import { formatCurrency, formatNumber } from '@/lib/utils';

export default function ProductWiseTab({ dateParams }) {
  const { data: res, isLoading, isFetching } = useGetSalesByProductQuery(
    { ...dateParams, limit: 50 },
    { refetchOnMountOrArgChange: true }
  );

  const products = res?.data?.data || [];

  const summary = useMemo(() => ({
    totalSales: products.reduce((s, p) => s + (p.totalSales || 0), 0),
    totalQty: products.reduce((s, p) => s + (p.totalQuantity || 0), 0),
    totalProfit: products.reduce((s, p) => s + (p.totalProfit || 0), 0),
    count: products.length
  }), [products]);

  const stats = [
    { label: 'Total Sales', value: summary.totalSales, icon: DollarSign,
      color: 'text-success', bg: 'bg-success/10', subtitle: `${summary.count} products` },
    { label: 'Total Quantity', value: summary.totalQty, icon: Hash,
      color: 'text-blue-500', bg: 'bg-blue-500/10', isNumber: true, subtitle: 'Units sold' },
    { label: 'Total Profit', value: summary.totalProfit, icon: TrendingUp,
      color: 'text-accent', bg: 'bg-accent/10', subtitle: 'Gross profit' }
  ];

  const columns = [
    { key: 'rank', label: '#', width: '50px',
      render: (row) => {
        const idx = products.findIndex((p) => p._id === row._id);
        return <span className="text-xs font-mono text-muted-foreground">{String(idx + 1).padStart(2, '0')}</span>;
      } },
    { key: 'medicineName', label: 'Medicine',
      render: (row) => (
        <div className="flex items-center gap-3">
          {row.medicineImage?.url ? (
            <img src={row.medicineImage.url} alt={row.medicineName} className="h-9 w-9 rounded-lg object-cover" />
          ) : (
            <div className="h-9 w-9 rounded-lg bg-accent/10 flex items-center justify-center">
              <Package className="h-4 w-4 text-accent" />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate max-w-[200px]">{row.medicineName}</p>
            {row.strength && <p className="text-[10px] text-muted-foreground">{row.strength}</p>}
          </div>
        </div>
      ) },
    { key: 'totalQuantity', label: 'Qty Sold', align: 'right',
      render: (row) => <span className="text-sm tabular-nums font-medium">{formatNumber(row.totalQuantity || 0)}</span> },
    { key: 'totalSales', label: 'Sales', align: 'right',
      render: (row) => <span className="text-sm tabular-nums font-medium">{formatCurrency(row.totalSales || 0)}</span> },
    { key: 'totalProfit', label: 'Profit', align: 'right',
      render: (row) => <span className="text-sm tabular-nums text-success font-medium">{formatCurrency(row.totalProfit || 0)}</span> }
  ];

  return (
    <div className="space-y-6">
      <ReportStats items={stats} isLoading={isLoading} cols={3} />

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Top selling medicines</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Ranked by total sales value</p>
        </div>
        <DataTable
          columns={columns} data={products}
          isLoading={isLoading || isFetching}
          emptyTitle="No products sold"
          emptyDescription="Try adjusting the date range."
          minWidth="800px"
        />
      </div>
    </div>
  );
}