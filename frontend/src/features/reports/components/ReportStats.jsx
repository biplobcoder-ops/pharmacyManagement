// src/features/reports/components/ReportStats.jsx

import { Card, CardContent } from '@/components/ui/card';
import { cn, formatCurrency, formatNumber } from '@/lib/utils';

export default function ReportStats({ items = [], isLoading, cols = 4 }) {
  const gridClass = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
  }[cols] || 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';

  return (
    <div className={cn('grid gap-4', gridClass)}>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.label}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <p className="text-sm text-muted-foreground">{item.label}</p>
                {Icon && (
                  <div className={cn('rounded-lg p-2', item.bg || 'bg-accent/10')}>
                    <Icon className={cn('h-4 w-4', item.color || 'text-accent')} />
                  </div>
                )}
              </div>
              <p className={cn(
                'text-2xl lg:text-3xl font-bold tabular-nums',
                item.valueClass || 'text-foreground'
              )}>
                {isLoading
                  ? '—'
                  : item.isNumber
                  ? formatNumber(item.value)
                  : formatCurrency(item.value)}
              </p>
              {item.subtitle && (
                <p className="text-xs text-muted-foreground mt-1">{item.subtitle}</p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}