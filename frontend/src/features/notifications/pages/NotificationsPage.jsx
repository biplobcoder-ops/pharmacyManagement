/* eslint-disable no-unused-vars */
// src/features/notifications/pages/NotificationsPage.jsx

import { useMemo, useState } from 'react';
import { Check, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Pagination from '@/components/common/Pagination';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { useDebounce } from '@/hooks/useDebounce';

import NotificationStats from '../components/NotificationStats';
import NotificationFilters from '../components/NotificationFilters';
import NotificationItem from '../components/NotificationItem';
import NotificationViewDialog from '../components/NotificationViewDialog';

import {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
  useDeleteAllReadMutation
} from '../notificationsApi';

export default function NotificationsPage() {
  const user = useSelector((state) => state.auth.user);
  const isAdmin = user?.role?.name === 'admin';

  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [type, setType] = useState('all');
  const [priority, setPriority] = useState('all');
  const [readFilter, setReadFilter] = useState('all');
  const [search, setSearch] = useState('');

  const [viewOpen, setViewOpen] = useState(false);
  const [viewTarget, setViewTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [confirmDeleteAllRead, setConfirmDeleteAllRead] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  const queryParams = useMemo(() => {
    const p = { page, limit };
    if (type !== 'all') p.type = type;
    if (priority !== 'all') p.priority = priority;
    if (readFilter === 'unread') p.isRead = 'false';
    if (readFilter === 'read') p.isRead = 'true';
    if (debouncedSearch.trim()) p.search = debouncedSearch.trim();
    return p;
  }, [page, limit, type, priority, readFilter, debouncedSearch]);

  // ✅ Poll every 1 minute (60 sec)
  const { data: res, isLoading, isFetching } = useGetNotificationsQuery(queryParams, {
    refetchOnMountOrArgChange: true,
    pollingInterval: 60000, // 1 min
    skip: !isAdmin
  });

  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead, { isLoading: isMarkingAll }] = useMarkAllAsReadMutation();
  const [deleteNotification, { isLoading: isDeleting }] = useDeleteNotificationMutation();
  const [deleteAllRead, { isLoading: isDeletingAll }] = useDeleteAllReadMutation();

  const notifications = res?.data?.notifications || [];
  const pagination = res?.data?.pagination;

  const stats = useMemo(() => {
    const total = pagination?.total || notifications.length;
    const unread = notifications.filter((n) => !n.isRead).length;
    const high = notifications.filter((n) => n.priority === 'high' && !n.isRead).length;
    const today = notifications.filter((n) => {
      const d = new Date(n.createdAt);
      const now = new Date();
      return d.toDateString() === now.toDateString();
    }).length;
    return { total, unread, high, today };
  }, [notifications, pagination]);

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const handleView = async (n) => {
    setViewTarget(n);
    setViewOpen(true);
    if (!n.isRead) {
      try {
        await markAsRead(n._id).unwrap();
      } catch (e) {
        // silent
      }
    }
  };

  const handleMarkRead = async (n, e) => {
    e?.stopPropagation();
    try {
      await markAsRead(n._id).unwrap();
      toast.success('Marked as read');
    } catch (err) {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const result = await markAllAsRead({}).unwrap();
      toast.success(result?.message || 'All marked as read');
    } catch (err) {
      toast.error('Failed to mark all');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteNotification(deleteTarget._id).unwrap();
      toast.success('Notification deleted');
      setDeleteTarget(null);
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleDeleteAllRead = async () => {
    try {
      const result = await deleteAllRead({}).unwrap();
      toast.success(result?.message || 'Read notifications deleted');
      setConfirmDeleteAllRead(false);
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  return (
    <>
      <PageHeader
        title="Notifications"
        subtitle="Stay updated on stock, expiry, dues and system alerts."
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
              disabled={isMarkingAll || stats.unread === 0}
            >
              <Check className="h-4 w-4" />
              <span className="hidden sm:inline">Mark all read</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmDeleteAllRead(true)}
              disabled={isDeletingAll}
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">Clear read</span>
            </Button>
          </>
        }
      />

      <div className="space-y-6">
        <NotificationStats stats={stats} isLoading={isLoading} />

        <Card className="overflow-hidden">
          <div className="p-4 border-b border-border">
            <NotificationFilters
              search={search}
              onSearchChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              type={type}
              onTypeChange={(v) => {
                setType(v);
                setPage(1);
              }}
              priority={priority}
              onPriorityChange={(v) => {
                setPriority(v);
                setPage(1);
              }}
              readFilter={readFilter}
              onReadFilterChange={(v) => {
                setReadFilter(v);
                setPage(1);
              }}
            />
          </div>

          <div className="divide-y divide-border">
            {isLoading || isFetching ? (
              <div className="p-4 space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-20 rounded-lg bg-muted/40 animate-pulse" />
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-sm font-medium text-foreground">No notifications</p>
                <p className="text-xs text-muted-foreground mt-1">
                  You're all caught up! 🎉
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <NotificationItem
                  key={n._id}
                  notification={n}
                  onView={handleView}
                  onMarkRead={handleMarkRead}
                  onDelete={setDeleteTarget}
                />
              ))
            )}
          </div>

          {pagination && pagination.total > 0 && (
            <div className="border-t border-border">
              <Pagination pagination={pagination} onPageChange={setPage} />
            </div>
          )}
        </Card>
      </div>

      <NotificationViewDialog
        open={viewOpen}
        onOpenChange={setViewOpen}
        notification={viewTarget}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete notification?"
        description="This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
        loading={isDeleting}
        onConfirm={handleDelete}
      />

      <ConfirmDialog
        open={confirmDeleteAllRead}
        onOpenChange={setConfirmDeleteAllRead}
        title="Clear all read notifications?"
        description="All read notifications will be permanently deleted."
        confirmText="Delete"
        variant="destructive"
        loading={isDeletingAll}
        onConfirm={handleDeleteAllRead}
      />
    </>
  );
}