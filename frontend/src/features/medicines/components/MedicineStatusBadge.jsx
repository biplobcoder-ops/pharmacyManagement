import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function MedicineStatusBadge({ stock, minStock, status }) {
  // status: active / inactive
  // stock + minStock: for stock status

  if (status === 'inactive') {
    return (
      <Badge variant="secondary" className="gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
        Inactive
      </Badge>
    );
  }

  // Determine stock status
  let stockStatus = 'in_stock';
  if (stock === 0) stockStatus = 'out_of_stock';
  else if (stock < minStock) stockStatus = 'low_stock';

  const config = {
    in_stock: {
      label: 'In stock',
      className: 'bg-success/10 text-success border-transparent'
    },
    low_stock: {
      label: 'Low stock',
      className: 'bg-warning/10 text-warning border-transparent'
    },
    out_of_stock: {
      label: 'Out of stock',
      className: 'bg-destructive/10 text-destructive border-transparent'
    }
  };

  const { label, className } = config[stockStatus];

  return (
    <Badge className={cn('gap-1.5', className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </Badge>
  );
}