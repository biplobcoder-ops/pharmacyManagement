// src/features/medicines/components/MedicineStats.jsx
// ✅ Mobile-first responsive + professional

import {
  Pill, AlertTriangle, XCircle, Layers
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn, formatNumber } from '@/lib/utils';

export default function MedicineStats({ stats, isLoading }) {
  const items = [
    {
      label: 'Total',
      fullLabel: 'Total medicines',
      value: stats?.totalMedicines || 0,
      subtitle: `${stats?.activeMedicines || 0} active`,
      icon: Pill,
      color: 'text-accent',
      bg: 'bg-accent/10',
      accentColor: 'from-accent to-accent/40'
    },
    {
      label: 'Units',
      fullLabel: 'Total units',
      value: stats?.totalUnits || 0,
      subtitle: `${stats?.totalBatches || 0} batches`,
      icon: Layers,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      accentColor: 'from-blue-500 to-blue-500/40'
    },
    {
      label: 'Low',
      fullLabel: 'Low stock',
      value: stats?.lowStock || 0,
      subtitle: 'Needs attention',
      icon: AlertTriangle,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      accentColor: 'from-amber-500 to-amber-500/40',
      alert: (stats?.lowStock || 0) > 0
    },
    {
      label: 'Out',
      fullLabel: 'Out of stock',
      value: stats?.outOfStock || 0,
      subtitle: 'Reorder required',
      icon: XCircle,
      color: 'text-destructive',
      bg: 'bg-destructive/10',
      accentColor: 'from-destructive to-destructive/40',
      alert: (stats?.outOfStock || 0) > 0
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <Card
            key={item.label}
            className={cn(
              'group relative overflow-hidden transition-all duration-300',
              'hover:shadow-lg hover:-translate-y-0.5 border-border/60'
            )}
          >
            {/* Gradient accent line */}
            <div
              className={cn(
                'absolute top-0 inset-x-0 h-1 bg-gradient-to-r opacity-80',
                item.accentColor
              )}
            />

            <CardContent className="p-3 lg:p-5">
              {/* Header: Label + Icon */}
              <div className="flex items-center justify-between mb-2 lg:mb-3 gap-2">
                {/* Mobile: short label, Desktop: full label */}
                <p className="text-[10px] lg:text-xs font-semibold uppercase tracking-wider text-muted-foreground truncate">
                  <span className="lg:hidden">{item.label}</span>
                  <span className="hidden lg:inline">{item.fullLabel}</span>
                </p>

                <div
                  className={cn(
                    'relative rounded-lg p-1.5 lg:p-2.5 shrink-0',
                    'transition-transform group-hover:scale-110',
                    item.bg
                  )}
                >
                  <Icon className={cn('h-3 w-3 lg:h-4 lg:w-4', item.color)} />
                  {/* Pulse for alert */}
                  {item.alert && (
                    <span
                      className={cn(
                        'absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full animate-pulse',
                        item.color.replace('text-', 'bg-')
                      )}
                    />
                  )}
                </div>
              </div>

              {/* Value */}
              <p
                className={cn(
                  'text-xl lg:text-3xl font-bold text-foreground tabular-nums leading-tight',
                  item.alert && item.color
                )}
              >
                {isLoading ? '—' : formatNumber(item.value)}
              </p>

              {/* Subtitle — hidden on very small mobile, visible sm+ */}
              <p className="text-[10px] lg:text-xs text-muted-foreground mt-1 truncate">
                {item.subtitle}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}