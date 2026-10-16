import { Calendar, TrendingUp, DollarSign, ShoppingBag } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn, formatCurrency } from '@/lib/utils';

export default function SalesStats({ stats, isLoading }) {
  const items = [
    {
      label: 'Today',
      value: stats?.today || 0,
      count: stats?.todayCount || 0,
      change: stats?.todayChange,
      icon: Calendar,
      color: 'text-accent',
      bg: 'bg-accent/10'
    },
    {
      label: 'This Week',
      value: stats?.week || 0,
      count: stats?.weekCount || 0,
      change: stats?.weekChange,
      icon: TrendingUp,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
    {
      label: 'This Month',
      value: stats?.month || 0,
      count: stats?.monthCount || 0,
      change: stats?.monthChange,
      icon: DollarSign,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10'
    },
    {
      label: 'This Year',
      value: stats?.year || 0,
      count: stats?.yearCount || 0,
      change: stats?.yearChange,
      icon: ShoppingBag,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item) => {
        const Icon = item.icon;
        const isPositive = item.change > 0;
        const isNegative = item.change < 0;

        return (
          <Card key={item.label} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <p className="text-sm font-medium text-muted-foreground">
                  {item.label}
                </p>
                <div className={cn('rounded-lg p-2', item.bg)}>
                  <Icon className={cn('h-4 w-4', item.color)} />
                </div>
              </div>
              <p className="text-2xl lg:text-3xl font-bold tabular-nums text-foreground">
                {isLoading ? '—' : formatCurrency(item.value)}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-muted-foreground">
                  {item.count} {item.count === 1 ? 'sale' : 'sales'}
                </span>
                {item.change !== undefined && item.change !== 0 && (
                  <span
                    className={cn(
                      'text-xs font-medium',
                      isPositive && 'text-success',
                      isNegative && 'text-destructive'
                    )}
                  >
                    {isPositive ? '↑' : '↓'} {Math.abs(item.change)}%
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}