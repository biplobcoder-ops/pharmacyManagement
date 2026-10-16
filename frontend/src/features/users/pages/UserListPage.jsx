// src/features/users/pages/UserListPage.jsx

import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';

import PageHeader from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/card';
import Pagination from '@/components/common/Pagination';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { useDebounce } from '@/hooks/useDebounce';

import UserStats from '../components/UserStats';
import UserFilters from '../components/UserFilters';
import UserTable from '../components/UserTable';
import UserFormDialog from '../components/UserFormDialog';
import UserViewDialog from '../components/UserViewDialog';
import UserPermissionsDialog from '../components/UserPermissionsDialog';

import { useGetUsersQuery, useDeleteUserMutation } from '../usersApi';

export default function UserListPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Dialog states
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const [viewOpen, setViewOpen] = useState(false);
  const [viewTarget, setViewTarget] = useState(null);

  const [permissionsOpen, setPermissionsOpen] = useState(false);
  const [permissionsTarget, setPermissionsTarget] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);

  const debouncedSearch = useDebounce(search, 400);

  const queryParams = useMemo(() => {
    const p = { page, limit };
    if (debouncedSearch.trim()) p.search = debouncedSearch.trim();
    if (roleFilter !== 'all') p.role = roleFilter;
    if (statusFilter !== 'all') p.status = statusFilter;
    return p;
  }, [page, limit, debouncedSearch, roleFilter, statusFilter]);

  const { data: res, isLoading, isFetching, refetch } = useGetUsersQuery(queryParams, {
    refetchOnMountOrArgChange: true
  });

  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  const users = res?.data?.users || [];
  const pagination = res?.data?.pagination;

  // Stats (page-wise)
  const stats = useMemo(() => {
    const total = pagination?.total || users.length;
    const active = users.filter((u) => u.status === 'active').length;
    const inactive = users.filter((u) => u.status !== 'active').length;
    const withOverride = users.filter(
      (u) => u.permissionsOverride?.length > 0
    ).length;

    return { total, active, inactive, withOverride };
  }, [users, pagination]);

  // Handlers
  const handleOpenCreate = () => {
    setEditTarget(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (user) => {
    setEditTarget(user);
    setFormOpen(true);
  };

  const handleOpenView = (user) => {
    setViewTarget(user);
    setViewOpen(true);
  };

  const handleOpenPermissions = (user) => {
    setPermissionsTarget(user);
    setPermissionsOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteUser(deleteTarget._id).unwrap();
      toast.success('User deleted');
      setDeleteTarget(null);
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to delete user');
    }
  };

  return (
    <>
      <PageHeader
        title="Users & Roles"
        subtitle="Manage users, assign roles and customize permissions."
      />

      <div className="space-y-6">
        <UserStats stats={stats} isLoading={isLoading} />

        <Card className="overflow-hidden">
          <div className="p-4 border-b border-border">
            <UserFilters
              search={search}
              onSearchChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              roleFilter={roleFilter}
              onRoleChange={(v) => {
                setRoleFilter(v);
                setPage(1);
              }}
              statusFilter={statusFilter}
              onStatusChange={(v) => {
                setStatusFilter(v);
                setPage(1);
              }}
              onAdd={handleOpenCreate}
            />
          </div>

          <UserTable
            data={users}
            isLoading={isLoading || isFetching}
            onView={handleOpenView}
            onEdit={handleOpenEdit}
            onPermissions={handleOpenPermissions}
            onDelete={setDeleteTarget}
          />

          {pagination && pagination.total > 0 && (
            <div className="border-t border-border">
              <Pagination pagination={pagination} onPageChange={setPage} />
            </div>
          )}
        </Card>
      </div>

      {/* Dialogs */}
      <UserFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        user={editTarget}
        onSuccess={refetch}
      />

      <UserViewDialog
        open={viewOpen}
        onOpenChange={setViewOpen}
        userId={viewTarget?._id}
      />

      <UserPermissionsDialog
        open={permissionsOpen}
        onOpenChange={setPermissionsOpen}
        user={permissionsTarget}
        onSuccess={refetch}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title={`Delete "${deleteTarget?.name}"?`}
        description="This cannot be undone. User will lose all access."
        confirmText="Delete"
        variant="destructive"
        loading={isDeleting}
        onConfirm={handleDelete}
      />
    </>
  );
}