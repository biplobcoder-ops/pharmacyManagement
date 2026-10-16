// src/features/dashboard/components/AlertStrip.jsx
// ✅ Mobile: horizontal scroll chips

import { useNavigate } from 'react-router-dom';
import {
  AlertCircle, Clock, XCircle, Users, Truck
} from 'lucide-react';
import { cn, formatCurrency, formatNumber } from '@/lib/utils';

const ALERTS = [
  {
    key: 'lowStock',
    icon: AlertCircle,
    label: 'Low stock',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    path: '/inventory?tab=low-stock'
  },
  {
    key: 'expiringSoon',
    icon: Clock,
    label: 'Expiring',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    path: '/inventory?tab=expiring'
  },
  {
    key: 'expired',
    icon: XCircle,
    label: 'Expired',
    color: 'text-destructive',
    bg: 'bg-destructive/10',
    border: 'border-destructive/20',
    path: '/inventory?tab=expired'
  },
  {
    key: 'customerDue',
    icon: Users,
    label: 'Customer due',
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    path: '/customers?hasDue=true',
    isCurrency: true
  },
  {
    key: 'supplierDue',
    icon: Truck,
    label: 'Supplier due',
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
    path: '/suppliers?hasDue=true',
    isCurrency: true
  }
];

export default function AlertStrip({ data, isLoading }) {
  const navigate = useNavigate();

  if (isLoading || !data) {
    return (
      <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1 -mx-4 px-4 lg:mx-0 lg:px-0 lg:grid lg:grid-cols-5">
        {ALERTS.map((a) => (
          <div
            key={a.key}
            className="h-16 min-w-[140px] lg:min-w-0 rounded-xl border border-border bg-card animate-pulse shrink-0"
          />
        ))}
      </div>
    );
  }

  const values = {
    lowStock: data.inventoryValue?.lowStockCount ?? 0,
    expiringSoon: data.inventoryValue?.expiringSoonCount ?? 0,
    expired: data.inventoryValue?.expiredCount ?? 0,
    customerDue: data.customerDue ?? 0,
    supplierDue: data.supplierDue ?? 0
  };

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1 -mx-4 px-4 lg:mx-0 lg:px-0 lg:grid lg:grid-cols-5">
      {ALERTS.map((alert) => {
        const Icon = alert.icon;
        const value = values[alert.key] || 0;
        const hasValue = value > 0;

        return (
          <button
            key={alert.key}
            onClick={() => navigate(alert.path)}
            className={cn(
              'group relative flex items-center gap-2.5 rounded-xl border p-3 shrink-0',
              'min-w-[140px] lg:min-w-0',
              'bg-card transition-all duration-200',
              'hover:shadow-md hover:-translate-y-0.5',
              hasValue ? alert.border : 'border-border'
            )}
          >
            <div
              className={cn(
                'rounded-lg p-1.5 shrink-0 transition-transform group-hover:scale-110',
                alert.bg
              )}
            >
              <Icon className={cn('h-3.5 w-3.5', alert.color)} />
            </div>

            <div className="min-w-0 flex-1 text-left">
              <p
                className={cn(
                  'text-sm font-bold tabular-nums leading-tight',
                  hasValue ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {alert.isCurrency ? formatCurrency(value) : formatNumber(value)}
              </p>
              <p className="text-[9px] text-muted-foreground truncate uppercase tracking-wider">
                {alert.label}
              </p>
            </div>

            {/* Pulse for urgent */}
            {hasValue && (alert.key === 'expired' || alert.key === 'lowStock') && (
              <span
                className={cn(
                  'absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full',
                  alert.color.replace('text-', 'bg-'),
                  'animate-pulse'
                )}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}