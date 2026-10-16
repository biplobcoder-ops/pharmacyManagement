/* eslint-disable no-unused-vars */
// src/features/notifications/components/NotificationBell.jsx
// Header bell icon + dropdown (top 5 unread) — ADMIN ONLY

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Bell, Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { cn, formatRelativeTime } from '@/lib/utils';
import {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAllAsReadMutation
} from '../notificationsApi';
import { NOTIFICATION_TYPES } from '../notificationsTypes';

export default function NotificationBell() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [open, setOpen] = useState(false);

  const isAdmin = user?.role?.name === 'admin';

  // ✅ Poll every 1 minute (60 sec)
  const { data: unreadRes } = useGetUnreadCountQuery(undefined, {
    pollingInterval: 60000, // 1 min
    refetchOnMountOrArgChange: true,
    skip: !isAdmin
  });
  const unreadCount = unreadRes?.data?.count || 0;

  const { data: listRes, isLoading } = useGetNotificationsQuery(
    { isRead: 'false', limit: 5, page: 1 },
    {
      skip: !open || !isAdmin,
      refetchOnMountOrArgChange: true
    }
  );

  const [markAllAsRead] = useMarkAllAsReadMutation();

  const notifications = listRes?.data?.notifications || [];

  if (!isAdmin) return null;

  const handleMarkAllRead = async (e) => {
    e.stopPropagation();
    try {
      await markAllAsRead({}).unwrap();
    } catch (_) { /* empty */ }
  };

  const handleViewAll = () => {
    setOpen(false);
    navigate('/notifications');
  };

  const handleClickNotification = () => {
    setOpen(false);
    navigate('/notifications');
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 sm:w-96 p-0">
        <div className="flex items-center justify-between p-3 border-b border-border">
          <p className="text-sm font-semibold text-foreground">
            Notifications
            {unreadCount > 0 && (
              <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                ({unreadCount} unread)
              </span>
            )}
          </p>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs text-accent hover:underline flex items-center gap-1"
            >
              <Check className="h-3 w-3" />
              Mark all
            </button>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto scrollbar-thin">
          {isLoading ? (
            <div className="p-3 space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded-lg bg-muted/40 animate-pulse" />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">No new notifications</p>
            </div>
          ) : (
            notifications.map((n) => {
              const cfg = NOTIFICATION_TYPES[n.type] || NOTIFICATION_TYPES.system;
              const Icon = cfg.icon;
              return (
                <button
                  key={n._id}
                  onClick={handleClickNotification}
                  className="w-full flex items-start gap-3 p-3 hover:bg-muted/40 transition-colors text-left border-b border-border last:border-0"
                >
                  <div className={cn('rounded-lg p-2 shrink-0', cfg.bg)}>
                    <Icon className={cn('h-3.5 w-3.5', cfg.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">
                      {n.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">
                      {n.message}
                    </p>
                    <p className="text-[10px] text-muted-foreground/70 mt-1">
                      {formatRelativeTime(n.createdAt)}
                    </p>
                  </div>
                  <span className="block h-2 w-2 rounded-full bg-accent shrink-0 mt-2" />
                </button>
              );
            })
          )}
        </div>

        <DropdownMenuSeparator className="my-0" />
        <button
          onClick={handleViewAll}
          className="w-full flex items-center justify-center gap-1.5 p-3 text-xs font-medium text-accent hover:bg-muted/40 transition-colors"
        >
          View all notifications
          <ExternalLink className="h-3 w-3" />
        </button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}