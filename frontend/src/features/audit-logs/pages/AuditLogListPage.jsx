import { useMemo, useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  startOfDay, endOfDay, subDays,
  startOfMonth, endOfMonth
} from 'date-fns';

import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Pagination from '@/components/common/Pagination';

import AuditLogStats from '../components/AuditLogStats';
import AuditLogFilters from '../components/AuditLogFilters';
import AuditLogTable from '../components/AuditLogTable';
import AuditLogViewDialog from '../components/AuditLogViewDialog';

import { useGetAuditLogsQuery } from '../auditLogsApi';
import { exportToPDF } from '@/lib/pdfExport';
import { formatDateTime } from '@/lib/utils';

export default function AuditLogListPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [actionFilter, setActionFilter] = useState('all');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [dateRange, setDateRange] = useState('last7days');

  const [viewOpen, setViewOpen] = useState(false);
  const [viewTarget, setViewTarget] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  const dateParams = useMemo(() => {
    const today = new Date();
    let start, end;
    switch (dateRange) {
      case 'today': start = startOfDay(today); end = endOfDay(today); break;
      case 'last7days': start = startOfDay(subDays(today, 6)); end = endOfDay(today); break;
      case 'last30days': start = startOfDay(subDays(today, 29)); end = endOfDay(today); break;
      case 'thisMonth': start = startOfMonth(today); end = endOfMonth(today); break;
      default: start = startOfDay(subDays(today, 6)); end = endOfDay(today);
    }
    return { startDate: start.toISOString(), endDate: end.toISOString() };
  }, [dateRange]);

  const queryParams = useMemo(() => {
    const p = { page, limit, ...dateParams };
    if (actionFilter !== 'all') p.action = actionFilter;
    if (moduleFilter !== 'all') p.module = moduleFilter;
    return p;
  }, [page, limit, dateParams, actionFilter, moduleFilter]);

  const { data: res, isLoading, isFetching } = useGetAuditLogsQuery(queryParams, {
    refetchOnMountOrArgChange: true,
    pollingInterval: 60000
  });

  const logs = res?.data?.logs || [];
  const pagination = res?.data?.pagination;

  const stats = useMemo(() => {
    const total = pagination?.total || logs.length;
    const creates = logs.filter((l) => l.action === 'create').length;
    const updates = logs.filter((l) => l.action === 'update').length;
    const deletes = logs.filter((l) => l.action === 'delete').length;
    return { total, creates, updates, deletes };
  }, [logs, pagination]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const token = localStorage.getItem('accessToken');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const params = new URLSearchParams({ page: 1, limit: 1000 });
      if (actionFilter !== 'all') params.set('action', actionFilter);
      if (moduleFilter !== 'all') params.set('module', moduleFilter);
      if (dateParams.startDate) params.set('startDate', dateParams.startDate);
      if (dateParams.endDate) params.set('endDate', dateParams.endDate);

      const res = await fetch(`${baseUrl}/audit-logs?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch audit logs');
      const json = await res.json();
      const allLogs = json?.data?.logs || [];

      if (allLogs.length === 0) {
        toast.error('No audit logs to export');
        return;
      }

      exportToPDF({
        title: 'Audit Log Report',
        subtitle: `${allLogs.length} logs • ${dateRange}`,
        company: { name: 'PharmaFlow Pharmacy', address: 'Dhanmondi, Dhaka, Bangladesh', phone: '+8801700000000', email: 'info@pharmaflow.com' },
        meta: { 'Total Logs': allLogs.length, 'Action Filter': actionFilter === 'all' ? 'All actions' : actionFilter, 'Module Filter': moduleFilter === 'all' ? 'All modules' : moduleFilter, 'Date Range': dateRange },
        columns: [
          { header: 'Time', key: 'time' }, { header: 'User', key: 'user' }, { header: 'Action', key: 'action' }, { header: 'Module', key: 'module' }, { header: 'IP Address', key: 'ip' }
        ],
        data: allLogs.map((log) => ({
          time: log.timestamp ? formatDateTime(log.timestamp) : '—',
          user: log.user?.name || 'System',
          action: (log.action || '').replace(/_/g, ' ').toUpperCase(),
          module: log.module || '—',
          ip: log.ip || '—'
        })),
        filename: 'audit-logs-report'
      });
      toast.success(`PDF downloaded — ${allLogs.length} logs`);
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
        title="Audit Logs"
        subtitle="Track all system activities and user actions."
        actions={
          <Button variant="outline" size="sm" onClick={handleExport} disabled={isExporting}>
            {isExporting ? <><Loader2 className="h-4 w-4 animate-spin" /><span className="hidden sm:inline">Exporting...</span></> : <><Download className="h-4 w-4" /><span className="hidden sm:inline">Export PDF</span></>}
          </Button>
        }
      />
      <div className="space-y-6">
        <AuditLogStats stats={stats} isLoading={isLoading} />
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-border">
            <AuditLogFilters
              actionFilter={actionFilter} onActionChange={(v) => { setActionFilter(v); setPage(1); }}
              moduleFilter={moduleFilter} onModuleChange={(v) => { setModuleFilter(v); setPage(1); }}
              dateRange={dateRange} onDateRangeChange={(v) => { setDateRange(v); setPage(1); }}
            />
          </div>
          <AuditLogTable data={logs} isLoading={isLoading || isFetching} onView={(log) => { setViewTarget(log); setViewOpen(true); }} />
          {pagination && pagination.total > 0 && (
            <div className="border-t border-border">
              <Pagination pagination={pagination} onPageChange={setPage} isLoading={isLoading || isFetching} />
            </div>
          )}
        </Card>
      </div>
      <AuditLogViewDialog open={viewOpen} onOpenChange={setViewOpen} logId={viewTarget?._id} />
    </>
  );
}