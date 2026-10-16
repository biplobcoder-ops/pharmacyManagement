import { useMemo, useState } from 'react';
import { Plus, Download, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Pagination from '@/components/common/Pagination';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { useDebounce } from '@/hooks/useDebounce';

import InventoryStats from '../components/InventoryStats';
import InventoryTabs from '../components/InventoryTabs';
import InventoryFilters from '../components/InventoryFilters';
import InventoryTable from '../components/InventoryTable';
import StockAdjustmentDialog from '../components/StockAdjustmentDialog';
import BatchSelectDialog from '../components/BatchSelectDialog';

import {
  useGetCurrentStockQuery,
  useGetExpiringBatchesQuery,
  useGetExpiredBatchesQuery,
  useGetStockMovementsQuery,
  useDeleteBatchMutation
} from '../inventoryApi';

// ✅ PDF Export
import { exportToPDF, pdfCurrency } from '@/lib/pdfExport';
import { formatDate, formatNumber } from '@/lib/utils';

export default function InventoryPage() {
  const [tab, setTab] = useState('stock');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const [batchSelectOpen, setBatchSelectOpen] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustTarget, setAdjustTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [isExporting, setIsExporting] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  const queryParams = useMemo(
    () => ({ page, limit: 10, search: debouncedSearch || undefined }),
    [page, debouncedSearch]
  );

  // Tab queries
  const stockQuery = useGetCurrentStockQuery(queryParams, { skip: tab !== 'stock' });
  const expiringQuery = useGetExpiringBatchesQuery(
    { days: 90 },
    { skip: tab !== 'expiring' }
  );
  const expiredQuery = useGetExpiredBatchesQuery(undefined, { skip: tab !== 'expired' });
  const movementsQuery = useGetStockMovementsQuery(queryParams, {
    skip: tab !== 'movements'
  });

  const activeQuery =
    tab === 'stock'
      ? stockQuery
      : tab === 'expiring'
      ? expiringQuery
      : tab === 'expired'
      ? expiredQuery
      : movementsQuery;

  const data =
    tab === 'stock'
      ? stockQuery.data?.data?.batches
      : tab === 'expiring'
      ? expiringQuery.data?.data?.batches
      : tab === 'expired'
      ? expiredQuery.data?.data?.batches
      : movementsQuery.data?.data?.movements;

  const pagination = stockQuery.data?.data?.pagination;
  const isLoading = activeQuery.isLoading;

  const [deleteBatch, { isLoading: isDeleting }] = useDeleteBatchMutation();

  const stats = useMemo(() => {
    const batches = stockQuery.data?.data?.batches || [];
    const paginationData = stockQuery.data?.data?.pagination;
    const summaryData = stockQuery.data?.data?.summary;

    const costValue = summaryData?.totalStockValue || 0;
    const totalUnits = batches.reduce((sum, b) => sum + (b.quantity || 0), 0);
    const batchCount = paginationData?.total || batches.length || 0;

    return {
      costValue,
      totalUnits,
      batchCount,
      atRiskValue: 48620,
      stockHealth: 94.2
    };
  }, [stockQuery.data]);

  const handleOpenTopAdjust = () => {
    setBatchSelectOpen(true);
  };

  const handleBatchSelected = (batch) => {
    setAdjustTarget(batch);
    setAdjustOpen(true);
  };

  const handleEdit = (batch) => {
    setAdjustTarget(batch);
    setAdjustOpen(true);
  };

  const handleDelete = (batch) => {
    setDeleteTarget(batch);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteBatch(deleteTarget._id).unwrap();
      toast.success('Batch deleted');
      setDeleteTarget(null);
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to delete batch');
    }
  };

  const handleTabChange = (newTab) => {
    setTab(newTab);
    setPage(1);
  };

  // ✅ PDF Export — tab onujayi
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const token = localStorage.getItem('accessToken');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

      if (tab === 'stock') {
        const params = new URLSearchParams({ page: 1, limit: 1000 });
        if (debouncedSearch.trim()) params.set('search', debouncedSearch.trim());

        const res = await fetch(`${baseUrl}/inventory?${params}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('Failed to fetch inventory');

        const json = await res.json();
        const batches = json?.data?.batches || [];

        if (batches.length === 0) {
          toast.error('No inventory data to export');
          return;
        }

        const totalValue = batches.reduce(
          (s, b) => s + (b.quantity || 0) * (b.purchasePrice || 0),
          0
        );
        const totalUnits = batches.reduce((s, b) => s + (b.quantity || 0), 0);

        exportToPDF({
          title: 'Current Stock Report',
          subtitle: `${batches.length} batches`,
          company: {
            name: 'PharmaFlow Pharmacy',
            address: 'Dhanmondi, Dhaka, Bangladesh',
            phone: '+8801700000000',
            email: 'info@pharmaflow.com'
          },
          meta: {
            'Total Batches': batches.length,
            'Total Units': formatNumber(totalUnits),
            'Stock Value': pdfCurrency(totalValue)
          },
          columns: [
            { header: 'Medicine', key: 'medicine' },
            { header: 'Batch', key: 'batch' },
            { header: 'Expiry', key: 'expiry' },
            { header: 'Qty', key: 'qty' },
            { header: 'Cost', key: 'cost' },
            { header: 'Selling', key: 'selling' },
            { header: 'Value', key: 'value' }
          ],
          data: batches.map((b) => ({
            medicine: b.medicine?.name || '—',
            batch: b.batchNumber || '—',
            expiry: b.expiryDate ? formatDate(b.expiryDate) : '—',
            qty: formatNumber(b.quantity || 0),
            cost: pdfCurrency(b.purchasePrice || 0),
            selling: pdfCurrency(b.sellingPrice || 0),
            value: pdfCurrency((b.quantity || 0) * (b.purchasePrice || 0))
          })),
          filename: 'current-stock'
        });

        toast.success(`PDF downloaded — ${batches.length} batches`);
      } else if (tab === 'expiring') {
        const res = await fetch(`${baseUrl}/batches/expiring?days=90`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('Failed to fetch expiring batches');

        const json = await res.json();
        const batches = json?.data?.batches || [];

        if (batches.length === 0) {
          toast.error('No expiring batches to export');
          return;
        }

        exportToPDF({
          title: 'Expiring Batches Report',
          subtitle: `Within 90 days • ${batches.length} batches`,
          company: {
            name: 'PharmaFlow Pharmacy',
            address: 'Dhanmondi, Dhaka, Bangladesh',
            phone: '+8801700000000',
            email: 'info@pharmaflow.com'
          },
          meta: {
            'Total Batches': batches.length,
            'Threshold': '90 days'
          },
          columns: [
            { header: 'Medicine', key: 'medicine' },
            { header: 'Batch', key: 'batch' },
            { header: 'Expiry Date', key: 'expiry' },
            { header: 'Days Left', key: 'days' },
            { header: 'Qty', key: 'qty' },
            { header: 'Value', key: 'value' }
          ],
          data: batches.map((b) => {
            const daysLeft = Math.ceil(
              (new Date(b.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)
            );
            return {
              medicine: b.medicine?.name || '—',
              batch: b.batchNumber || '—',
              expiry: b.expiryDate ? formatDate(b.expiryDate) : '—',
              days: daysLeft,
              qty: formatNumber(b.quantity || 0),
              value: pdfCurrency((b.quantity || 0) * (b.purchasePrice || 0))
            };
          }),
          filename: 'expiring-batches'
        });

        toast.success(`PDF downloaded — ${batches.length} expiring batches`);
      } else if (tab === 'expired') {
        const res = await fetch(`${baseUrl}/batches/expired`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('Failed to fetch expired batches');

        const json = await res.json();
        const batches = json?.data?.batches || [];

        if (batches.length === 0) {
          toast.error('No expired batches to export');
          return;
        }

        exportToPDF({
          title: 'Expired Batches Report',
          subtitle: `${batches.length} batches`,
          company: {
            name: 'PharmaFlow Pharmacy',
            address: 'Dhanmondi, Dhaka, Bangladesh',
            phone: '+8801700000000',
            email: 'info@pharmaflow.com'
          },
          meta: {
            'Total Batches': batches.length
          },
          columns: [
            { header: 'Medicine', key: 'medicine' },
            { header: 'Batch', key: 'batch' },
            { header: 'Expired On', key: 'expiry' },
            { header: 'Qty', key: 'qty' },
            { header: 'Value (Loss)', key: 'value' }
          ],
          data: batches.map((b) => ({
            medicine: b.medicine?.name || '—',
            batch: b.batchNumber || '—',
            expiry: b.expiryDate ? formatDate(b.expiryDate) : '—',
            qty: formatNumber(b.quantity || 0),
            value: pdfCurrency((b.quantity || 0) * (b.purchasePrice || 0))
          })),
          filename: 'expired-batches'
        });

        toast.success(`PDF downloaded — ${batches.length} expired batches`);
      } else if (tab === 'movements') {
        const params = new URLSearchParams({ page: 1, limit: 1000 });
        if (debouncedSearch.trim()) params.set('search', debouncedSearch.trim());

        const res = await fetch(`${baseUrl}/stock-movements?${params}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('Failed to fetch stock movements');

        const json = await res.json();
        const movements = json?.data?.movements || [];

        if (movements.length === 0) {
          toast.error('No stock movements to export');
          return;
        }

        exportToPDF({
          title: 'Stock Movement Report',
          subtitle: `${movements.length} movements`,
          company: {
            name: 'PharmaFlow Pharmacy',
            address: 'Dhanmondi, Dhaka, Bangladesh',
            phone: '+8801700000000',
            email: 'info@pharmaflow.com'
          },
          meta: {
            'Total Movements': movements.length
          },
          columns: [
            { header: 'Date', key: 'date' },
            { header: 'Medicine', key: 'medicine' },
            { header: 'Batch', key: 'batch' },
            { header: 'Type', key: 'type' },
            { header: 'Change', key: 'change' },
            { header: 'New Qty', key: 'newQty' },
            { header: 'By', key: 'user' }
          ],
          data: movements.map((m) => ({
            date: m.createdAt ? formatDate(m.createdAt) : '—',
            medicine: m.medicine?.name || '—',
            batch: m.batch?.batchNumber || '—',
            type: (m.type || '').replace(/_/g, ' '),
            change: `${m.quantity > 0 ? '+' : ''}${m.quantity}`,
            newQty: formatNumber(m.newQuantity || 0),
            user: m.createdBy?.name || '—'
          })),
          filename: 'stock-movements'
        });

        toast.success(`PDF downloaded — ${movements.length} movements`);
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
        title="Inventory & batches"
        subtitle="Monitor batch-level availability, expiry risk and stock movements."
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
              onClick={handleOpenTopAdjust}
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Stock adjustment</span>
            </Button>
          </>
        }
      />

      <div className="space-y-6">
        <InventoryTabs value={tab} onValueChange={handleTabChange} />

        <InventoryStats stats={stats} isLoading={isLoading} />

        <Card className="overflow-hidden">
          <div className="p-4 border-b border-border">
            <InventoryFilters search={search} onSearchChange={setSearch} />
          </div>

          <InventoryTable
            data={data || []}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            viewMode={tab}
          />

          {pagination && pagination.total > 0 && tab === 'stock' && (
            <div className="border-t border-border">
              <Pagination pagination={pagination} onPageChange={setPage} />
            </div>
          )}
        </Card>
      </div>

      <BatchSelectDialog
        open={batchSelectOpen}
        onOpenChange={setBatchSelectOpen}
        onSelect={handleBatchSelected}
      />

      <StockAdjustmentDialog
        open={adjustOpen}
        onOpenChange={setAdjustOpen}
        batch={adjustTarget}
        onSuccess={() => {
          // RTK Query auto-invalidate
        }}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title={`Delete batch "${deleteTarget?.batchNumber}"?`}
        description="This action cannot be undone. Stock must be 0 to delete."
        confirmText="Delete"
        variant="destructive"
        loading={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}