// src/features/reports/components/InventoryReportTab.jsx

import { useMemo } from 'react';
import { Package, AlertTriangle, Clock, XCircle } from 'lucide-react';
import DataTable from '@/components/common/DataTable';
import ReportStats from './ReportStats';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGetInventoryReportQuery } from '../reportsApi';
import {formatNumber, formatDate } from '@/lib/utils';

export default function InventoryReportTab() {
  const { data: res, isLoading, isFetching } = useGetInventoryReportQuery(
    undefined,
    { refetchOnMountOrArgChange: true }
  );

  const report = res?.data || {};
  const stockValue = report.stockValue || {};
  const lowStock = report.lowStock || [];
  const expiringSoon = report.expiringSoon || [];
  const expired = report.expired || [];

  const stats = useMemo(() => [
    { label: 'Stock Value (Cost)', value: stockValue.costValue || 0, icon: Package,
      color: 'text-accent', bg: 'bg-accent/10',
      subtitle: `${formatNumber(stockValue.totalUnits || 0)} units` },
    { label: 'Stock Value (Selling)', value: stockValue.sellingValue || 0, icon: Package,
      color: 'text-success', bg: 'bg-success/10',
      subtitle: `${formatNumber(stockValue.batchCount || 0)} batches` },
    { label: 'Low Stock Items', value: lowStock.length, icon: AlertTriangle,
      color: 'text-warning', bg: 'bg-warning/10', isNumber: true,
      subtitle: 'Below minimum level' },
    { label: 'Expiring Soon', value: expiringSoon.length, icon: Clock,
      color: 'text-orange-500', bg: 'bg-orange-500/10', isNumber: true,
      subtitle: 'Within 30 days' }
  ], [stockValue, lowStock, expiringSoon]);

  const lowStockColumns = [
    { key: 'name', label: 'Medicine',
      render: (row) => (
        <div>
          <p className="text-sm font-medium text-foreground">{row.medicine?.name || '—'}</p>
          <p className="text-[10px] text-muted-foreground">{row.medicine?.strength || ''}</p>
        </div>
      ) },
    { key: 'totalQty', label: 'In Stock', align: 'right',
      render: (row) => <span className="text-sm tabular-nums text-warning font-medium">{formatNumber(row.totalQty || 0)}</span> },
    { key: 'minLevel', label: 'Min Level', align: 'right',
      render: (row) => <span className="text-sm tabular-nums text-muted-foreground">{formatNumber(row.medicine?.minStockLevel || 0)}</span> }
  ];

  const expiryColumns = [
    { key: 'medicine', label: 'Medicine',
      render: (row) => (
        <div>
          <p className="text-sm font-medium text-foreground">{row.medicine?.name || '—'}</p>
          <p className="text-[10px] text-muted-foreground">{row.medicine?.strength || ''}</p>
        </div>
      ) },
    { key: 'batchNumber', label: 'Batch',
      render: (row) => <span className="text-xs font-mono text-muted-foreground">{row.batchNumber}</span> },
    { key: 'quantity', label: 'Qty', align: 'right',
      render: (row) => <span className="text-sm tabular-nums">{formatNumber(row.quantity || 0)}</span> },
    { key: 'expiryDate', label: 'Expiry', align: 'right',
      render: (row) => <span className="text-sm tabular-nums text-warning">{formatDate(row.expiryDate)}</span> }
  ];

  const expiredColumns = [
    { key: 'medicine', label: 'Medicine',
      render: (row) => (
        <div>
          <p className="text-sm font-medium text-foreground">{row.medicine?.name || '—'}</p>
          <p className="text-[10px] text-muted-foreground">{row.medicine?.strength || ''}</p>
        </div>
      ) },
    { key: 'batchNumber', label: 'Batch',
      render: (row) => <span className="text-xs font-mono text-muted-foreground">{row.batchNumber}</span> },
    { key: 'quantity', label: 'Qty', align: 'right',
      render: (row) => <span className="text-sm tabular-nums text-destructive font-medium">{formatNumber(row.quantity || 0)}</span> },
    { key: 'expiryDate', label: 'Expired', align: 'right',
      render: (row) => <span className="text-sm tabular-nums text-destructive">{formatDate(row.expiryDate)}</span> }
  ];

  return (
    <div className="space-y-6">
      <ReportStats items={stats} isLoading={isLoading} cols={4} />

      {/* Low Stock */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <CardTitle className="text-base">Low stock items</CardTitle>
            <Badge variant="warning" className="ml-auto">{lowStock.length}</Badge>
          </div>
        </CardHeader>
        <div className="border-t border-border">
          <DataTable
            columns={lowStockColumns} data={lowStock}
            isLoading={isLoading || isFetching}
            emptyTitle="All good!"
            emptyDescription="No items below minimum stock level."
            minWidth="600px"
          />
        </div>
      </Card>

      {/* Expiring Soon */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-orange-500" />
            <CardTitle className="text-base">Expiring soon (30 days)</CardTitle>
            <Badge variant="warning" className="ml-auto">{expiringSoon.length}</Badge>
          </div>
        </CardHeader>
        <div className="border-t border-border">
          <DataTable
            columns={expiryColumns} data={expiringSoon}
            isLoading={isLoading || isFetching}
            emptyTitle="No expiring batches"
            emptyDescription="No batches expiring within 30 days."
            minWidth="600px"
          />
        </div>
      </Card>

      {/* Expired */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-destructive" />
            <CardTitle className="text-base">Expired batches</CardTitle>
            <Badge variant="destructive" className="ml-auto">{expired.length}</Badge>
          </div>
        </CardHeader>
        <div className="border-t border-border">
          <DataTable
            columns={expiredColumns} data={expired}
            isLoading={isLoading || isFetching}
            emptyTitle="No expired batches"
            emptyDescription="All batches are within expiry."
            minWidth="600px"
          />
        </div>
      </Card>
    </div>
  );
}