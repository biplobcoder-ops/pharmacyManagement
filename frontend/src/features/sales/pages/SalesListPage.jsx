import { useMemo, useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays } from 'date-fns';

import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Pagination from '@/components/common/Pagination';
import { useDebounce } from '@/hooks/useDebounce';

import SalesStats from '../components/SalesStats';
import SalesFilters from '../components/SalesFilters';
import SalesTable from '../components/SalesTable';
import SaleViewDialog from '../components/SaleViewDialog';
import CancelSaleDialog from '../components/CancelSaleDialog';
import SalesReturnFormDialog from '../components/SalesReturnFormDialog';

import { useGetSalesQuery, useGetSalesStatsQuery, useCancelSaleMutation, useGetCustomersQuery } from '../salesApi';
import { exportToPDF, pdfCurrency } from '@/lib/pdfExport';
import { formatDate } from '@/lib/utils';

export default function SalesListPage() {
  const user = useSelector((state) => state.auth.user);
  const branchId = useMemo(() => {
    if (!user?.branch) return null;
    if (typeof user.branch === 'string') return user.branch;
    return user.branch._id;
  }, [user]);

  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState('today');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('all');
  const [customerId, setCustomerId] = useState('all');
  const [page, setPage] = useState(1);

  const [viewOpen, setViewOpen] = useState(false);
  const [viewTarget, setViewTarget] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [returnOpen, setReturnOpen] = useState(false);
  const [returnTarget, setReturnTarget] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  const dateParams = useMemo(() => {
    const today = new Date();
    let start, end;
    switch (dateRange) {
      case 'today': start = startOfDay(today); end = endOfDay(today); break;
      case 'yesterday': start = startOfDay(subDays(today, 1)); end = endOfDay(subDays(today, 1)); break;
      case 'thisWeek': start = startOfWeek(today); end = endOfWeek(today); break;
      case 'thisMonth': start = startOfMonth(today); end = endOfMonth(today); break;
      case 'thisYear': start = startOfYear(today); end = endOfYear(today); break;
      case 'last7days': start = startOfDay(subDays(today, 7)); end = endOfDay(today); break;
      case 'last30days': start = startOfDay(subDays(today, 30)); end = endOfDay(today); break;
      case 'custom': return { startDate: startDate ? new Date(startDate).toISOString() : undefined, endDate: endDate ? new Date(endDate).toISOString() : undefined };
      default: start = startOfDay(today); end = endOfDay(today);
    }
    return { startDate: start.toISOString(), endDate: end.toISOString() };
  }, [dateRange, startDate, endDate]);

  const queryParams = useMemo(
    () => ({ page, limit: 10, search: debouncedSearch || undefined, paymentStatus: paymentStatus === 'all' ? undefined : paymentStatus, customer: customerId === 'all' ? undefined : customerId, ...dateParams }),
    [page, debouncedSearch, paymentStatus, customerId, dateParams]
  );

  const { data: res, isLoading, isFetching } = useGetSalesQuery(queryParams, { refetchOnMountOrArgChange: true });
  const { data: statsRes, isLoading: statsLoading } = useGetSalesStatsQuery(branchId ? { branch: branchId } : {}, { refetchOnMountOrArgChange: true });
  const { data: customersRes } = useGetCustomersQuery();
  const [cancelSale, { isLoading: isCancelling }] = useCancelSaleMutation();

  const sales = res?.data?.sales || [];
  const pagination = res?.data?.pagination;
  const customers = customersRes?.data?.customers || [];
  const stats = statsRes?.data || {};

  const handleCancel = async (reason) => {
    if (!cancelTarget) return;
    try { await cancelSale({ id: cancelTarget._id, reason }).unwrap(); toast.success('Sale cancelled'); setCancelTarget(null); } 
    catch (error) { toast.error(error?.data?.message || 'Failed to cancel sale'); }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const token = localStorage.getItem('accessToken');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const params = new URLSearchParams({ page: 1, limit: 1000 });
      if (debouncedSearch.trim()) params.set('search', debouncedSearch.trim());
      if (paymentStatus !== 'all') params.set('paymentStatus', paymentStatus);
      if (customerId !== 'all') params.set('customer', customerId);
      if (dateParams.startDate) params.set('startDate', dateParams.startDate);
      if (dateParams.endDate) params.set('endDate', dateParams.endDate);
      const res = await fetch(`${baseUrl}/sales?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to fetch sales');
      const json = await res.json();
      const allSales = json?.data?.sales || [];
      if (allSales.length === 0) { toast.error('No sales to export'); return; }
      const totalAmount = allSales.reduce((s, x) => s + (x.total || 0), 0);
      const totalPaid = allSales.reduce((s, x) => s + (x.paidAmount || 0), 0);
      const totalDue = allSales.reduce((s, x) => s + (x.dueAmount || 0), 0);
      exportToPDF({
        title: 'Sales Report', subtitle: `${allSales.length} sales • ${dateRange}`, company: { name: 'PharmaFlow Pharmacy', address: 'Dhanmondi, Dhaka, Bangladesh', phone: '+8801700000000', email: 'info@pharmaflow.com' },
        meta: { 'Total Sales': allSales.length, 'Total Amount': pdfCurrency(totalAmount), 'Total Paid': pdfCurrency(totalPaid), 'Total Due': pdfCurrency(totalDue), 'Date Range': dateRange },
        columns: [{ header: 'Invoice', key: 'invoice' }, { header: 'Date', key: 'date' }, { header: 'Customer', key: 'customer' }, { header: 'Total', key: 'total' }, { header: 'Paid', key: 'paid' }, { header: 'Due', key: 'due' }, { header: 'Status', key: 'status' }],
        data: allSales.map((s) => ({ invoice: s.invoiceNumber || '—', date: s.saleDate ? formatDate(s.saleDate) : '—', customer: s.customerName || 'Walk-in', total: pdfCurrency(s.total || 0), paid: pdfCurrency(s.paidAmount || 0), due: pdfCurrency(s.dueAmount || 0), status: (s.paymentStatus || '').toUpperCase() })),
        filename: 'sales-report'
      });
      toast.success(`PDF downloaded — ${allSales.length} sales`);
    } catch (error) { console.error('Export error:', error); toast.error('Failed to export PDF'); } finally { setIsExporting(false); }
  };

  const handlePrint = () => toast('Print feature coming soon');
  const handleOpenReturn = (sale) => { setReturnTarget(sale._id); setReturnOpen(true); };

  return (
    <>
      <PageHeader
        title="Sales" subtitle="View, filter and manage all sales transactions."
        actions={
          <Button variant="outline" size="sm" onClick={handleExport} disabled={isExporting}>
            {isExporting ? <><Loader2 className="h-4 w-4 animate-spin" /><span className="hidden sm:inline">Exporting...</span></> : <><Download className="h-4 w-4" /><span className="hidden sm:inline">Export PDF</span></>}
          </Button>
        }
      />
      <div className="space-y-6">
        <SalesStats stats={stats} isLoading={statsLoading} />
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-border">
            <SalesFilters
              search={search} onSearchChange={(v) => { setSearch(v); setPage(1); }}
              dateRange={dateRange} onDateRangeChange={(v) => { setDateRange(v); setPage(1); }}
              startDate={startDate} endDate={endDate} onStartDateChange={setStartDate} onEndDateChange={setEndDate}
              paymentStatus={paymentStatus} onPaymentStatusChange={(v) => { setPaymentStatus(v); setPage(1); }}
              customerId={customerId} onCustomerChange={(v) => { setCustomerId(v); setPage(1); }}
              customers={customers} onExport={handleExport}
            />
          </div>
          <SalesTable data={sales} isLoading={isLoading || isFetching} onView={(s) => { setViewTarget(s); setViewOpen(true); }} onCancel={setCancelTarget} onReturn={handleOpenReturn} onPrint={handlePrint} />
          {pagination && pagination.total > 0 && (
            <div className="border-t border-border">
              <Pagination pagination={pagination} onPageChange={setPage} isLoading={isLoading || isFetching} />
            </div>
          )}
        </Card>
      </div>
      <SaleViewDialog open={viewOpen} onOpenChange={setViewOpen} saleId={viewTarget?._id} onPrint={handlePrint} />
      <CancelSaleDialog open={!!cancelTarget} onOpenChange={(o) => !o && setCancelTarget(null)} sale={cancelTarget} isLoading={isCancelling} onConfirm={handleCancel} />
      <SalesReturnFormDialog open={returnOpen} onOpenChange={setReturnOpen} saleId={returnTarget} />
    </>
  );
}