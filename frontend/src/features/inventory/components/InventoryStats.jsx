import { DollarSign, Package, AlertTriangle, Activity } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn, formatCurrency, formatNumber } from '@/lib/utils';

export default function InventoryStats({ stats, isLoading }) {
  const items = [
    {
      label: 'Inventory value',
      value: stats?.costValue || 0,
      subtitle: 'At purchase cost',
      icon: DollarSign,
      color: 'text-accent',
      bg: 'bg-accent/10',
      isCurrency: true
    },
    {
      label: 'Available units',
      value: stats?.totalUnits || 0,
      subtitle: `Across ${formatNumber(stats?.batchCount || 0)} batches`,
      icon: Package,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
    {
      label: 'At-risk value',
      value: stats?.atRiskValue || 0,
      subtitle: 'Expiring within 90 days',
      icon: AlertTriangle,
      color: 'text-warning',
      bg: 'bg-warning/10',
      isCurrency: true
    },
    {
      label: 'Stock health',
      value: `${stats?.stockHealth || 0}%`,
      subtitle: 'Optimal availability',
      icon: Activity,
      color: 'text-success',
      bg: 'bg-success/10',
      isRaw: true
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  : item.isRaw
                  ? item.value
                  : item.isCurrency
                  ? formatCurrency(item.value)
                  : formatNumber(item.value)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{item.subtitle}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}