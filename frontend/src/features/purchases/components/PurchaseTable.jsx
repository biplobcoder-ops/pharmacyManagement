import { MoreHorizontal, Eye, XCircle, Trash2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import DataTable from '@/components/common/DataTable';
import { formatCurrency, formatDate } from '@/lib/utils';
import { PAYMENT_STATUS } from '../purchaseTypes';

export default function PurchaseTable({
  data,
  isLoading,
  onView,
  onCancel,
  onDelete,
  onReturn
}) {
  const columns = [
    {
      key: 'invoiceNumber',
      label: 'Purchase',
      render: (row) => (
        <span className="text-sm font-medium text-foreground">
          {row.invoiceNumber}
        </span>
      )
    },
    {
      key: 'supplier',
      label: 'Supplier',
      render: (row) => (
        <div className="min-w-0">
          <p className="text-sm text-foreground truncate max-w-[150px]">
            {row.supplier?.name || '—'}
          </p>
          {row.supplier?.company && (
            <p className="text-[10px] text-muted-foreground truncate max-w-[150px]">
              {row.supplier.company}
            </p>
          )}
        </div>
      )
    },
    {
      key: 'purchaseDate',
      label: 'Date',
      render: (row) => (
        <span className="text-sm text-muted-foreground tabular-nums">
          {formatDate(row.purchaseDate)}
        </span>
      )
    },
    {
      key: 'items',
      label: 'Items',
      align: 'right',
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

            {/* ✅ NEW — Return to supplier */}
            {row.status !== 'cancelled' && row.items?.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onReturn(row)}
                  className="text-orange-500"
                >
                  <RotateCcw className="h-4 w-4" />
                  Return to supplier
                </DropdownMenuItem>
              </>
            )}

            {row.status !== 'cancelled' && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onCancel(row)}
                  className="text-warning"
                >
                  <XCircle className="h-4 w-4" />
                  Cancel purchase
                </DropdownMenuItem>
              </>
            )}

            {row.status === 'cancelled' && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(row)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
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
      emptyTitle="No purchases found"
      emptyDescription="Create your first purchase order to get started."
      minWidth="1100px"
    />
  );
}