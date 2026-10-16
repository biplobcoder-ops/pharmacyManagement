import { useMemo, useState } from 'react';
import { Plus, Download, Loader2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import {
  subDays, startOfMonth, endOfMonth, startOfDay, endOfDay
} from 'date-fns';

import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Pagination from '@/components/common/Pagination';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { useDebounce } from '@/hooks/useDebounce';

import PurchaseStats from '../components/PurchaseStats';
import PurchaseFilters from '../components/PurchaseFilters';
import PurchaseTable from '../components/PurchaseTable';
import PurchaseFormDialog from '../components/PurchaseFormDialog';
import PurchaseViewDialog from '../components/PurchaseViewDialog';
import PurchaseReturnFormDialog from '../components/PurchaseReturnFormDialog';

import {
  useGetPurchasesQuery,
  useCancelPurchaseMutation,
  useDeletePurchaseMutation
} from '../purchaseApi';

// ✅ PDF Export
import { exportToPDF, pdfCurrency } from '@/lib/pdfExport';
import { formatDate } from '@/lib/utils';

export default function PurchaseListPage() {
  const user = useSelector((state) => state.auth.user);
  const branchId = useMemo(() => {
    if (!user?.branch) return null;
    if (typeof user.branch === 'string') return user.branch;
    return user.branch._id;
  }, [user]);

  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState('30days');
  const [paymentStatus, setPaymentStatus] = useState('all');
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewTarget, setViewTarget] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [returnOpen, setReturnOpen] = useState(false);
  const [returnTarget, setReturnTarget] = useState(null);

  const [isExporting, setIsExporting] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  const dateParams = useMemo(() => {
    const today = new Date();
    let start, end;

    switch (dateRange) {
      case 'today':
        start = startOfDay(today);
        end = endOfDay(today);
        break;
      case '7days':
        start = startOfDay(subDays(today, 7));
        end = endOfDay(today);
        break;
      case '30days':
        start = startOfDay(subDays(today, 30));
        end = endOfDay(today);
        break;
      case 'thisMonth':
        start = startOfMonth(today);
        end = endOfMonth(today);
        break;
      default:
        start = startOfDay(subDays(today, 30));
        end = endOfDay(today);
    }

    return {
      startDate: start.toISOString(),
      endDate: end.toISOString()
    };
  }, [dateRange]);

  const queryParams = useMemo(
    () => ({
      page,
      limit: 10,
      search: debouncedSearch || undefined,
      paymentStatus: paymentStatus === 'all' ? undefined : paymentStatus,
      ...dateParams
    }),
    [page, debouncedSearch, paymentStatus, dateParams]
  );

  const { data: res, isLoading } = useGetPurchasesQuery(queryParams, {
    refetchOnMountOrArgChange: true
  });
  const [cancelPurchase, { isLoading: isCancelling }] = useCancelPurchaseMutation();
  const [deletePurchase, { isLoading: isDeleting }] = useDeletePurchaseMutation();

  const purchases = res?.data?.purchases || [];
  const pagination = res?.data?.pagination;

  const stats = useMemo(() => {
    const totalPurchases = purchases.reduce((s, p) => s + p.total, 0);
    const totalPaid = purchases.reduce((s, p) => s + p.paidAmount, 0);
    const totalDue = purchases.reduce((s, p) => s + p.dueAmount, 0);
    const paidPercent =
      totalPurchases > 0 ? Math.round((totalPaid / totalPurchases) * 100) : 0;

    return {
      summary: {
        totalPurchases,
        totalPaid,
        totalDue,
        totalOrders: pagination?.total || purchases.length,
        paidPercent,
        supplierCount: new Set(purchases.map((p) => p.supplier?._id)).size
      }
    };
  }, [purchases, pagination]);

  const handleCancel = async () => {
    if (!cancelTarget) return;
    try {
      await cancelPurchase({
        id: cancelTarget._id,
        reason: 'Cancelled by user'
      }).unwrap();
      toast.success('Purchase cancelled');
      setCancelTarget(null);
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to cancel purchase');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deletePurchase(deleteTarget._id).unwrap();
      toast.success('Purchase deleted');
      setDeleteTarget(null);
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to delete purchase');
    }
  };

  const handleOpenReturn = (purchase) => {
    setReturnTarget(purchase._id);
    setReturnOpen(true);
  };

  // ✅ PDF Export
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const token = localStorage.getItem('accessToken');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

      const params = new URLSearchParams({ page: 1, limit: 1000 });

      if (debouncedSearch.trim()) params.set('search', debouncedSearch.trim());
      if (paymentStatus !== 'all') params.set('paymentStatus', paymentStatus);
      if (dateParams.startDate) params.set('startDate', dateParams.startDate);
      if (dateParams.endDate) params.set('endDate', dateParams.endDate);

      const res = await fetch(`${baseUrl}/purchases?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to fetch purchases');

      const json = await res.json();
      const allPurchases = json?.data?.purchases || [];

      if (allPurchases.length === 0) {
        toast.error('No purchases to export');
        return;
      }

      const totalAmount = allPurchases.reduce((s, x) => s + (x.total || 0), 0);
      const totalPaid = allPurchases.reduce((s, x) => s + (x.paidAmount || 0), 0);
      const totalDue = allPurchases.reduce((s, x) => s + (x.dueAmount || 0), 0);

      exportToPDF({
        title: 'Purchase Report',
        subtitle: `${allPurchases.length} purchases • ${dateRange}`,
        company: {
          name: 'PharmaFlow Pharmacy',
          address: 'Dhanmondi, Dhaka, Bangladesh',
          phone: '+8801700000000',
          email: 'info@pharmaflow.com'
        },
        meta: {
          'Total Purchases': allPurchases.length,
          'Total Amount': pdfCurrency(totalAmount),
          'Total Paid': pdfCurrency(totalPaid),
          'Total Due': pdfCurrency(totalDue),
          'Date Range': dateRange
        },
        columns: [
          { header: 'Invoice', key: 'invoice' },
          { header: 'Date', key: 'date' },
          { header: 'Supplier', key: 'supplier' },
          { header: 'Total', key: 'total' },
          { header: 'Paid', key: 'paid' },
          { header: 'Due', key: 'due' },
          { header: 'Status', key: 'status' }
        ],
        data: allPurchases.map((p) => ({
          invoice: p.invoiceNumber || '—',
          date: p.purchaseDate ? formatDate(p.purchaseDate) : '—',
          supplier: p.supplier?.name || '—',
          total: pdfCurrency(p.total || 0),
          paid: pdfCurrency(p.paidAmount || 0),
          due: pdfCurrency(p.dueAmount || 0),
          status: (p.paymentStatus || '').toUpperCase()
        })),
        filename: 'purchase-report'
      });

      toast.success(`PDF downloaded — ${allPurchases.length} purchases`);
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
        title="Purchases"
        subtitle="Create and track supplier purchases, payments and outstanding balances."
        actions={
          <>
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
            <Button
              size="sm"
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
              onClick={() => setFormOpen(true)}
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Create purchase</span>
            </Button>
          </>
        }
      />

      <div className="space-y-6">
        <PurchaseStats data={stats} isLoading={isLoading} />

        <Card className="overflow-hidden">
          <div className="p-4 border-b border-border">
            <PurchaseFilters
              search={search}
              onSearchChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              dateRange={dateRange}
              onDateRangeChange={(v) => {
                setDateRange(v);
                setPage(1);
              }}
              paymentStatus={paymentStatus}
              onPaymentStatusChange={(v) => {
                setPaymentStatus(v);
                setPage(1);
              }}
            />
          </div>

          <PurchaseTable
            data={purchases}
            isLoading={isLoading}
            onView={(p) => {
              setViewTarget(p);
              setViewOpen(true);
            }}
            onCancel={setCancelTarget}
            onDelete={setDeleteTarget}
            onReturn={handleOpenReturn}
          />

          {pagination && pagination.total > 0 && (
            <div className="border-t border-border">
              <Pagination pagination={pagination} onPageChange={setPage} />
            </div>
          )}
        </Card>
      </div>

      <PurchaseFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        branchId={branchId}
      />

      <PurchaseViewDialog
        open={viewOpen}
        onOpenChange={setViewOpen}
        purchaseId={viewTarget?._id}
      />

      <ConfirmDialog
        open={!!cancelTarget}
        onOpenChange={(o) => !o && setCancelTarget(null)}
        title={`Cancel purchase "${cancelTarget?.invoiceNumber}"?`}
        description="This will reverse the stock and supplier balance. This cannot be undone."
        confirmText="Cancel purchase"
        variant="destructive"
        loading={isCancelling}
        onConfirm={handleCancel}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title={`Delete purchase "${deleteTarget?.invoiceNumber}"?`}
        description="This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
        loading={isDeleting}
        onConfirm={handleDelete}
      />

      <PurchaseReturnFormDialog
        open={returnOpen}
        onOpenChange={setReturnOpen}
        purchaseId={returnTarget}
      />
    </>
  );
}