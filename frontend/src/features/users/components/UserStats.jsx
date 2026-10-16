// src/features/users/components/UserStats.jsx

import { Users, UserCheck, UserX, Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn, formatNumber } from '@/lib/utils';

export default function UserStats({ stats, isLoading }) {
  const items = [
    {
      label: 'Total Users',
      value: stats?.total || 0,
      subtitle: 'All users',
      icon: Users,
      color: 'text-accent',
      bg: 'bg-accent/10'
    },
    {
      label: 'Active',
      value: stats?.active || 0,
      subtitle: 'Can login',
      icon: UserCheck,
      color: 'text-success',
      bg: 'bg-success/10'
    },
    {
      label: 'Inactive',
      value: stats?.inactive || 0,
      subtitle: 'Cannot login',
      icon: UserX,
      color: 'text-destructive',
      bg: 'bg-destructive/10'
    },
    {
      label: 'Custom Permissions',
      value: stats?.withOverride || 0,
      subtitle: 'Override active',
      icon: Shield,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10'
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