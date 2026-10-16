import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const STATUS_MAP = {
  // Payment
  paid: { label: 'Paid', variant: 'success' },
  partial: { label: 'Partial', variant: 'warning' },
  due: { label: 'Due', variant: 'destructive' },
  // General
  active: { label: 'Active', variant: 'success' },
  inactive: { label: 'Inactive', variant: 'secondary' },
  suspended: { label: 'Suspended', variant: 'destructive' },
  // Stock
  in_stock: { label: 'In stock', variant: 'success' },
  low_stock: { label: 'Low stock', variant: 'warning' },
  out_of_stock: { label: 'Out of stock', variant: 'destructive' },
  expiring_soon: { label: 'Expiring soon', variant: 'warning' },
  expired: { label: 'Expired', variant: 'destructive' },
  depleted: { label: 'Depleted', variant: 'secondary' },
  damaged: { label: 'Damaged', variant: 'destructive' },
  // Transaction
  completed: { label: 'Completed', variant: 'success' },
  pending: { label: 'Pending', variant: 'warning' },
  cancelled: { label: 'Cancelled', variant: 'destructive' },
  received: { label: 'Received', variant: 'success' }
};

export default function StatusBadge({ status, label, className }) {
  const config = STATUS_MAP[status] || {
    label: label || status,
    variant: 'secondary'
  };

  return (
    <Badge variant={config.variant} className={cn('gap-1.5', className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label || config.label}
    </Badge>
  );
}