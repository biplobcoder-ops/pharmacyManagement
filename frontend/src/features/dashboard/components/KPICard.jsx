// src/features/dashboard/components/KPICard.jsx
// ✅ Mobile-first compact KPI card

import * as Icons from 'lucide-react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn,formatCompact } from '@/lib/utils';

export default function KPICard({
  title,
  value,
  change,
  subtitle,
  icon,
  iconBg = 'bg-muted',
  iconColor = 'text-foreground',
  accentColor = 'accent'
}) {
  const Icon = Icons[icon] || Icons.Activity;
  const isPositive = change > 0;
  const isNegative = change < 0;
  const isFlat = change === 0 || change === undefined || change === null;

  return (
    <Card
      className={cn(
        'group relative overflow-hidden transition-all duration-300',
        'hover:shadow-lg hover:-translate-y-0.5 border-border/60'
      )}
    >
      {/* Gradient accent line */}
      <div
        className={cn(
          'absolute top-0 inset-x-0 h-1 bg-gradient-to-r opacity-80',
          accentColor === 'accent' && 'from-accent to-accent/40',
          accentColor === 'blue' && 'from-blue-500 to-blue-500/40',
          accentColor === 'emerald' && 'from-emerald-500 to-emerald-500/40',
          accentColor === 'rose' && 'from-rose-500 to-rose-500/40',
          accentColor === 'amber' && 'from-amber-500 to-amber-500/40'
        )}
      />

      <CardContent className="p-3 lg:p-5">
        {/* Header: Title + Icon */}
        <div className="flex items-start justify-between mb-2 lg:mb-3 gap-2">
          <p className="text-[10px] lg:text-xs font-semibold uppercase tracking-wider text-muted-foreground truncate">
            {title}
          </p>
          <div
            className={cn(
              'rounded-lg p-1.5 lg:p-2.5 shrink-0 transition-transform group-hover:scale-110',
              iconBg
            )}
          >
            <Icon className={cn('h-3 w-3 lg:h-4 lg:w-4', iconColor)} />
          </div>
        </div>

        {/* Value — compact on mobile */}
        <div className="mb-1.5 lg:mb-2">
          <p className="text-lg lg:text-[28px] font-bold text-foreground tabular-nums leading-tight">
            {formatCompact(value || 0)}
          </p>
        </div>

        {/* Trend / Subtitle */}
        <div className="flex items-center gap-1 min-h-[16px] lg:min-h-[20px]">
          {!isFlat ? (
            <>
              <div
                className={cn(
                  'rounded p-0.5',
                  isPositive && 'bg-emerald-500/10',
                  isNegative && 'bg-destructive/10'
                )}
              >
                {isPositive && <TrendingUp className="h-2.5 w-2.5 lg:h-3 lg:w-3 text-emerald-500" />}
                {isNegative && <TrendingDown className="h-2.5 w-2.5 lg:h-3 lg:w-3 text-destructive" />}
              </div>
              <span
                className={cn(
                  'text-[10px] lg:text-xs font-semibold tabular-nums',
                  isPositive && 'text-emerald-500',
                  isNegative && 'text-destructive'
                )}
              >
                {isPositive && '+'}
                {change}%
              </span>
            </>
          ) : subtitle ? (
            <p className="text-[10px] lg:text-[11px] text-muted-foreground truncate">
              {subtitle}
            </p>
          ) : (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Minus className="h-2.5 w-2.5" />
              <span className="text-[10px]">No change</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}