import { MoreHorizontal, Eye, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import DataTable from '@/components/common/DataTable';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function PaymentsTable({ data, isLoading, onView, onDelete }) {
  const columns = [
    {
      key: 'paymentNumber',
      label: 'Reference',
      render: (row) => (
        <span className="text-sm font-mono font-medium text-foreground">
          {row.paymentNumber}
        </span>
      )
    },
    {
      key: 'type',
      label: 'Type',
      render: (row) => (
        <Badge
          variant={row.type === 'customer' ? 'success' : 'warning'}
          className="gap-1.5"
        >
          {row.type === 'customer' ? 'Customer Payment' : 'Supplier Payment'}
        </Badge>
      )
    },
    {
      key: 'party',
      label: 'Party',
      render: (row) => (
        <span className="text-sm text-foreground truncate max-w-[180px] inline-block">
          {row.type === 'customer'
            ? row.customer?.name || 'Walk-in'
            : row.supplier?.name || '—'}
        </span>
      )
    },
    {
      key: 'method',
      label: 'Method',
      render: (row) => (
        <span className="text-sm capitalize text-muted-foreground">
          {row.method}
        </span>
      )
    },
    {
      key: 'date',
      label: 'Date',
      render: (row) => (
        <span className="text-xs text-muted-foreground tabular-nums">
          {formatDate(row.date)}
        </span>
      )
    },
    {
      key: 'amount',
      label: 'Amount',
      align: 'right',
      render: (row) => (
        <span className="text-sm font-semibold text-foreground tabular-nums">
          {formatCurrency(row.amount)}
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
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(row)}
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </DropdownMenuItem>
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
      emptyTitle="No payments found"
      emptyDescription="Payments will appear here as they are recorded."
      minWidth="1000px"
    />
  );
}