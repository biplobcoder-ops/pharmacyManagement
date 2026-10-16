import { Users, TrendingUp, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn, formatCurrency, formatNumber } from '@/lib/utils';

export default function CustomerStats({ stats, isLoading }) {
  const items = [
    {
      label: 'Total customers',
      value: stats?.total || 0,
      subtitle: `${stats?.thisMonth || 0} added this month`,
      icon: Users,
      color: 'text-accent',
      bg: 'bg-accent/10',
      isNumber: true
    },
    {
      label: 'Total purchases',
      value: stats?.totalPurchases || 0,
      subtitle: 'All-time revenue',
      icon: TrendingUp,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
    {
      label: 'Customer due',
      value: stats?.totalDue || 0,
      subtitle: `${stats?.dueCount || 0} customers with due`,
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