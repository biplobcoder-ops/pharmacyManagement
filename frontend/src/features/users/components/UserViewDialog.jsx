// src/features/users/components/UserViewDialog.jsx

import { Mail, Phone, Shield, Calendar, Clock, MapPin } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { cn, getInitials, formatDate, formatDateTime } from '@/lib/utils';
import {
  useGetUserByIdQuery
} from '../usersApi';
import {
  USER_STATUS, ROLE_ICONS, ROLE_COLORS
} from '../usersTypes';

export default function UserViewDialog({ open, onOpenChange, userId }) {
  const { data: res, isLoading } = useGetUserByIdQuery(userId, {
    skip: !open || !userId
  });

  const user = res?.data;

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-3 py-4">
            <div className="h-20 rounded-lg bg-muted/40 animate-pulse" />
            <div className="h-32 rounded-lg bg-muted/40 animate-pulse" />
          </div>
        ) : !user ? (
          <div className="py-8 text-center">
            <p className="text-sm text-muted-foreground">User not found</p>
          </div>
        ) : (
          <div className="space-y-6 mt-2">
            {/* Header — Avatar + Name + Role + Status */}
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                <span className="text-xl font-bold text-accent">
                  {getInitials(user.name)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-foreground truncate">
                  {user.name}
                </h3>
                <p className="text-sm text-muted-foreground truncate">
                  {user.email}
                </p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <RoleBadge role={user.role} />
                  <StatusBadge status={user.status} />
                  {user.permissionsOverride?.length > 0 && (
                    <Badge variant="info" className="text-[10px]">
                      Custom permissions
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoCard
                icon={Mail}
                label="Email"
                value={user.email}
              />
              <InfoCard
                icon={Phone}
                label="Phone"
                value={user.phone || '—'}
              />
              <InfoCard
                icon={MapPin}
                label="Branch"
                value={user.branch?.name || '—'}
              />
              <InfoCard
                icon={Calendar}
                label="Member Since"
                value={user.createdAt ? formatDate(user.createdAt) : '—'}
              />
              <InfoCard
                icon={Clock}
                label="Last Login"
                value={
                  user.lastLogin ? formatDateTime(user.lastLogin) : 'Never'
                }
              />
              <InfoCard
                icon={Shield}
                label="Permissions"
                value={
                  user.role?.name === 'admin'
                    ? 'Full access'
                    : `${user.effectivePermissions?.length || 0} permissions`
                }
              />
            </div>

            {/* Permissions summary */}
            {user.role?.name !== 'admin' && user.effectivePermissions?.length > 0 && (
              <div className="rounded-lg border border-border bg-muted/20 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-accent" />
                    <p className="text-sm font-semibold text-foreground">
                      Effective Permissions
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {user.permissionsOverride?.length > 0
                      ? 'Custom override'
                      : 'Role default'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto scrollbar-thin">
                  {user.effectivePermissions.map((perm) => (
                    <span
                      key={perm}
                      className="inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-accent/10 text-accent"
                    >
                      {perm}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ===== Helper Components =====

function RoleBadge({ role }) {
  if (!role) return null;
  const Icon = ROLE_ICONS[role.name] || Shield;
  const colors = ROLE_COLORS[role.name] || { color: 'text-muted-foreground', bg: 'bg-muted' };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
        colors.bg,
        colors.color
      )}
    >
      <Icon className="h-3 w-3" />
      <span className="capitalize">{role.name}</span>
    </span>
  );
}

function StatusBadge({ status }) {
  const cfg = USER_STATUS[status] || USER_STATUS.active;
  return (
    <Badge variant={cfg.variant} className="gap-1.5">
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {cfg.label}
    </Badge>
  );
}

function InfoCard({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-border bg-muted/20">
      <div className="rounded-lg p-2 bg-accent/10 shrink-0">
        <Icon className="h-3.5 w-3.5 text-accent" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
          {label}
        </p>
        <p className="text-sm font-medium text-foreground truncate mt-0.5">
          {value}
        </p>
      </div>
    </div>
  );
}