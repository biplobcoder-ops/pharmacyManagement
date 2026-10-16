// src/features/reports/components/CategoryWiseTab.jsx

import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Layers, DollarSign, TrendingUp } from 'lucide-react';
import DataTable from '@/components/common/DataTable';
import ReportStats from './ReportStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetSalesByCategoryQuery } from '../reportsApi';
import { formatCurrency, formatNumber } from '@/lib/utils';

const COLORS = [
  'hsl(217 91% 60%)', 'hsl(142 71% 45%)', 'hsl(38 92% 50%)',
  'hsl(0 84% 60%)', 'hsl(280 65% 60%)', 'hsl(160 84% 39%)',
  'hsl(330 81% 60%)', 'hsl(190 90% 50%)'
];

export default function CategoryWiseTab({ dateParams }) {
  const { data: res, isLoading, isFetching } = useGetSalesByCategoryQuery(
    dateParams,
    { refetchOnMountOrArgChange: true }
  );

  const categories = res?.data?.data || [];
  const totalSales = res?.data?.totalSales || 0;

  const summary = useMemo(() => ({
    totalSales,
    totalProfit: categories.reduce((s, c) => s + (c.totalProfit || 0), 0),
    totalQty: categories.reduce((s, c) => s + (c.totalQuantity || 0), 0),
    count: categories.length
  }), [categories, totalSales]);

  const stats = [
    { label: 'Total Sales', value: summary.totalSales, icon: DollarSign,
      color: 'text-success', bg: 'bg-success/10', subtitle: `${summary.count} categories` },
    { label: 'Total Profit', value: summary.totalProfit, icon: TrendingUp,
      color: 'text-accent', bg: 'bg-accent/10', subtitle: 'Gross profit' },
    { label: 'Total Quantity', value: summary.totalQty, icon: Layers,
      color: 'text-blue-500', bg: 'bg-blue-500/10', isNumber: true, subtitle: 'Units sold' }
  ];

  const pieData = categories.slice(0, 8).map((c) => ({
    name: c.categoryName || 'Unknown',
    value: c.totalSales || 0
  }));

  const columns = [
    { key: 'categoryName', label: 'Category',
      render: (row) => <span className="text-sm font-medium text-foreground">{row.categoryName || '—'}</span> },
    { key: 'totalQuantity', label: 'Qty Sold', align: 'right',
      render: (row) => <span className="text-sm tabular-nums">{formatNumber(row.totalQuantity || 0)}</span> },
    { key: 'totalSales', label: 'Sales', align: 'right',
      render: (row) => <span className="text-sm tabular-nums font-medium">{formatCurrency(row.totalSales || 0)}</span> },
    { key: 'totalProfit', label: 'Profit', align: 'right',
      render: (row) => <span className="text-sm tabular-nums text-success font-medium">{formatCurrency(row.totalProfit || 0)}</span> },
    { key: 'percentage', label: 'Share', align: 'right',
      render: (row) => <span className="text-sm tabular-nums text-accent font-semibold">{row.percentage || 0}%</span> }
  ];

  return (
    <div className="space-y-6">
      <ReportStats items={stats} isLoading={isLoading} cols={3} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Sales distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-72 bg-muted/40 rounded-lg animate-pulse" />
            ) : pieData.length === 0 ? (
              <div className="h-72 flex items-center justify-center text-sm text-muted-foreground">
                No data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px', fontSize: '12px'
                    }}
                    formatter={(value) => formatCurrency(value)}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} iconType="circle" iconSize={8} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Top categories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {categories.slice(0, 6).map((c, i) => (
              <div key={c._id || i}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-foreground truncate max-w-[180px]">{c.categoryName}</span>
                  <span className="text-xs tabular-nums text-muted-foreground">{formatCurrency(c.totalSales || 0)}</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${c.percentage || 0}%`, backgroundColor: COLORS[i % COLORS.length] }}
                  />
                </div>
              </div>
            ))}
            {categories.length === 0 && !isLoading && (
              <p className="text-sm text-muted-foreground text-center py-8">No category data</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">All categories</h3>
        </div>
        <DataTable
          columns={columns} data={categories}
          isLoading={isLoading || isFetching}
          emptyTitle="No category sales"
          minWidth="700px"
        />
      </div>
    </div>
  );
}