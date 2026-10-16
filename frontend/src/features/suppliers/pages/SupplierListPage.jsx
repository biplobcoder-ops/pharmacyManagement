import { useMemo, useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Pagination from '@/components/common/Pagination';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { useDebounce } from '@/hooks/useDebounce';

import SupplierStats from '../components/SupplierStats';
import SupplierFilters from '../components/SupplierFilters';
import SupplierTable from '../components/SupplierTable';
import SupplierFormDialog from '../components/SupplierFormDialog';
import SupplierViewDialog from '../components/SupplierViewDialog';
import PaymentDialog from '../components/PaymentDialog';

import {
  useGetSuppliersQuery,
  useDeleteSupplierMutation
} from '../supplierApi';

// ✅ PDF Export
import { exportToPDF, pdfCurrency } from '@/lib/pdfExport';

export default function SupplierListPage() {
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
  const [isExporting, setIsExporting] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  const queryParams = useMemo(() => {
    const params = { page, limit };

    if (debouncedSearch && debouncedSearch.trim()) {
      params.search = debouncedSearch.trim();
    }

    if (dueFilter === 'hasDue') {
      params.hasDue = 'true';
    } else if (dueFilter === 'noDue') {
      params.hasDue = 'false';
    }

    return params;
  }, [page, limit, debouncedSearch, dueFilter]);

  const {
    data: res,
    isLoading,
    isFetching,
    refetch
  } = useGetSuppliersQuery(queryParams, {
    refetchOnMountOrArgChange: true
  });

  const [deleteSupplier, { isLoading: isDeleting }] = useDeleteSupplierMutation();

  const suppliers = res?.data?.suppliers || [];
  const pagination = res?.data?.pagination;
  const apiStats = res?.data?.stats;

  const stats = useMemo(() => {
    if (apiStats) {
      return {
        total: apiStats.totalSuppliers || 0,
        totalPurchases: apiStats.totalPurchases || 0,
        totalDue: apiStats.totalDue || 0,
        dueCount: apiStats.dueCount || 0,
        activeCount: apiStats.activeCount || 0
      };
    }

    const total = pagination?.total || suppliers.length;
    const totalPurchases = suppliers.reduce(
      (sum, s) => sum + (s.totalPurchase || 0),
      0
    );
    const totalDue = suppliers.reduce(
      (sum, s) => sum + (s.dueBalance > 0 ? s.dueBalance : 0),
      0
    );
    const dueCount = suppliers.filter((s) => s.dueBalance > 0).length;
    const activeCount = suppliers.filter((s) => s.status === 'active').length;

    return { total, totalPurchases, totalDue, dueCount, activeCount };
  }, [suppliers, pagination, apiStats]);

  const handleOpenCreate = () => {
    setEditTarget(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (supplier) => {
    setEditTarget(supplier);
    setFormOpen(true);
  };

  const handleOpenView = (supplier) => {
    setViewTarget(supplier);
    setViewOpen(true);
  };

  const handleOpenPayment = (supplier) => {
    setPaymentTarget(supplier);
    setPaymentOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteSupplier(deleteTarget._id).unwrap();
      toast.success('Supplier deleted');
      setDeleteTarget(null);
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to delete supplier');
    }
  };

  // ✅ PDF Export handler
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const token = localStorage.getItem('accessToken');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

      const params = new URLSearchParams({ page: 1, limit: 1000 });
      if (debouncedSearch.trim()) params.set('search', debouncedSearch.trim());
      if (dueFilter === 'hasDue') params.set('hasDue', 'true');
      if (dueFilter === 'noDue') params.set('hasDue', 'false');

      const res = await fetch(`${baseUrl}/suppliers?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to fetch suppliers');

      const json = await res.json();
      const allSuppliers = json?.data?.suppliers || [];

      if (allSuppliers.length === 0) {
        toast.error('No suppliers to export');
        return;
      }

      const totalPurchases = allSuppliers.reduce(
        (s, x) => s + (x.totalPurchase || 0),
        0
      );
      const totalPaid = allSuppliers.reduce(
        (s, x) => s + (x.totalPaid || 0),
        0
      );
      const totalDue = allSuppliers.reduce(
        (s, x) => s + (x.dueBalance > 0 ? x.dueBalance : 0),
        0
      );

      exportToPDF({
        title: 'Supplier List Report',
        subtitle: `${allSuppliers.length} suppliers`,
        company: {
          name: 'PharmaFlow Pharmacy',
          address: 'Dhanmondi, Dhaka, Bangladesh',
          phone: '+8801700000000',
          email: 'info@pharmaflow.com'
        },
        meta: {
          'Total Suppliers': allSuppliers.length,
          'Total Purchases': pdfCurrency(totalPurchases),
          'Total Paid': pdfCurrency(totalPaid),
          'Total Payable': pdfCurrency(totalDue)
        },
        columns: [
          { header: '#', key: 'no' },
          { header: 'Supplier', key: 'name' },
          { header: 'Company', key: 'company' },
          { header: 'Phone', key: 'phone' },
          { header: 'Contact', key: 'contact' },
          { header: 'Purchases', key: 'purchases' },
          { header: 'Paid', key: 'paid' },
          { header: 'Payable', key: 'payable' },
          { header: 'Status', key: 'status' }
        ],
        data: allSuppliers.map((s, i) => ({
          no: i + 1,
          name: s.name || '—',
          company: s.company || '—',
          phone: s.phone || '—',
          contact: s.contactPerson || '—',
          purchases: pdfCurrency(s.totalPurchase || 0),
          paid: pdfCurrency(s.totalPaid || 0),
          payable: s.dueBalance > 0 ? pdfCurrency(s.dueBalance) : '—',
          status: (s.status || '').toUpperCase()
        })),
        filename: 'suppliers-list'
      });

      toast.success(`PDF downloaded — ${allSuppliers.length} suppliers`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export PDF');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Suppliers"
        subtitle="Manage supplier relationships, purchase history and payable balances."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="hidden sm:inline">Exporting...</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export PDF</span>
              </>
            )}
          </Button>
        }
      />

      <div className="space-y-6">
        <SupplierStats stats={stats} isLoading={isLoading} />

        <Card className="overflow-hidden">
          <div className="p-4 border-b border-border">
            <SupplierFilters
              search={search}
              onSearchChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              dueFilter={dueFilter}
              onDueFilterChange={(v) => {
                setDueFilter(v);
                setPage(1);
              }}
              onExport={handleExport}
              onAdd={handleOpenCreate}
            />
          </div>

          <SupplierTable
            data={suppliers}
            isLoading={isLoading || isFetching}
            onView={handleOpenView}
            onEdit={handleOpenEdit}
            onDelete={setDeleteTarget}
            onPay={handleOpenPayment}
          />

          {pagination && pagination.total > 0 && (
            <div className="border-t border-border">
              <Pagination pagination={pagination} onPageChange={setPage} />
            </div>
          )}
        </Card>
      </div>

      <SupplierFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        supplier={editTarget}
        onSuccess={refetch}
      />

      <SupplierViewDialog
        open={viewOpen}
        onOpenChange={setViewOpen}
        supplierId={viewTarget?._id}
      />

      <PaymentDialog
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        supplier={paymentTarget}
        onSuccess={refetch}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title={`Delete "${deleteTarget?.name}"?`}
        description="This cannot be undone. Suppliers with purchases or due cannot be deleted."
        confirmText="Delete"
        variant="destructive"
        loading={isDeleting}
        onConfirm={handleDelete}
      />
    </>
  );
}