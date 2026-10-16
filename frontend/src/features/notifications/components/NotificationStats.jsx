// src/features/notifications/components/NotificationStats.jsx

import { Bell, BellRing, AlertTriangle, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn, formatNumber } from '@/lib/utils';

export default function NotificationStats({ stats, isLoading }) {
  const items = [
    {
      label: 'Total',
      value: stats?.total || 0,
      subtitle: 'All notifications',
      icon: Bell,
      color: 'text-accent',
      bg: 'bg-accent/10'
    },
    {
      label: 'Unread',
      value: stats?.unread || 0,
      subtitle: 'Need attention',
      icon: BellRing,
      color: 'text-warning',
      bg: 'bg-warning/10'
    },
    {
      label: 'High Priority',
      value: stats?.high || 0,
      subtitle: 'Urgent alerts',
      icon: AlertTriangle,
      color: 'text-destructive',
      bg: 'bg-destructive/10'
    },
    {
      label: 'Today',
      value: stats?.today || 0,
      subtitle: 'New today',
      icon: Calendar,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
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
                {isLoading ? '—' : formatNumber(item.value)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{item.subtitle}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}