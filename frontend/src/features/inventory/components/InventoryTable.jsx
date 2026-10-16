import { MoreHorizontal, Edit, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import DataTable from '@/components/common/DataTable';
import MedicineImage from '@/features/medicines/components/MedicineImage';
import { formatCurrency, formatDate, formatNumber, formatDateTime } from '@/lib/utils';
import { cn } from '@/lib/utils';

const STOCK_STATUS_MAP = {
  PURCHASE: { label: 'Purchase', className: 'bg-success/10 text-success border-transparent' },
  SALE: { label: 'Sale', className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-transparent' },
  SALE_RETURN: { label: 'Sale Return', className: 'bg-warning/10 text-warning border-transparent' },
  PURCHASE_RETURN: { label: 'Purchase Return', className: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-transparent' },
  DAMAGE: { label: 'Damage', className: 'bg-destructive/10 text-destructive border-transparent' },
  EXPIRED: { label: 'Expired', className: 'bg-destructive/10 text-destructive border-transparent' },
  ADJUSTMENT: { label: 'Adjustment', className: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-transparent' },
  TRANSFER_IN: { label: 'Transfer In', className: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-transparent' },
  TRANSFER_OUT: { label: 'Transfer Out', className: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-transparent' }
};

export default function InventoryTable({ data, isLoading, onEdit, onDelete, viewMode = 'stock' }) {
  const isMovementView = viewMode === 'movements';

  // ===== MOVEMENT LEDGER =====
  if (isMovementView) {
    const movementColumns = [
      {
        key: 'medicine',
        label: 'Medicine',
        render: (row) => {
          const med = row.medicine || {};
          return (
            <div className="flex items-center gap-3">
              <MedicineImage medicine={med} size="sm" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate max-w-[180px]">
                  {med.name || '—'}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {med.strength} · {med.dosageForm}
                </p>
              </div>
            </div>
          );
        }
      },
      {
        key: 'type',
        label: 'Movement type',
        render: (row) => {
          const config = STOCK_STATUS_MAP[row.type] || {
            label: row.type,
            className: 'bg-muted text-muted-foreground border-transparent'
          };
          return (
            <Badge className={cn('gap-1.5', config.className)}>
              {config.label}
            </Badge>
          );
        }
      },
      {
        key: 'batch',
        label: 'Batch',
        render: (row) => (
          <span className="text-xs font-mono text-foreground bg-muted px-2 py-1 rounded">
            {row.batch?.batchNumber || '—'}
          </span>
        )
      },
      {
        key: 'quantity',
        label: 'Quantity change',
        align: 'right',
        render: (row) => {
          const isPositive = row.quantity > 0;
          return (
            <div className="flex items-center justify-end gap-1.5">
              {isPositive ? (
                <ArrowUp className="h-3.5 w-3.5 text-success" />
              ) : (
                <ArrowDown className="h-3.5 w-3.5 text-destructive" />
              )}
              <span
                className={cn(
                  'text-sm font-medium tabular-nums',
                  isPositive ? 'text-success' : 'text-destructive'
                )}
              >
                {isPositive ? '+' : ''}{row.quantity}
              </span>
            </div>
          );
        }
      },
      {
        key: 'stock',
        label: 'Stock (before → after)',
        align: 'right',
        render: (row) => (
          <span className="text-xs tabular-nums text-muted-foreground">
            {formatNumber(row.previousQuantity)} → {formatNumber(row.newQuantity)}
          </span>
        )
      },
      {
        key: 'reference',
        label: 'Reference',
        render: (row) => (
          <span className="text-xs text-muted-foreground capitalize">
            {row.referenceType || '—'}
          </span>
        )
      },
      {
        key: 'createdBy',
        label: 'By',
        render: (row) => (
          <span className="text-xs text-muted-foreground truncate max-w-[100px] inline-block">
            {row.createdBy?.name || '—'}
          </span>
        )
      },
      {
        key: 'date',
        label: 'Date & time',
        render: (row) => (
          <span className="text-xs text-muted-foreground tabular-nums">
            {formatDateTime(row.createdAt)}
          </span>
        )
      }
    ];

    return (
      <DataTable
        columns={movementColumns}
        data={data}
        isLoading={isLoading}
        emptyTitle="No movements found"
        emptyDescription="Stock movements will appear here as transactions occur."
        minWidth="1100px"
      />
    );
  }

  // ===== STOCK / BATCH VIEW =====
  const columns = [
    {
      key: 'medicine',
      label: 'Medicine',
      render: (row) => {
        const med = row.medicine || {};
        return (
          <div className="flex items-center gap-3">
            <MedicineImage medicine={med} size="sm" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate max-w-[180px]">
                {med.name || '—'}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                {med.strength} · {med.dosageForm}
              </p>
            </div>
          </div>
        );
      }
    },
    {
      key: 'batchNumber',
      label: 'Batch number',
      render: (row) => (
        <span className="text-xs font-mono text-foreground bg-muted px-2 py-1 rounded">
          {row.batchNumber || '—'}
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
      key: 'pricing',
      label: 'Purchase / Sale',
      render: (row) => (
        <span className="text-sm tabular-nums">
          <span className="text-muted-foreground">
            {formatCurrency(row.purchasePrice, '৳')}
          </span>
          <span className="mx-1 text-muted-foreground">/</span>
          <span className="text-foreground">
            {formatCurrency(row.sellingPrice, '৳')}
          </span>
        </span>
      )
    },
    {
      key: 'quantity',
      label: 'Quantity',
      align: 'right',
      render: (row) => (
        <span className="text-sm font-medium tabular-nums">
          {formatNumber(row.quantity || 0)} units
        </span>
      )
    },
    {
      key: 'expiryDate',
      label: 'Expiry date',
      render: (row) => {
        const expiry = new Date(row.expiryDate);
        const now = new Date();
        const daysLeft = Math.floor((expiry - now) / (1000 * 60 * 60 * 24));

        let colorClass = 'text-foreground';
        if (daysLeft < 0) colorClass = 'text-destructive font-medium';
        else if (daysLeft <= 30) colorClass = 'text-warning font-medium';

        return (
          <span className={cn('text-sm tabular-nums', colorClass)}>
            {formatDate(row.expiryDate)}
          </span>
        );
      }
    },
    {
      key: 'status',
      label: 'Stock status',
      render: (row) => {
        const expiry = new Date(row.expiryDate);
        const now = new Date();
        const daysLeft = Math.floor((expiry - now) / (1000 * 60 * 60 * 24));

        let label = 'Active';
        let className = 'bg-success/10 text-success border-transparent';

        if (daysLeft < 0) {
          label = 'Expired';
          className = 'bg-destructive/10 text-destructive border-transparent';
        } else if (daysLeft <= 30) {
          label = 'Expiring soon';
          className = 'bg-warning/10 text-warning border-transparent';
        } else if (row.quantity === 0) {
          label = 'Out of stock';
          className = 'bg-muted text-muted-foreground border-transparent';
        }

        return (
          <Badge className={cn('gap-1.5', className)}>
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {label}
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
            <DropdownMenuItem onClick={() => onEdit(row)}>
              <Edit className="h-4 w-4" />
              Adjust stock
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(row)}
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              Delete batch
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
      emptyTitle="No batches found"
      emptyDescription="Try adjusting your filters or add a purchase."
      minWidth="1100px"
    />
  );
}