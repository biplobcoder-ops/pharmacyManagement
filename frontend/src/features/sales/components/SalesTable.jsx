import { MoreHorizontal, Eye, XCircle, Printer, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import DataTable from '@/components/common/DataTable';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { PAYMENT_STATUS } from '../salesTypes';

export default function SalesTable({
  data,
  isLoading,
  onView,
  onCancel,
  onReturn,
  onPrint
}) {
  const columns = [
    {
      key: 'invoiceNumber',
      label: 'Invoice',
      render: (row) => (
        <span className="text-sm font-semibold text-foreground">
          {row.invoiceNumber}
        </span>
      )
    },
    {
      key: 'customer',
      label: 'Customer',
      render: (row) => (
        <div className="min-w-0">
          <p className="text-sm text-foreground truncate max-w-[180px]">
            {row.customerName || 'Walk-in'}
          </p>
          {row.customerPhone && (
            <p className="text-[10px] text-muted-foreground">
              {row.customerPhone}
            </p>
          )}
        </div>
      )
    },
    {
      key: 'items',
      label: 'Items',
      align: 'center',
      render: (row) => (
        <span className="text-sm text-muted-foreground tabular-nums">
          {row.items?.length || 0}
        </span>
      )
    },
    {
      key: 'total',
      label: 'Total',
      align: 'right',
      render: (row) => (
        <span className="text-sm font-semibold text-foreground tabular-nums">
          {formatCurrency(row.total)}
        </span>
      )
    },
    {
      key: 'paidAmount',
      label: 'Paid',
      align: 'right',
      render: (row) => (
        <span className="text-sm text-success tabular-nums">
          {formatCurrency(row.paidAmount || 0)}
        </span>
      )
    },
    {
      key: 'dueAmount',
      label: 'Due',
      align: 'right',
      render: (row) => (
        <span
          className={
            row.dueAmount > 0
              ? 'text-sm font-medium text-warning tabular-nums'
              : 'text-sm text-muted-foreground tabular-nums'
          }
        >
          {formatCurrency(row.dueAmount || 0)}
        </span>
      )
    },
    {
      key: 'paymentStatus',
      label: 'Status',
      render: (row) => {
        const config = PAYMENT_STATUS[row.paymentStatus] || {
          label: row.paymentStatus,
          variant: 'secondary'
        };
        return (
          <Badge variant={config.variant} className="gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {config.label}
          </Badge>
        );
      }
    },
    {
      key: 'saleDate',
      label: 'Date & Time',
      render: (row) => (
        <span className="text-xs text-muted-foreground tabular-nums">
          {formatDateTime(row.saleDate || row.createdAt)}
        </span>
      )
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView(row)}>
              <Eye className="h-4 w-4" />
              View details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onPrint(row)}>
              <Printer className="h-4 w-4" />
              Print invoice
            </DropdownMenuItem>

            {/* ✅ NEW — Return items */}
            {row.status !== 'cancelled' && row.items?.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onReturn(row)}
                  className="text-accent"
                >
                  <RotateCcw className="h-4 w-4" />
                  Return items
                </DropdownMenuItem>
              </>
            )}

            {/* Cancel sale */}
            {row.status !== 'cancelled' && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onCancel(row)}
                  className="text-destructive"
                >
                  <XCircle className="h-4 w-4" />
                  Cancel sale
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      emptyTitle="No sales found"
      emptyDescription="Try adjusting the date range or filters."
      minWidth="1200px"
    />
  );
}