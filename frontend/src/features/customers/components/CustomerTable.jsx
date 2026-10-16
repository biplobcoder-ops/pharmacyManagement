import { MoreHorizontal, Eye, Edit, Trash2, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import DataTable from '@/components/common/DataTable';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function CustomerTable({
  data,
  isLoading,
  onView,
  onEdit,
  onDelete,
  onPay
}) {
  const columns = [
    {
      key: 'name',
      label: 'Customer',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-accent">
              {row.name?.charAt(0)?.toUpperCase() || '?'}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate max-w-[180px]">
              {row.name}
            </p>
            {row.email && (
              <p className="text-[10px] text-muted-foreground truncate max-w-[180px]">
                {row.email}
              </p>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (row) => (
        <span className="text-sm text-muted-foreground">
          {row.phone || '—'}
        </span>
      )
    },
    {
      key: 'totalPurchase',
      label: 'Total Purchases',
      align: 'right',
      render: (row) => (
        <span className="text-sm font-medium tabular-nums text-foreground">
          {formatCurrency(row.totalPurchase || 0)}
        </span>
      )
    },
    {
      key: 'totalPaid',
      label: 'Paid',
      align: 'right',
      render: (row) => (
        <span className="text-sm tabular-nums text-success">
          {formatCurrency(row.totalPaid || 0)}
        </span>
      )
    },
    {
      key: 'dueBalance',
      label: 'Due',
      align: 'right',
      render: (row) => (
        <span
          className={
            row.dueBalance > 0
              ? 'text-sm font-semibold tabular-nums text-warning'
              : 'text-sm tabular-nums text-muted-foreground'
          }
        >
          {formatCurrency(row.dueBalance || 0)}
        </span>
      )
    },
    {
      key: 'lastPurchase',
      label: 'Last Purchase',
      render: (row) =>
        row.lastPurchase ? (
          <span className="text-xs text-muted-foreground tabular-nums">
            {formatDate(row.lastPurchase)}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <Badge
          variant={row.status === 'active' ? 'success' : 'secondary'}
          className="gap-1.5"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {row.status === 'active' ? 'Active' : 'Inactive'}
        </Badge>
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
            <DropdownMenuItem onClick={() => onEdit(row)}>
              <Edit className="h-4 w-4" />
              Edit
            </DropdownMenuItem>
            {row.dueBalance > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onPay(row)}
                  className="text-success"
                >
                  <DollarSign className="h-4 w-4" />
                  Receive payment
                </DropdownMenuItem>
              </>
            )}
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
      emptyTitle="No customers found"
      emptyDescription="Try adjusting your filters or add a new customer."
      minWidth="1100px"
    />
  );
}