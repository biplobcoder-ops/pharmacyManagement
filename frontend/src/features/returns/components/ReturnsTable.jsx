import { MoreHorizontal, Eye, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import DataTable from '@/components/common/DataTable';
import { formatCurrency, formatDate } from '@/lib/utils';
import { RETURN_STATUS } from '../returnsTypes';

export default function ReturnsTable({
  data,
  isLoading,
  type = 'sales',
  onView,
  onCancel
}) {
  const columns = [
    {
      key: 'returnNumber',
      label: 'Return',
      render: (row) => (
        <span className="text-sm font-semibold text-foreground">
          {row.returnNumber}
        </span>
      )
    },
    {
      key: 'type',
      label: 'Type',
      render: () => (
        <Badge
          variant={type === 'sales' ? 'success' : 'warning'}
          className="gap-1.5"
        >
          {type === 'sales' ? 'Sale Return' : 'Purchase Return'}
        </Badge>
      )
    },
    {
      key: 'original',
      label: 'Original',
      render: (row) => (
        <span className="text-sm font-mono text-muted-foreground">
          {type === 'sales'
            ? row.sale?.invoiceNumber || '—'
            : row.purchase?.invoiceNumber || '—'}
        </span>
      )
    },
    {
      key: 'party',
      label: type === 'sales' ? 'Customer' : 'Supplier',
      render: (row) => (
        <span className="text-sm text-foreground truncate max-w-[180px] inline-block">
          {type === 'sales'
            ? row.customer?.name || 'Walk-in'
            : row.supplier?.name || '—'}
        </span>
      )
    },
    {
      key: 'date',
      label: 'Date',
      render: (row) => (
        <span className="text-xs text-muted-foreground tabular-nums">
          {formatDate(row.returnDate)}
        </span>
      )
    },
    {
      key: 'amount',
      label: 'Amount',
      align: 'right',
      render: (row) => (
        <span className="text-sm font-semibold text-foreground tabular-nums">
          {formatCurrency(row.total || 0)}
        </span>
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
      key: 'status',
      label: 'Status',
      render: (row) => {
        const config = RETURN_STATUS[row.status] || {
          label: row.status,
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
            {row.status !== 'cancelled' && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onCancel(row)}
                  className="text-destructive"
                >
                  <XCircle className="h-4 w-4" />
                  Cancel return
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
      emptyTitle={`No ${type === 'sales' ? 'sales' : 'purchase'} returns found`}
      emptyDescription="Try adjusting the date range or filters."
      minWidth="1100px"
    />
  );
}