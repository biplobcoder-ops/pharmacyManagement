// src/features/reports/components/UserWiseTab.jsx

import { useMemo } from 'react';
import { DollarSign, TrendingUp, Users } from 'lucide-react';
import DataTable from '@/components/common/DataTable';
import ReportStats from './ReportStats';
import { useGetSalesByUserQuery } from '../reportsApi';
import { formatCurrency, formatNumber, getInitials } from '@/lib/utils';

export default function UserWiseTab({ dateParams }) {
  const { data: res, isLoading, isFetching } = useGetSalesByUserQuery(
    dateParams,
    { refetchOnMountOrArgChange: true }
  );

  const users = res?.data?.data || [];

  const summary = useMemo(() => ({
    totalSales: users.reduce((s, u) => s + (u.totalSales || 0), 0),
    totalProfit: users.reduce((s, u) => s + (u.totalProfit || 0), 0),
    totalOrders: users.reduce((s, u) => s + (u.count || 0), 0),
    count: users.length
  }), [users]);

  const stats = [
    { label: 'Total Sales', value: summary.totalSales, icon: DollarSign,
      color: 'text-success', bg: 'bg-success/10', subtitle: `${summary.count} cashiers` },
    { label: 'Total Profit', value: summary.totalProfit, icon: TrendingUp,
      color: 'text-accent', bg: 'bg-accent/10', subtitle: 'Gross profit' },
    { label: 'Total Orders', value: summary.totalOrders, icon: Users,
      color: 'text-blue-500', bg: 'bg-blue-500/10', isNumber: true, subtitle: 'Completed sales' }
  ];

  const columns = [
    { key: 'userName', label: 'Cashier',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-accent">{getInitials(row.userName)}</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate max-w-[180px]">{row.userName}</p>
            <p className="text-[10px] text-muted-foreground truncate max-w-[180px]">{row.userEmail}</p>
          </div>
        </div>
      ) },
    { key: 'count', label: 'Orders', align: 'right',
      render: (row) => <span className="text-sm tabular-nums">{formatNumber(row.count || 0)}</span> },
    { key: 'totalSales', label: 'Sales', align: 'right',
      render: (row) => <span className="text-sm tabular-nums font-medium">{formatCurrency(row.totalSales || 0)}</span> },
    { key: 'totalProfit', label: 'Profit', align: 'right',
      render: (row) => <span className="text-sm tabular-nums text-success font-medium">{formatCurrency(row.totalProfit || 0)}</span> },
    { key: 'avgOrderValue', label: 'Avg Order', align: 'right',
      render: (row) => {
        const avg = row.count > 0 ? (row.totalSales || 0) / row.count : 0;
        return <span className="text-sm tabular-nums text-muted-foreground">{formatCurrency(avg)}</span>;
      } }
  ];

  return (
    <div className="space-y-6">
      <ReportStats items={stats} isLoading={isLoading} cols={3} />

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Sales by cashier</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Performance breakdown per user</p>
        </div>
        <DataTable
          columns={columns} data={users}
          isLoading={isLoading || isFetching}
          emptyTitle="No user sales"
          emptyDescription="Try adjusting the date range."
          minWidth="700px"
        />
      </div>
    </div>
  );
}