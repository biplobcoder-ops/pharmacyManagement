/* eslint-disable no-unused-vars */
// src/features/users/components/UserTable.jsx

import {
  MoreHorizontal, Eye, Edit, Trash2, Shield, Mail, Phone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import DataTable from '@/components/common/DataTable';
import { cn, getInitials, formatDate } from '@/lib/utils';
import {
  USER_STATUS, ROLE_ICONS, ROLE_COLORS
} from '../usersTypes';

export default function UserTable({
  data, isLoading, onView, onEdit, onPermissions, onDelete
}) {
  const columns = [
    // ===== USER (avatar + name + email) =====
    {
      key: 'name',
      label: 'User',
      render: (row) => {
        const RoleIcon = ROLE_ICONS[row.role?.name] || Shield;
        const roleColor = ROLE_COLORS[row.role?.name] || {
          color: 'text-muted-foreground',
          bg: 'bg-muted'
        };

        return (
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-accent">
                {getInitials(row.name)}
              </span>
            </div>

            {/* Name + email */}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-foreground truncate max-w-[180px]">
                  {row.name}
                </p>
                {row.permissionsOverride?.length > 0 && (
                  <Badge
                    variant="info"
                    className="text-[9px] px-1.5 py-0"
                    title="Custom permissions"
                  >
                    Custom
                  </Badge>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground truncate max-w-[180px]">
                {row.email}
              </p>
            </div>
          </div>
        );
      }
    },

    // ===== CONTACT =====
    {
      key: 'phone',
      label: 'Contact',
      render: (row) => (
        <span className="text-sm text-muted-foreground">
          {row.phone || '—'}
        </span>
      )
    },

    // ===== ROLE =====
    {
      key: 'role',
      label: 'Role',
      render: (row) => {
        const RoleIcon = ROLE_ICONS[row.role?.name] || Shield;
        const roleColor = ROLE_COLORS[row.role?.name] || {
          color: 'text-muted-foreground',
          bg: 'bg-muted'
        };

        return (
          <div
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
              roleColor.bg,
              roleColor.color
            )}
          >
            <RoleIcon className="h-3 w-3" />
            <span className="capitalize">{row.role?.name || '—'}</span>
          </div>
        );
      }
    },

    // ===== PERMISSIONS COUNT =====
    {
      key: 'effectivePermissions',
      label: 'Permissions',
      align: 'right',
      render: (row) => {
        const count = row.effectivePermissions?.length || 0;
        const isAdmin = row.role?.name === 'admin';
        const hasOverride = row.permissionsOverride?.length > 0;

        return (
          <div className="flex items-center justify-end gap-1.5">
            {isAdmin ? (
              <span className="text-xs font-semibold text-purple-500">
                Full access
              </span>
            ) : (
              <>
                <span
                  className={cn(
                    'text-sm tabular-nums font-medium',
                    hasOverride ? 'text-accent' : 'text-muted-foreground'
                  )}
                >
                  {count}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {hasOverride ? '(custom)' : '(default)'}
                </span>
              </>
            )}
          </div>
        );
      }
    },

    // ===== STATUS =====
    {
      key: 'status',
      label: 'Status',
      render: (row) => {
        const cfg = USER_STATUS[row.status] || USER_STATUS.active;
        return (
          <Badge variant={cfg.variant} className="gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {cfg.label}
          </Badge>
        );
      }
    },

    // ===== LAST LOGIN =====
    {
      key: 'lastLogin',
      label: 'Last Login',
      render: (row) => (
        <span className="text-xs text-muted-foreground">
          {row.lastLogin ? formatDate(row.lastLogin) : 'Never'}
        </span>
      )
    },

    // ===== ACTIONS =====
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView(row)}>
              <Eye className="h-4 w-4" />
              View details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(row)}>
              <Edit className="h-4 w-4" />
              Edit user
            </DropdownMenuItem>

            {row.role?.name !== 'admin' && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onPermissions(row)}
                  className="text-accent"
                >
                  <Shield className="h-4 w-4" />
                  Manage permissions
                </DropdownMenuItem>
              </>
            )}

            {row.role?.name !== 'admin' && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(row)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      emptyTitle="No users found"
      emptyDescription="Try adjusting filters or add a new user."
      minWidth="1100px"
    />
  );
}