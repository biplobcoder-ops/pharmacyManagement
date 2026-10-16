import { RotateCcw, TrendingDown, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn, formatCurrency, formatNumber } from '@/lib/utils';

export default function ReturnsStats({ stats, isLoading }) {
  const items = [
    {
      label: 'Sales returns',
      value: stats?.salesReturns || 0,
      subtitle: `${stats?.salesCount || 0} this month`,
      icon: RotateCcw,
      color: 'text-accent',
      bg: 'bg-accent/10'
    },
    {
      label: 'Purchase returns',
      value: stats?.purchaseReturns || 0,
      subtitle: `${stats?.purchaseCount || 0} this month`,
      icon: TrendingDown,
      color: 'text-orange-500',
      bg: 'bg-orange-500/10'
    },
    {
      label: 'Pending approval',
      value: stats?.pendingCount || 0,
      subtitle: 'Requires review',
      icon: AlertCircle,
      color: 'text-warning',
      bg: 'bg-warning/10',
      isNumber: true
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
                {isLoading
                  ? '—'
                  : item.isNumber
                  ? formatNumber(item.value)
                  : formatCurrency(item.value)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{item.subtitle}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}