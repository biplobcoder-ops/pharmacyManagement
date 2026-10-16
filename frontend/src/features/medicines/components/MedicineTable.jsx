import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import DataTable from '@/components/common/DataTable';
import MedicineImage from './MedicineImage';
import MedicineStatusBadge from './MedicineStatusBadge';
import { formatNumber } from '@/lib/utils';

export default function MedicineTable({ data, isLoading, onEdit, onDelete }) {
  const columns = [
    {
      key: 'name',
      label: 'Medicine',
      render: (row) => (
        <div className="flex items-center gap-3">
          <MedicineImage medicine={row} size="sm" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate max-w-[200px]">
              {row.name}
            </p>
            <p className="text-[10px] text-muted-foreground font-mono truncate">
              {row.sku || row._id?.slice(-8).toUpperCase()}
            </p>
          </div>
        </div>
      )
    },
    {
      key: 'generic',
      label: 'Generic',
      render: (row) => (
        <span className="text-sm text-muted-foreground truncate max-w-[150px] inline-block">
          {row.generic?.name || '—'}
        </span>
      )
    },
    {
      key: 'brand',
      label: 'Brand',
      render: (row) => (
        <span className="text-sm text-muted-foreground truncate max-w-[150px] inline-block">
          {row.brand?.name || '—'}
        </span>
      )
    },
    {
      key: 'strength',
      label: 'Strength / Form',
      render: (row) => (
        <div>
          <p className="text-sm text-foreground">{row.strength}</p>
          <p className="text-[10px] text-muted-foreground capitalize">
            {row.dosageForm}
          </p>
        </div>
      )
    },
    {
      key: 'stock',
      label: 'Current Stock',
      align: 'right',
      render: (row) => {
        const stock = row.totalStock ?? 0;
        return (
          <span className="text-sm font-medium tabular-nums">
            {formatNumber(stock)} units
          </span>
        );
      }
    },
    {
      key: 'minStock',
      label: 'Min. Stock',
      align: 'right',
      render: (row) => (
        <span className="text-sm text-muted-foreground tabular-nums">
          {formatNumber(row.minStockLevel || 0)} units
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <MedicineStatusBadge
          stock={row.totalStock ?? 0}
          minStock={row.minStockLevel ?? 0}
          status={row.status}
        />
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
            <DropdownMenuItem onClick={() => onEdit(row)}>
              <Edit className="h-4 w-4" />
              Edit
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
      emptyTitle="No medicines found"
      emptyDescription="Try adjusting your filters or add a new medicine."
      minWidth="1000px"
    />
  );
}