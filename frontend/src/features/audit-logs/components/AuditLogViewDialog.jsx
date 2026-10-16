// src/features/audit-logs/components/AuditLogViewDialog.jsx
// Audit log detail modal — old vs new data comparison

import { useNavigate } from 'react-router-dom';
import {
  ExternalLink, User, Globe, Monitor, Calendar,
  ArrowRight, FileText, AlertCircle
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
// eslint-disable-next-line no-unused-vars
import { cn, getInitials, formatDateTime } from '@/lib/utils';
import { useGetAuditLogByIdQuery } from '../auditLogsApi';
import { ACTION_CONFIG, REFERENCE_ROUTES } from '../auditLogsTypes';

export default function AuditLogViewDialog({ open, onOpenChange, logId }) {
  const navigate = useNavigate();
  const { data: res, isLoading } = useGetAuditLogByIdQuery(logId, {
    skip: !open || !logId
  });

  const log = res?.data;

  const handleGoTo = () => {
    const route = REFERENCE_ROUTES[log?.module];
    if (route) {
      navigate(route);
      onOpenChange(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Audit Log Details</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-3 py-4">
            <div className="h-20 rounded-lg bg-muted/40 animate-pulse" />
            <div className="h-32 rounded-lg bg-muted/40 animate-pulse" />
          </div>
        ) : !log ? (
          <div className="py-8 text-center">
            <AlertCircle className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Log not found</p>
          </div>
        ) : (
          <div className="space-y-5 mt-2">
            {/* ===== HEADER: Action Badge ===== */}
            <ActionHeader log={log} />

            {/* ===== INFO GRID ===== */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InfoCard
                icon={User}
                label="User"
                value={log.user?.name || 'System'}
                subtitle={log.user?.email}
              />
              <InfoCard
                icon={Calendar}
                label="Timestamp"
                value={formatDateTime(log.timestamp)}
              />
              <InfoCard
                icon={Globe}
                label="IP Address"
                value={log.ip || '—'}
                mono
              />
              <InfoCard
                icon={Monitor}
                label="User Agent"
                value={log.userAgent || '—'}
                truncate
              />
            </div>

            {/* ===== REFERENCE ===== */}
            {log.reference && (
              <div className="rounded-lg border border-border bg-muted/20 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="h-4 w-4 text-accent shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        Reference
                      </p>
                      <p className="text-xs font-mono text-foreground truncate">
                        {log.reference}
                      </p>
                    </div>
                  </div>
                  {REFERENCE_ROUTES[log.module] && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleGoTo}
                      className="shrink-0"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Go to {log.module}
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* ===== OLD vs NEW DATA ===== */}
            <DataComparison oldData={log.oldData} newData={log.newData} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ===== Helper: Action Header =====
function ActionHeader({ log }) {
  const cfg = ACTION_CONFIG[log.action] || {
    label: log.action,
    color: 'text-muted-foreground',
    bg: 'bg-muted',
    badge: 'secondary',
    icon: FileText
  };
  const Icon = cfg.icon;

  return (
    <div className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card">
      <div className={cn('rounded-lg p-3 shrink-0', cfg.bg)}>
        <Icon className={cn('h-6 w-6', cfg.color)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={cfg.badge}>{cfg.label}</Badge>
          <ArrowRight className="h-3 w-3 text-muted-foreground" />
          <Badge variant="secondary" className="capitalize">
            {log.module}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {cfg.label} action on {log.module} module
        </p>
      </div>
    </div>
  );
}

// ===== Helper: Info Card =====
function InfoCard({ icon: Icon, label, value, subtitle, mono, truncate }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-border bg-muted/20">
      <div className="rounded-lg p-2 bg-accent/10 shrink-0">
        <Icon className="h-3.5 w-3.5 text-accent" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
          {label}
        </p>
        <p
          className={cn(
            'text-sm font-medium text-foreground mt-0.5',
            mono && 'font-mono text-xs',
            truncate && 'truncate'
          )}
          title={truncate ? value : undefined}
        >
          {value}
        </p>
        {subtitle && (
          <p className="text-[10px] text-muted-foreground truncate mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

// ===== Helper: Data Comparison =====
function DataComparison({ oldData, newData }) {
  // Jodi duita data i na thake
  if (!oldData && !newData) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/10 p-6 text-center">
        <FileText className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
        <p className="text-xs text-muted-foreground">
          No data snapshot available for this action
        </p>
      </div>
    );
  }

  // Jodi shudhu newData thake (create action)
  if (!oldData && newData) {
    return (
      <DataBlock
        title="Created Data"
        data={newData}
        variant="success"
      />
    );
  }

  // Jodi shudhu oldData thake (delete action)
  if (oldData && !newData) {
    return (
      <DataBlock
        title="Deleted Data"
        data={oldData}
        variant="destructive"
      />
    );
  }

  // Duita i ache (update action) — side by side
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <DataBlock
        title="Old Data"
        data={oldData}
        variant="destructive"
      />
      <DataBlock
        title="New Data"
        data={newData}
        variant="success"
      />
    </div>
  );
}

// ===== Helper: Data Block =====
function DataBlock({ title, data, variant = 'default' }) {
  const colors = {
    default: { border: 'border-border', bg: 'bg-muted/20', text: 'text-foreground' },
    success: { border: 'border-success/30', bg: 'bg-success/5', text: 'text-success' },
    destructive: { border: 'border-destructive/30', bg: 'bg-destructive/5', text: 'text-destructive' }
  };
  const c = colors[variant] || colors.default;

  // Clean data — sensitive fields redact
  const cleanedData = redactSensitive(data);

  return (
    <div className={cn('rounded-lg border overflow-hidden', c.border, c.bg)}>
      <div className={cn('px-3 py-2 border-b', c.border)}>
        <p className={cn('text-xs font-semibold', c.text)}>{title}</p>
      </div>
      <div className="p-3 max-h-64 overflow-y-auto scrollbar-thin">
        <pre className="text-[10px] font-mono text-foreground/90 whitespace-pre-wrap break-all">
          {JSON.stringify(cleanedData, null, 2)}
        </pre>
      </div>
    </div>
  );
}

// ===== Helper: Redact Sensitive =====
function redactSensitive(obj) {
  if (!obj || typeof obj !== 'object') return obj;

  const sensitive = ['password', 'token', 'refreshToken', 'accessToken'];
  const redacted = Array.isArray(obj) ? [...obj] : { ...obj };

  for (const key of Object.keys(redacted)) {
    if (sensitive.includes(key)) {
      redacted[key] = '[REDACTED]';
    } else if (typeof redacted[key] === 'object' && redacted[key] !== null) {
      redacted[key] = redactSensitive(redacted[key]);
    }
  }

  return redacted;
}