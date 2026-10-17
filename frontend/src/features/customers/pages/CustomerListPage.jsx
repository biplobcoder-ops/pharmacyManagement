import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';

import PageHeader from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/card';
import Pagination from '@/components/common/Pagination';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { useDebounce } from '@/hooks/useDebounce';

import CustomerStats from '../components/CustomerStats';
import CustomerFilters from '../components/CustomerFilters';
import CustomerTable from '../components/CustomerTable';
import CustomerFormDialog from '../components/CustomerFormDialog';
import CustomerViewDialog from '../components/CustomerViewDialog';
import PaymentDialog from '../components/PaymentDialog';

import { useGetCustomersQuery, useDeleteCustomerMutation } from '../customerApi';

export default function CustomerListPage() {
  const [search, setSearch] = useState('');
  const [dueFilter, setDueFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewTarget, setViewTarget] = useState(null);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentTarget, setPaymentTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const debouncedSearch = useDebounce(search, 400);

  const queryParams = useMemo(
    () => ({
      page,
      limit,
      search: debouncedSearch || undefined,
      hasDue: dueFilter === 'hasDue' ? 'true' : dueFilter === 'noDue' ? 'false' : undefined
    }),
    [page, limit, debouncedSearch, dueFilter]
  );

  const { data: res, isLoading, isFetching, refetch } = useGetCustomersQuery(queryParams);
  const [deleteCustomer, { isLoading: isDeleting }] = useDeleteCustomerMutation();

  const customers = res?.data?.customers || [];
  const pagination = res?.data?.pagination;

  const stats = useMemo(() => {
    const total = pagination?.total || customers.length;
    const totalPurchases = customers.reduce((sum, c) => sum + (c.totalPurchase || 0), 0);
    const totalDue = customers.reduce((sum, c) => sum + (c.dueBalance || 0), 0);
    const dueCount = customers.filter((c) => c.dueBalance > 0).length;
    return { total, totalPurchases, totalDue, dueCount, thisMonth: 0 };
  }, [customers, pagination]);

  const handleOpenCreate = () => { setEditTarget(null); setFormOpen(true); };
  const handleOpenEdit = (customer) => { setEditTarget(customer); setFormOpen(true); };
  const handleOpenView = (customer) => { setViewTarget(customer); setViewOpen(true); };
  const handleOpenPayment = (customer) => { setPaymentTarget(customer); setPaymentOpen(true); };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCustomer(deleteTarget._id).unwrap();
      toast.success('Customer deleted');
      setDeleteTarget(null);
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to delete customer');
    }
  };

  return (
    <>
      <PageHeader title="Customers" subtitle="Manage customer profiles, purchases, payments and due balances." />
      <div className="space-y-6">
        <CustomerStats stats={stats} isLoading={isLoading} />
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-border">
            <CustomerFilters
              search={search} onSearchChange={(v) => { setSearch(v); setPage(1); }}
              dueFilter={dueFilter} onDueFilterChange={(v) => { setDueFilter(v); setPage(1); }}
              onExport={() => toast('Export coming soon')} onAdd={handleOpenCreate}
            />
          </div>
          <CustomerTable
            data={customers} isLoading={isLoading || isFetching}
            onView={handleOpenView} onEdit={handleOpenEdit} onDelete={setDeleteTarget} onPay={handleOpenPayment}
          />
          {pagination && pagination.total > 0 && (
            <div className="border-t border-border">
              <Pagination pagination={pagination} onPageChange={setPage} isLoading={isLoading || isFetching} />
            </div>
          )}
        </Card>
      </div>
      <CustomerFormDialog open={formOpen} onOpenChange={setFormOpen} customer={editTarget} onSuccess={refetch} />
      <CustomerViewDialog open={viewOpen} onOpenChange={setViewOpen} customerId={viewTarget?._id} />
      <PaymentDialog open={paymentOpen} onOpenChange={setPaymentOpen} customer={paymentTarget} onSuccess={refetch} />
      <ConfirmDialog
        open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}
        title={`Delete "${deleteTarget?.name}"?`} description="This cannot be undone. Customers with sales or due cannot be deleted."
        confirmText="Delete" variant="destructive" loading={isDeleting} onConfirm={handleDelete}
      />
    </>
  );
}