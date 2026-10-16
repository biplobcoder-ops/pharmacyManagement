// src/features/users/components/UserStatusToggle.jsx
// Active/Inactive toggle with confirmation

import { useState } from 'react';
import toast from 'react-hot-toast';
// eslint-disable-next-line no-unused-vars
import { Power, Loader2, UserX, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { cn } from '@/lib/utils';
import { useUpdateUserStatusMutation } from '../usersApi';

export default function UserStatusToggle({ user, onSuccess, variant = 'button' }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [updateStatus, { isLoading }] = useUpdateUserStatusMutation();

  if (!user) return null;

  // Admin ke toggle kora jabe na
  if (user.role?.name === 'admin') {
    return null;
  }

  const isActive = user.status === 'active';
  const nextStatus = isActive ? 'inactive' : 'active';

  const handleToggle = async () => {
    try {
      await updateStatus({ id: user._id, status: nextStatus }).unwrap();
      toast.success(
        nextStatus === 'active'
          ? 'User activated successfully'
          : 'User deactivated. They will be logged out.'
      );
      setConfirmOpen(false);
      onSuccess?.();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to update status');
    }
  };

  // ===== VARIANT: ICON BUTTON (for table row) =====
  if (variant === 'icon') {
    return (
      <>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'h-8 w-8',
            isActive
              ? 'text-destructive hover:text-destructive hover:bg-destructive/10'
              : 'text-success hover:text-success hover:bg-success/10'
          )}
          onClick={() => setConfirmOpen(true)}
          disabled={isLoading}
          title={isActive ? 'Deactivate user' : 'Activate user'}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isActive ? (
            <UserX className="h-4 w-4" />
          ) : (
            <UserCheck className="h-4 w-4" />
          )}
        </Button>

        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title={isActive ? 'Deactivate user?' : 'Activate user?'}
          description={
            isActive
              ? `${user.name} will not be able to login. If they are currently logged in, they'll be logged out automatically.`
              : `${user.name} will be able to login and access the system.`
          }
          confirmText={isActive ? 'Deactivate' : 'Activate'}
          variant={isActive ? 'destructive' : 'default'}
          loading={isLoading}
          onConfirm={handleToggle}
        />
      </>
    );
  }

  // ===== VARIANT: SWITCH BUTTON (for dialog / larger view) =====
  return (
    <>
      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        disabled={isLoading}
        className={cn(
          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2',
          isActive ? 'bg-success' : 'bg-muted',
          isLoading && 'opacity-50 cursor-not-allowed'
        )}
        title={isActive ? 'Click to deactivate' : 'Click to activate'}
      >
        <span
          className={cn(
            'inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform',
            isActive ? 'translate-x-6' : 'translate-x-1'
          )}
        />
      </button>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={isActive ? 'Deactivate user?' : 'Activate user?'}
        description={
          isActive
            ? `${user.name} will not be able to login. If they are currently logged in, they'll be logged out automatically.`
            : `${user.name} will be able to login and access the system.`
        }
        confirmText={isActive ? 'Deactivate' : 'Activate'}
        variant={isActive ? 'destructive' : 'default'}
        loading={isLoading}
        onConfirm={handleToggle}
      />
    </>
  );
}