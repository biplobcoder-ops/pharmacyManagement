// src/features/audit-logs/components/AuditLogStats.jsx

import { Activity, Plus, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn, formatNumber } from '@/lib/utils';

export default function AuditLogStats({ stats, isLoading }) {
  const items = [
    {
      label: 'Total Logs',
      value: stats?.total || 0,
      subtitle: 'All activities',
      icon: Activity,
      color: 'text-accent',
      bg: 'bg-accent/10'
    },
    {
      label: 'Create Actions',
      value: stats?.creates || 0,
      subtitle: 'New records',
      icon: Plus,
      color: 'text-success',
      bg: 'bg-success/10'
    },
    {
      label: 'Update Actions',
      value: stats?.updates || 0,
      subtitle: 'Modified records',
      icon: Edit,
      color: 'text-warning',
      bg: 'bg-warning/10'
    },
    {
      label: 'Delete Actions',
      value: stats?.deletes || 0,
      subtitle: 'Removed records',
      icon: Trash2,
      color: 'text-destructive',
      bg: 'bg-destructive/10'
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
              <p className="text-xs text-muted-foreground mt-1">
                {item.subtitle}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}