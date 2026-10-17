import { useMemo, useState } from 'react';
import { Download, Plus, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays } from 'date-fns';

import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Pagination from '@/components/common/Pagination';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';

import FinanceStats from '../components/FinanceStats';
import FinanceFilters from '../components/FinanceFilters';
import PaymentsTable from '../components/PaymentsTable';
import ExpensesTable from '../components/ExpensesTable';
import PaymentViewDialog from '../components/PaymentViewDialog';
import ExpenseViewDialog from '../components/ExpenseViewDialog';
import ExpenseFormDialog from '../components/ExpenseFormDialog';

import { useGetPaymentsQuery, useGetExpensesQuery, useDeletePaymentMutation, useDeleteExpenseMutation, useGetFinanceStatsQuery } from '../financeApi';
import { exportToPDF, pdfCurrency } from '@/lib/pdfExport';
import { formatDate } from '@/lib/utils';

const TABS = [{ value: 'payments', label: 'Payments' }, { value: 'expenses', label: 'Expenses' }];

export default function FinancePage() {
  const [tab, setTab] = useState('payments');
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState('thisMonth');
  const [method, setMethod] = useState('all');
  const [page, setPage] = useState(1);

  const [paymentViewOpen, setPaymentViewOpen] = useState(false);
  const [paymentViewTarget, setPaymentViewTarget] = useState(null);
  const [paymentDeleteTarget, setPaymentDeleteTarget] = useState(null);

  const [expenseFormOpen, setExpenseFormOpen] = useState(false);
  const [expenseEditTarget, setExpenseEditTarget] = useState(null);
  const [expenseViewOpen, setExpenseViewOpen] = useState(false);
  const [expenseViewTarget, setExpenseViewTarget] = useState(null);
  const [expenseDeleteTarget, setExpenseDeleteTarget] = useState(null);

  const [isExporting, setIsExporting] = useState(false);
  const debouncedSearch = useDebounce(search, 400);

  const dateParams = useMemo(() => {
    const today = new Date();
    let start, end;
    switch (dateRange) {
      case 'today': start = startOfDay(today); end = endOfDay(today); break;
      case 'thisWeek': start = startOfWeek(today); end = endOfWeek(today); break;
      case 'thisMonth': start = startOfMonth(today); end = endOfMonth(today); break;
      case 'last30days': start = startOfDay(subDays(today, 30)); end = endOfDay(today); break;
      default: start = startOfMonth(today); end = endOfMonth(today);
    }
    return { startDate: start.toISOString(), endDate: end.toISOString() };
  }, [dateRange]);

  const queryParams = useMemo(() => {
    const params = { page, limit: 10 };
    if (debouncedSearch && debouncedSearch.trim()) params.search = debouncedSearch.trim();
    if (method && method !== 'all') params.method = method;
    Object.assign(params, dateParams);
    return params;
  }, [page, debouncedSearch, method, dateParams]);

  const paymentsQuery = useGetPaymentsQuery(queryParams, { skip: tab !== 'payments', refetchOnMountOrArgChange: true });
  const expensesQuery = useGetExpensesQuery(queryParams, { skip: tab !== 'expenses', refetchOnMountOrArgChange: true });
  const { data: statsRes, isLoading: statsLoading } = useGetFinanceStatsQuery(undefined, { refetchOnMountOrArgChange: true });
  const [deletePayment, { isLoading: isDeletingPayment }] = useDeletePaymentMutation();
  const [deleteExpense, { isLoading: isDeletingExpense }] = useDeleteExpenseMutation();

  const activeQuery = tab === 'payments' ? paymentsQuery : expensesQuery;
  const isLoading = activeQuery.isLoading || activeQuery.isFetching;

  const payments = paymentsQuery.data?.data?.payments || [];
  const expenses = expensesQuery.data?.data?.expenses || [];
  const pagination = activeQuery.data?.data?.pagination || null;

  const stats = useMemo(() => {
    const d = statsRes?.data;
    if (!d) return { netIncome: 0, customerDue: 0, customerDueCount: 0, supplierDue: 0, supplierDueCount: 0, totalExpenses: 0, expenseCount: 0, periodLabel: 'Last month' };
    return { netIncome: d.netProfit || 0, customerDue: d.receivables?.customerDue || 0, customerDueCount: d.receivables?.customerCount || 0, supplierDue: d.payables?.supplierDue || 0, supplierDueCount: d.payables?.supplierCount || 0, totalExpenses: d.expenses || 0, expenseCount: d.expenseCount ?? 0, periodLabel: d.period?.label || 'Last month' };
  }, [statsRes]);

  const handleDeletePayment = async () => {
    if (!paymentDeleteTarget) return;
    try { await deletePayment(paymentDeleteTarget._id).unwrap(); toast.success('Payment deleted'); setPaymentDeleteTarget(null); } 
    catch (error) { toast.error(error?.data?.message || 'Failed to delete payment'); }
  };

  const handleDeleteExpense = async () => {
    if (!expenseDeleteTarget) return;
    try { await deleteExpense(expenseDeleteTarget._id).unwrap(); toast.success('Expense deleted'); setExpenseDeleteTarget(null); } 
    catch (error) { toast.error(error?.data?.message || 'Failed to delete expense'); }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const token = localStorage.getItem('accessToken');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const params = new URLSearchParams({ page: 1, limit: 1000 });
      if (debouncedSearch.trim()) params.set('search', debouncedSearch.trim());
      if (method !== 'all') params.set('method', method);
      if (dateParams.startDate) params.set('startDate', dateParams.startDate);
      if (dateParams.endDate) params.set('endDate', dateParams.endDate);

      if (tab === 'payments') {
        const res = await fetch(`${baseUrl}/payments?${params}`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error('Failed to fetch payments');
        const json = await res.json();
        const allPayments = json?.data?.payments || [];
        if (allPayments.length === 0) { toast.error('No payments to export'); return; }
        const totalAmount = allPayments.reduce((s, x) => s + (x.amount || 0), 0);
        exportToPDF({
          title: 'Payments Report', subtitle: `${allPayments.length} payments • ${dateRange}`, company: { name: 'PharmaFlow Pharmacy', address: 'Dhanmondi, Dhaka, Bangladesh', phone: '+8801700000000', email: 'info@pharmaflow.com' },
          meta: { 'Total Payments': allPayments.length, 'Total Amount': pdfCurrency(totalAmount), 'Date Range': dateRange },
          columns: [{ header: 'Ref No', key: 'ref' }, { header: 'Date', key: 'date' }, { header: 'Type', key: 'type' }, { header: 'Party', key: 'party' }, { header: 'Method', key: 'method' }, { header: 'Amount', key: 'amount' }],
          data: allPayments.map((p) => ({ ref: p.paymentNumber || '—', date: p.date ? formatDate(p.date) : '—', type: p.type === 'customer' ? 'Customer' : 'Supplier', party: p.customer?.name || p.supplier?.name || '—', method: (p.method || '').toUpperCase(), amount: pdfCurrency(p.amount || 0) })),
          filename: 'payments-report'
        });
        toast.success(`PDF downloaded — ${allPayments.length} payments`);
      } else {
        const res = await fetch(`${baseUrl}/expenses?${params}`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error('Failed to fetch expenses');
        const json = await res.json();
        const allExpenses = json?.data?.expenses || [];
        if (allExpenses.length === 0) { toast.error('No expenses to export'); return; }
        const totalAmount = allExpenses.reduce((s, x) => s + (x.amount || 0), 0);
        exportToPDF({
          title: 'Expenses Report', subtitle: `${allExpenses.length} expenses • ${dateRange}`, company: { name: 'PharmaFlow Pharmacy', address: 'Dhanmondi, Dhaka, Bangladesh', phone: '+8801700000000', email: 'info@pharmaflow.com' },
          meta: { 'Total Expenses': allExpenses.length, 'Total Amount': pdfCurrency(totalAmount), 'Date Range': dateRange },
          columns: [{ header: 'Ref No', key: 'ref' }, { header: 'Date', key: 'date' }, { header: 'Category', key: 'category' }, { header: 'Title', key: 'title' }, { header: 'Method', key: 'method' }, { header: 'Amount', key: 'amount' }],
          data: allExpenses.map((e) => ({ ref: e.expenseNumber || '—', date: e.date ? formatDate(e.date) : '—', category: (e.category || '').toUpperCase(), title: e.title || '—', method: (e.paymentMethod || '').toUpperCase(), amount: pdfCurrency(e.amount || 0) })),
          filename: 'expenses-report'
        });
        toast.success(`PDF downloaded — ${allExpenses.length} expenses`);
      }
    } catch (error) { console.error('Export error:', error); toast.error('Failed to export PDF'); } finally { setIsExporting(false); }
  };

  return (
    <>
      <PageHeader
        title="Finance" subtitle="Track dues, payments, expenses, income and business profitability."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={handleExport} disabled={isExporting}>
              {isExporting ? <><Loader2 className="h-4 w-4 animate-spin" /><span className="hidden sm:inline">Exporting...</span></> : <><Download className="h-4 w-4" /><span className="hidden sm:inline">Export {tab === 'payments' ? 'Payments' : 'Expenses'}</span></>}
            </Button>
            {tab === 'expenses' && (
              <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground" onClick={() => { setExpenseEditTarget(null); setExpenseFormOpen(true); }}>
                <Plus className="h-4 w-4" /><span className="hidden sm:inline">Add expense</span>
              </Button>
            )}
          </>
        }
      />
      <div className="space-y-6">
        <div className="flex items-center gap-1 border-b border-border">
          {TABS.map((t) => (
            <button key={t.value} type="button" onClick={() => { setTab(t.value); setPage(1); }} className={cn('px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px', tab === t.value ? 'border-accent text-accent' : 'border-transparent text-muted-foreground hover:text-foreground')}>
              {t.label}
            </button>
          ))}
        </div>
        <FinanceStats stats={stats} isLoading={statsLoading} />
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-border">
            <FinanceFilters
              search={search} onSearchChange={(v) => { setSearch(v); setPage(1); }}
              dateRange={dateRange} onDateRangeChange={(v) => { setDateRange(v); setPage(1); }}
              method={method} onMethodChange={(v) => { setMethod(v); setPage(1); }} onExport={handleExport}
            />
          </div>
          {tab === 'payments' ? (
            <PaymentsTable data={payments} isLoading={isLoading} onView={(r) => { setPaymentViewTarget(r); setPaymentViewOpen(true); }} onDelete={setPaymentDeleteTarget} />
          ) : (
            <ExpensesTable data={expenses} isLoading={isLoading} onView={(r) => { setExpenseViewTarget(r); setExpenseViewOpen(true); }} onEdit={(r) => { setExpenseEditTarget(r); setExpenseFormOpen(true); }} onDelete={setExpenseDeleteTarget} />
          )}
          {pagination && pagination.total > 0 && (
            <div className="border-t border-border">
              <Pagination pagination={pagination} onPageChange={setPage} isLoading={isLoading} />
            </div>
          )}
        </Card>
      </div>

      <PaymentViewDialog open={paymentViewOpen} onOpenChange={setPaymentViewOpen} paymentId={paymentViewTarget?._id} />
      <ConfirmDialog open={!!paymentDeleteTarget} onOpenChange={(o) => !o && setPaymentDeleteTarget(null)} title={`Delete payment "${paymentDeleteTarget?.paymentNumber}"?`} description="Customer/Supplier due will be reversed. This cannot be undone." confirmText="Delete" variant="destructive" loading={isDeletingPayment} onConfirm={handleDeletePayment} />
      <ExpenseFormDialog open={expenseFormOpen} onOpenChange={setExpenseFormOpen} expense={expenseEditTarget} />
      <ExpenseViewDialog open={expenseViewOpen} onOpenChange={setExpenseViewOpen} expenseId={expenseViewTarget?._id} />
      <ConfirmDialog open={!!expenseDeleteTarget} onOpenChange={(o) => !o && setExpenseDeleteTarget(null)} title={`Delete expense "${expenseDeleteTarget?.expenseNumber}"?`} description="This action cannot be undone." confirmText="Delete" variant="destructive" loading={isDeletingExpense} onConfirm={handleDeleteExpense} />
    </>
  );
}