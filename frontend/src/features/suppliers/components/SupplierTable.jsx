import { MoreHorizontal, Eye, Edit, Trash2, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import DataTable from '@/components/common/DataTable';
import { formatCurrency } from '@/lib/utils';

export default function SupplierTable({
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
      label: 'Supplier',
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
            {row.company && (
              <p className="text-[10px] text-muted-foreground truncate max-w-[180px]">
                {row.company}
              </p>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'contact',
      label: 'Contact',
      render: (row) => (
        <div className="min-w-0">
          <p className="text-sm text-foreground">{row.phone || '—'}</p>
          {row.email && (
            <p className="text-[10px] text-muted-foreground truncate max-w-[180px]">
              {row.email}
            </p>
          )}
        </div>
      )
    },
    {
      key: 'contactPerson',
      label: 'Contact Person',
      render: (row) => (
        <span className="text-sm text-muted-foreground">
          {row.contactPerson || '—'}
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
      label: 'Payable',
      align: 'right',
      render: (row) => {
        const due = row.dueBalance || 0;

        // ✅ Positive due → we owe supplier (warning)
        // ✅ Negative due → supplier owes us (advance, success)
        // ✅ Zero → settled (muted)
        if (due > 0) {
          return (
            <span className="text-sm font-semibold tabular-nums text-warning">
              {formatCurrency(due)}
            </span>
          );
        }

        if (due < 0) {
          return (
            <span className="text-sm font-semibold tabular-nums text-success">
              {formatCurrency(Math.abs(due))}
              <span className="ml-1 text-[10px] font-normal opacity-70">
                (advance)
              </span>
            </span>
          );
        }

        return (
          <span className="text-sm tabular-nums text-muted-foreground">
            {formatCurrency(0)}
          </span>
        );
      }
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
                <DropdownMenuItem onClick={() => onPay(row)} className="text-success">
                  <DollarSign className="h-4 w-4" />
                  Make payment
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
      emptyTitle="No suppliers found"
      emptyDescription="Try adjusting your filters or add a new supplier."
      minWidth="1100px"
    />
  );
}