import { ShoppingBag, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn, formatCurrency } from '@/lib/utils';

export default function PurchaseStats({ data, isLoading }) {
  const stats = data?.summary || {};

  const items = [
    {
      label: 'This month',
      value: stats.totalPurchases || 0,
      subtitle: `${stats.totalOrders || 0} purchase orders`,
      icon: ShoppingBag,
      color: 'text-accent',
      bg: 'bg-accent/10'
    },
    {
      label: 'Paid',
      value: stats.totalPaid || 0,
      subtitle: `${stats.paidPercent || 0}% settled`,
      icon: CheckCircle2,
      color: 'text-success',
      bg: 'bg-success/10'
    },
    {
      label: 'Outstanding',
      value: stats.totalDue || 0,
      subtitle: `${stats.supplierCount || 0} suppliers`,
      icon: AlertCircle,
      color: 'text-warning',
      bg: 'bg-warning/10'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.label}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <div className={cn('rounded-lg p-2', item.bg)}>
                  <Icon className={cn('h-4 w-4', item.color)} />
                </div>
              </div>
              <p className="text-2xl lg:text-3xl font-bold tabular-nums text-foreground">
                {isLoading ? '—' : formatCurrency(item.value)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{item.subtitle}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}