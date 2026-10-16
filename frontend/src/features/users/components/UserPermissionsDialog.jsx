// src/features/users/components/UserPermissionsDialog.jsx
// ⭐ Main feature — Permission editor with checkboxes

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Shield, Loader2, Save, RotateCcw, Info
} from 'lucide-react';

import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { cn, getInitials } from '@/lib/utils';

import PermissionsMatrix from './PermissionsMatrix';
import {
  useUpdateUserPermissionsMutation,
  useResetUserPermissionsMutation
} from '../usersApi';
import { ROLE_ICONS, ROLE_COLORS, ROLE_DEFAULTS } from '../usersTypes';

export default function UserPermissionsDialog({
  open,
  onOpenChange,
  user,
  onSuccess
}) {
  // Selected permissions state
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  const [updatePermissions, { isLoading: isUpdating }] =
    useUpdateUserPermissionsMutation();
  const [resetPermissions, { isLoading: isResetting }] =
    useResetUserPermissionsMutation();

  const isLoading = isUpdating || isResetting;

  // ✅ Initialize permissions on open
  useEffect(() => {
    if (open && user) {
      // Jodi override thake, seta use korbo; else role default
      if (user.permissionsOverride?.length > 0) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedPermissions([...user.permissionsOverride]);
      } else {
        // Role default use koro (fallback to ROLE_DEFAULTS)
        const roleName = user.role?.name;
        const defaults = ROLE_DEFAULTS[roleName] || [];
        setSelectedPermissions([...defaults]);
      }
    }
  }, [open, user]);

  if (!open || !user) return null;

  const roleName = user.role?.name || 'user';
  const RoleIcon = ROLE_ICONS[roleName] || Shield;
  const roleColor = ROLE_COLORS[roleName] || {
    color: 'text-muted-foreground',
    bg: 'bg-muted'
  };

  const hasOverride = user.permissionsOverride?.length > 0;
  const roleDefaults = ROLE_DEFAULTS[roleName] || [];

  // ✅ Save handler
  const handleSave = async () => {
    try {
      // Jodi selected = role default → override clear koro
      const isSameAsDefault =
        selectedPermissions.length === roleDefaults.length &&
        selectedPermissions.every((p) => roleDefaults.includes(p));

      if (isSameAsDefault) {
        // Reset to role default
        await resetPermissions(user._id).unwrap();
        toast.success('Permissions reset to role default');
      } else {
        // Save override
        await updatePermissions({
          id: user._id,
          permissions: selectedPermissions
        }).unwrap();
        toast.success('Permissions updated');
      }
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to save permissions');
    }
  };

  // ✅ Reset handler
  const handleReset = async () => {
    try {
      await resetPermissions(user._id).unwrap();
      toast.success('Permissions reset to role default');
      setResetConfirmOpen(false);
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to reset permissions');
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="shrink-0">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent/10 shrink-0">
                <Shield className="h-5 w-5 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-base">
                  Manage Permissions
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Customize what this user can access
                </DialogDescription>
              </div>
            </div>

            {/* User info bar */}
            <div className="flex items-center gap-3 p-3 mt-3 rounded-lg border border-border bg-muted/20">
              <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-accent">
                  {getInitials(user.name)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {user.name}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
                    roleColor.bg,
                    roleColor.color
                  )}
                >
                  <RoleIcon className="h-3 w-3" />
                  <span className="capitalize">{roleName}</span>
                </span>
                {hasOverride && (
                  <Badge variant="info" className="text-[10px]">
                    Custom
                  </Badge>
                )}
              </div>
            </div>

            {/* Info strip */}
            <div className="flex items-start gap-2 p-3 mt-2 rounded-lg border border-accent/20 bg-accent/5">
              <Info className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5" />
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Check/uncheck the permissions you want this user to have.
                If you don't change anything, they'll keep the default{' '}
                <span className="font-semibold text-foreground capitalize">
                  {roleName}
                </span>{' '}
                permissions.
              </p>
            </div>
          </DialogHeader>

          {/* Permissions matrix (scrollable) */}
          <div className="flex-1 overflow-y-auto scrollbar-thin -mx-6 px-6 py-4">
            <PermissionsMatrix
              selected={selectedPermissions}
              onChange={setSelectedPermissions}
              roleDefaults={roleDefaults}
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-2 pt-4 border-t border-border shrink-0">
            <div className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">
                {selectedPermissions.length}
              </span>{' '}
              permission{selectedPermissions.length !== 1 ? 's' : ''} selected
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setResetConfirmOpen(true)}
                disabled={isLoading || !hasOverride}
                title={
                  hasOverride
                    ? 'Reset to role defaults'
                    : 'Already at role default'
                }
              >
                <RotateCcw className="h-4 w-4" />
                <span className="hidden sm:inline">Reset</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>

              <Button
                type="button"
                size="sm"
                onClick={handleSave}
                disabled={isLoading}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reset confirmation */}
      <ConfirmDialog
        open={resetConfirmOpen}
        onOpenChange={setResetConfirmOpen}
        title="Reset permissions?"
        description={`This will remove all custom permissions and restore ${roleName} role defaults.`}
        confirmText="Reset"
        variant="destructive"
        loading={isResetting}
        onConfirm={handleReset}
      />
    </>
  );
}