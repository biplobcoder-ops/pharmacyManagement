// src/features/reports/components/SalesReportTab.jsx

import { useMemo } from 'react';
import { DollarSign, TrendingUp, Percent, ShoppingCart } from 'lucide-react';
import DataTable from '@/components/common/DataTable';
import ReportStats from './ReportStats';
import ReportChart from './ReportChart';
import { useGetSalesReportQuery } from '../reportsApi';
import { formatCurrency, formatNumber } from '@/lib/utils';

export default function SalesReportTab({ dateParams, groupBy }) {
  const { data: res, isLoading, isFetching } = useGetSalesReportQuery(
    { ...dateParams, groupBy },
    { refetchOnMountOrArgChange: true }
  );

  const chartData = res?.data?.data || [];
  const summary = res?.data?.summary || {};

  const stats = useMemo(() => [
    { label: 'Total Sales', value: summary.totalSales || 0, icon: DollarSign,
      color: 'text-success', bg: 'bg-success/10',
      subtitle: `${formatNumber(summary.totalOrders || 0)} orders` },
    { label: 'Total Profit', value: summary.totalProfit || 0, icon: TrendingUp,
      color: 'text-accent', bg: 'bg-accent/10', subtitle: 'Gross profit' },
    { label: 'Total Discount', value: summary.totalDiscount || 0, icon: Percent,
      color: 'text-warning', bg: 'bg-warning/10', subtitle: 'Given discount' },
    { label: 'Total Orders', value: summary.totalOrders || 0, icon: ShoppingCart,
      color: 'text-blue-500', bg: 'bg-blue-500/10', isNumber: true,
      subtitle: 'Completed sales' }
  ], [summary]);

  const chartSeries = [
    { key: 'sales', name: 'Sales', color: 'hsl(var(--accent))' },
    { key: 'profit', name: 'Profit', color: 'hsl(142 71% 45%)' }
  ];

  const columns = [
    { key: 'period', label: 'Period',
      render: (row) => <span className="text-sm font-medium text-foreground">{row._id}</span> },
    { key: 'sales', label: 'Sales', align: 'right',
      render: (row) => <span className="text-sm tabular-nums font-medium">{formatCurrency(row.sales || 0)}</span> },
    { key: 'cost', label: 'Cost', align: 'right',
      render: (row) => <span className="text-sm tabular-nums text-muted-foreground">{formatCurrency(row.cost || 0)}</span> },
    { key: 'profit', label: 'Profit', align: 'right',
      render: (row) => <span className="text-sm tabular-nums font-medium text-success">{formatCurrency(row.profit || 0)}</span> },
    { key: 'discount', label: 'Discount', align: 'right',
      render: (row) => <span className="text-sm tabular-nums text-warning">{formatCurrency(row.discount || 0)}</span> },
    { key: 'count', label: 'Orders', align: 'right',
      render: (row) => <span className="text-sm tabular-nums">{formatNumber(row.count || 0)}</span> }
  ];

  return (
    <div className="space-y-6">
      <ReportStats items={stats} isLoading={isLoading} cols={4} />

      <ReportChart
        title="Sales trend"
        description={`Grouped by ${groupBy}`}
        data={chartData}
        type="line"
        xKey="_id"
        series={chartSeries}
        isLoading={isLoading}
      />

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Detailed breakdown</h3>
        </div>
        <DataTable
          columns={columns}
          data={chartData}
          isLoading={isLoading || isFetching}
          emptyTitle="No sales in this period"
          emptyDescription="Try adjusting the date range."
          minWidth="800px"
        />
      </div>
    </div>
  );
}