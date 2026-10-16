// src/features/reports/components/PurchaseReportTab.jsx

import { useMemo } from 'react';
import { ShoppingBag, DollarSign, AlertCircle, CheckCircle2 } from 'lucide-react';
import DataTable from '@/components/common/DataTable';
import ReportStats from './ReportStats';
import ReportChart from './ReportChart';
import { useGetPurchaseReportQuery } from '../reportsApi';
import { formatCurrency, formatNumber } from '@/lib/utils';

export default function PurchaseReportTab({ dateParams, groupBy }) {
  const { data: res, isLoading, isFetching } = useGetPurchaseReportQuery(
    { ...dateParams, groupBy },
    { refetchOnMountOrArgChange: true }
  );

  const chartData = res?.data?.data || [];
  const summary = res?.data?.summary || {};

  const stats = useMemo(() => [
    { label: 'Total Purchases', value: summary.totalPurchases || 0, icon: ShoppingBag,
      color: 'text-accent', bg: 'bg-accent/10',
      subtitle: `${formatNumber(summary.totalOrders || 0)} orders` },
    { label: 'Total Paid', value: summary.totalPaid || 0, icon: CheckCircle2,
      color: 'text-success', bg: 'bg-success/10', subtitle: 'Settled amount' },
    { label: 'Total Due', value: summary.totalDue || 0, icon: AlertCircle,
      color: 'text-warning', bg: 'bg-warning/10', subtitle: 'Outstanding payable' },
    { label: 'Orders', value: summary.totalOrders || 0, icon: DollarSign,
      color: 'text-blue-500', bg: 'bg-blue-500/10', isNumber: true, subtitle: 'Purchase count' }
  ], [summary]);

  const chartSeries = [
    { key: 'purchases', name: 'Purchases', color: 'hsl(var(--accent))' },
    { key: 'paid', name: 'Paid', color: 'hsl(142 71% 45%)' },
    { key: 'due', name: 'Due', color: 'hsl(38 92% 50%)', dashed: true }
  ];

  const columns = [
    { key: 'period', label: 'Period',
      render: (row) => <span className="text-sm font-medium text-foreground">{row._id}</span> },
    { key: 'purchases', label: 'Purchases', align: 'right',
      render: (row) => <span className="text-sm tabular-nums font-medium">{formatCurrency(row.purchases || 0)}</span> },
    { key: 'paid', label: 'Paid', align: 'right',
      render: (row) => <span className="text-sm tabular-nums text-success font-medium">{formatCurrency(row.paid || 0)}</span> },
    { key: 'due', label: 'Due', align: 'right',
      render: (row) => <span className="text-sm tabular-nums text-warning font-medium">{formatCurrency(row.due || 0)}</span> },
    { key: 'count', label: 'Orders', align: 'right',
      render: (row) => <span className="text-sm tabular-nums">{formatNumber(row.count || 0)}</span> }
  ];

  return (
    <div className="space-y-6">
      <ReportStats items={stats} isLoading={isLoading} cols={4} />

      <ReportChart
        title="Purchase trend"
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
          columns={columns} data={chartData}
          isLoading={isLoading || isFetching}
          emptyTitle="No purchases in this period"
          emptyDescription="Try adjusting the date range."
          minWidth="800px"
        />
      </div>
    </div>
  );
}