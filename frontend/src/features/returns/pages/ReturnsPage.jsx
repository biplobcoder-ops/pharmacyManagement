import { useMemo, useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import {
  startOfDay, endOfDay,
  startOfWeek, endOfWeek,
  startOfMonth, endOfMonth,
  subDays
} from 'date-fns';

import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Pagination from '@/components/common/Pagination';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';

import ReturnsStats from '../components/ReturnsStats';
import ReturnsFilters from '../components/ReturnsFilters';
import ReturnsTable from '../components/ReturnsTable';
import ReturnViewDialog from '../components/ReturnViewDialog';
import CancelReturnDialog from '../components/CancelReturnDialog';

import {
  useGetSalesReturnsQuery,
  useGetPurchaseReturnsQuery,
  useGetSalesReturnStatsQuery,
  useGetPurchaseReturnStatsQuery,
  useCancelSalesReturnMutation,
  useCancelPurchaseReturnMutation
} from '../returnsApi';

// ✅ PDF Export
import { exportToPDF, pdfCurrency } from '@/lib/pdfExport';
import { formatDate } from '@/lib/utils';

const TABS = [
  { value: 'sales', label: 'Sales Returns' },
  { value: 'purchase', label: 'Purchase Returns' }
];

export default function ReturnsPage() {
  const user = useSelector((state) => state.auth.user);
  const branchId = useMemo(() => {
    if (!user?.branch) return null;
    if (typeof user.branch === 'string') return user.branch;
    return user.branch._id;
  }, [user]);

  const [tab, setTab] = useState('sales');
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState('thisMonth');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);

  const [viewOpen, setViewOpen] = useState(false);
  const [viewTarget, setViewTarget] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
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
      case 'thisWeek':
        start = startOfWeek(today);
        end = endOfWeek(today);
        break;
      case 'thisMonth':
        start = startOfMonth(today);
        end = endOfMonth(today);
        break;
      case 'last30days':
        start = startOfDay(subDays(today, 30));
        end = endOfDay(today);
        break;
      default:
        start = startOfMonth(today);
        end = endOfMonth(today);
    }

    return {
      startDate: start.toISOString(),
      endDate: end.toISOString()
    };
  }, [dateRange]);

  const queryParams = useMemo(() => {
    const params = { page, limit: 10 };
    if (debouncedSearch && debouncedSearch.trim()) {
      params.search = debouncedSearch.trim();
    }
    if (status && status !== 'all') {
      params.status = status;
    }
    Object.assign(params, dateParams);
    return params;
  }, [page, debouncedSearch, status, dateParams]);

  const salesQuery = useGetSalesReturnsQuery(queryParams, {
    skip: tab !== 'sales',
    refetchOnMountOrArgChange: true
  });

  const purchaseQuery = useGetPurchaseReturnsQuery(queryParams, {
    skip: tab !== 'purchase',
    refetchOnMountOrArgChange: true
  });

  const { data: salesStatsRes, isLoading: salesStatsLoading } =
    useGetSalesReturnStatsQuery(
      branchId ? { branch: branchId } : {},
      { refetchOnMountOrArgChange: true }
    );

  const { data: purchaseStatsRes, isLoading: purchaseStatsLoading } =
    useGetPurchaseReturnStatsQuery(
      branchId ? { branch: branchId } : {},
      { refetchOnMountOrArgChange: true }
    );

  const [cancelSalesReturn, { isLoading: isCancellingSales }] =
    useCancelSalesReturnMutation();
  const [cancelPurchaseReturn, { isLoading: isCancellingPurchase }] =
    useCancelPurchaseReturnMutation();

  const activeQuery = tab === 'sales' ? salesQuery : purchaseQuery;
  const isCancelling = isCancellingSales || isCancellingPurchase;

  const extractReturns = (query) => {
    const d = query?.data;
    if (!d) return [];
    if (d?.data?.salesReturns) return d.data.salesReturns;
    if (d?.data?.purchaseReturns) return d.data.purchaseReturns;
    if (d?.salesReturns) return d.salesReturns;
    if (d?.purchaseReturns) return d.purchaseReturns;
    if (d?.data && Array.isArray(d.data)) return d.data;
    if (Array.isArray(d)) return d;
    return [];
  };

  const extractPagination = (query) => {
    const d = query?.data;
    if (!d) return null;
    return d?.data?.pagination || d?.pagination || null;
  };

  const returns = extractReturns(activeQuery);
  const pagination = extractPagination(activeQuery);
  const isLoading = activeQuery.isLoading || activeQuery.isFetching;

  const stats = useMemo(() => {
    const salesStats = salesStatsRes?.data || {};
    const purchaseStats = purchaseStatsRes?.data || {};

    return {
      salesReturns: salesStats.total || 0,
      salesCount: salesStats.totalCount || 0,
      purchaseReturns: purchaseStats.total || 0,
      purchaseCount: purchaseStats.totalCount || 0,
      pendingCount: (salesStats.pendingCount || 0) + (purchaseStats.pendingCount || 0)
    };
  }, [salesStatsRes, purchaseStatsRes]);

  const statsLoading = salesStatsLoading || purchaseStatsLoading;

  const handleCancel = async (reason) => {
    if (!cancelTarget) return;
    try {
      if (tab === 'sales') {
        await cancelSalesReturn({ id: cancelTarget._id, reason }).unwrap();
      } else {
        await cancelPurchaseReturn({ id: cancelTarget._id, reason }).unwrap();
      }
      toast.success('Return cancelled');
      setCancelTarget(null);
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to cancel return');
    }
  };

  // ✅ PDF Export handler — tab onujayi
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const token = localStorage.getItem('accessToken');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

      const params = new URLSearchParams({ page: 1, limit: 1000 });
      if (debouncedSearch.trim()) params.set('search', debouncedSearch.trim());
      if (status !== 'all') params.set('status', status);
      if (dateParams.startDate) params.set('startDate', dateParams.startDate);
      if (dateParams.endDate) params.set('endDate', dateParams.endDate);

      if (tab === 'sales') {
        const res = await fetch(`${baseUrl}/sales-returns?${params}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('Failed to fetch sales returns');

        const json = await res.json();
        const allReturns = json?.data?.salesReturns || [];

        if (allReturns.length === 0) {
          toast.error('No sales returns to export');
          return;
        }

        const totalAmount = allReturns.reduce((s, x) => s + (x.total || 0), 0);

        exportToPDF({
          title: 'Sales Returns Report',
          subtitle: `${allReturns.length} returns • ${dateRange}`,
          company: {
            name: 'PharmaFlow Pharmacy',
            address: 'Dhanmondi, Dhaka, Bangladesh',
            phone: '+8801700000000',
            email: 'info@pharmaflow.com'
          },
          meta: {
            'Total Returns': allReturns.length,
            'Total Amount': pdfCurrency(totalAmount),
            'Date Range': dateRange
          },
          columns: [
            { header: 'Return No', key: 'returnNo' },
            { header: 'Date', key: 'date' },
            { header: 'Customer', key: 'customer' },
            { header: 'Original Sale', key: 'original' },
            { header: 'Amount', key: 'amount' },
            { header: 'Status', key: 'status' }
          ],
          data: allReturns.map((r) => ({
            returnNo: r.returnNumber || '—',
            date: r.returnDate ? formatDate(r.returnDate) : '—',
            customer: r.customer?.name || 'Walk-in',
            original: r.sale?.invoiceNumber || '—',
            amount: pdfCurrency(r.total || 0),
            status: (r.status || '').toUpperCase()
          })),
          filename: 'sales-returns'
        });

        toast.success(`PDF downloaded — ${allReturns.length} returns`);
      } else {
        const res = await fetch(`${baseUrl}/purchase-returns?${params}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('Failed to fetch purchase returns');

        const json = await res.json();
        const allReturns = json?.data?.purchaseReturns || [];

        if (allReturns.length === 0) {
          toast.error('No purchase returns to export');
          return;
        }

        const totalAmount = allReturns.reduce((s, x) => s + (x.total || 0), 0);

        exportToPDF({
          title: 'Purchase Returns Report',
          subtitle: `${allReturns.length} returns • ${dateRange}`,
          company: {
            name: 'PharmaFlow Pharmacy',
            address: 'Dhanmondi, Dhaka, Bangladesh',
            phone: '+8801700000000',
            email: 'info@pharmaflow.com'
          },
          meta: {
            'Total Returns': allReturns.length,
            'Total Amount': pdfCurrency(totalAmount),
            'Date Range': dateRange
          },
          columns: [
            { header: 'Return No', key: 'returnNo' },
            { header: 'Date', key: 'date' },
            { header: 'Supplier', key: 'supplier' },
            { header: 'Original Purchase', key: 'original' },
            { header: 'Amount', key: 'amount' },
            { header: 'Status', key: 'status' }
          ],
          data: allReturns.map((r) => ({
            returnNo: r.returnNumber || '—',
            date: r.returnDate ? formatDate(r.returnDate) : '—',
            supplier: r.supplier?.name || '—',
            original: r.purchase?.invoiceNumber || '—',
            amount: pdfCurrency(r.total || 0),
            status: (r.status || '').toUpperCase()
          })),
          filename: 'purchase-returns'
        });

        toast.success(`PDF downloaded — ${allReturns.length} returns`);
      }
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
        title="Returns"
        subtitle="Process sales and purchase returns against original transactions."
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
                <span className="hidden sm:inline">
                  Export {tab === 'sales' ? 'Sales' : 'Purchase'}
                </span>
              </>
            )}
          </Button>
        }
      />

      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-border">
          {TABS.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => {
                setTab(t.value);
                setPage(1);
              }}
              className={cn(
                'px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
                tab === t.value
                  ? 'border-accent text-accent'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <ReturnsStats stats={stats} isLoading={statsLoading} />

        <Card className="overflow-hidden">
          <div className="p-4 border-b border-border">
            <ReturnsFilters
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
              status={status}
              onStatusChange={(v) => {
                setStatus(v);
                setPage(1);
              }}
              onExport={handleExport}
            />
          </div>

          <ReturnsTable
            data={returns}
            isLoading={isLoading}
            type={tab}
            onView={(r) => {
              setViewTarget(r);
              setViewOpen(true);
            }}
            onCancel={setCancelTarget}
          />

          {pagination && pagination.total > 0 && (
            <div className="border-t border-border">
              <Pagination pagination={pagination} onPageChange={setPage} />
            </div>
          )}
        </Card>
      </div>

      <ReturnViewDialog
        open={viewOpen}
        onOpenChange={setViewOpen}
        returnId={viewTarget?._id}
        type={tab}
      />

      <CancelReturnDialog
        open={!!cancelTarget}
        onOpenChange={(o) => !o && setCancelTarget(null)}
        returnDoc={cancelTarget}
        isLoading={isCancelling}
        onConfirm={handleCancel}
      />
    </>
  );
}