// src/features/audit-logs/components/AuditLogTable.jsx

import { Eye, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import DataTable from '@/components/common/DataTable';
import { cn, getInitials, formatRelativeTime, formatDateTime } from '@/lib/utils';
import { ACTION_CONFIG } from '../auditLogsTypes';

export default function AuditLogTable({ data, isLoading, onView }) {
  const columns = [
    // ===== ACTION =====
    {
      key: 'action',
      label: 'Action',
      render: (row) => {
        const cfg = ACTION_CONFIG[row.action] || {
          label: row.action,
          color: 'text-muted-foreground',
          bg: 'bg-muted',
          badge: 'secondary',
          icon: Globe
        };
        const Icon = cfg.icon;

        return (
          <div className="flex items-center gap-3">
            <div className={cn('rounded-lg p-2 shrink-0', cfg.bg)}>
              <Icon className={cn('h-3.5 w-3.5', cfg.color)} />
            </div>
            <div className="min-w-0">
              <Badge variant={cfg.badge} className="text-[10px]">
                {cfg.label}
              </Badge>
              <p className="text-[10px] text-muted-foreground mt-0.5 capitalize">
                {row.module}
              </p>
            </div>
          </div>
        );
      }
    },

    // ===== USER =====
    {
      key: 'user',
      label: 'User',
      render: (row) => {
        if (!row.user) {
          return (
            <span className="text-xs text-muted-foreground italic">
              System
            </span>
          );
        }

        return (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
              <span className="text-[10px] font-bold text-accent">
                {getInitials(row.user.name)}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-foreground truncate max-w-[140px]">
                {row.user.name}
              </p>
              <p className="text-[10px] text-muted-foreground truncate max-w-[140px]">
                {row.user.email}
              </p>
            </div>
          </div>
        );
      }
    },

    // ===== REFERENCE =====
    {
      key: 'reference',
      label: 'Reference',
      render: (row) => (
        <span className="text-[10px] font-mono text-muted-foreground">
          {row.reference ? `#${row.reference.slice(-8)}` : '—'}
        </span>
      )
    },

    // ===== IP =====
    {
      key: 'ip',
      label: 'IP Address',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <Globe className="h-3 w-3 text-muted-foreground shrink-0" />
          <span className="text-xs font-mono text-muted-foreground">
            {row.ip || '—'}
          </span>
        </div>
      )
    },

    // ===== TIMESTAMP =====
    {
      key: 'timestamp',
      label: 'Time',
      align: 'right',
      render: (row) => (
        <div className="text-right">
          <p className="text-xs text-foreground">
            {formatRelativeTime(row.timestamp)}
          </p>
          <p className="text-[10px] text-muted-foreground">
            {formatDateTime(row.timestamp)}
          </p>
        </div>
      )
    },

    // ===== ACTIONS =====
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (row) => (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onView(row)}
          title="View details"
        >
          <Eye className="h-4 w-4" />
        </Button>
      )
    }
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      emptyTitle="No audit logs found"
      emptyDescription="Try adjusting filters or date range."
      minWidth="1000px"
    />
  );
}