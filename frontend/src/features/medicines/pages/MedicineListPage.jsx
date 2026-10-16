import { useMemo, useState } from 'react';
import { Plus, Download, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import SearchBar from '@/components/common/SearchBar';
import Pagination from '@/components/common/Pagination';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { useDebounce } from '@/hooks/useDebounce';

import MedicineStats from '../components/MedicineStats';
import MedicineFilters from '../components/MedicineFilters';
import MedicineTable from '../components/MedicineTable';
import MedicineFormDialog from '../components/MedicineFormDialog';

import {
  useGetMedicinesQuery,
  useGetCategoriesQuery,
  useGetBrandsQuery,
  useDeleteMedicineMutation
} from '../medicineApi';

// ✅ PDF Export
// eslint-disable-next-line no-unused-vars
import { exportToPDF, pdfCurrency } from '@/lib/pdfExport';

export default function MedicineListPage() {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ category: '', brand: '', status: 'active' });
  const [page, setPage] = useState(1);
  // eslint-disable-next-line no-unused-vars
  const [limit, setLimit] = useState(10);

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  const queryParams = useMemo(
    () => ({
      page,
      limit,
      search: debouncedSearch || undefined,
      category: filters.category || undefined,
      brand: filters.brand || undefined,
      status: filters.status === 'all' ? undefined : filters.status
    }),
    [page, limit, debouncedSearch, filters]
  );

  const { data: res, isLoading, refetch } = useGetMedicinesQuery(queryParams);
  const { data: categoriesRes } = useGetCategoriesQuery();
  const { data: brandsRes } = useGetBrandsQuery();
  const [deleteMedicine, { isLoading: isDeleting }] = useDeleteMedicineMutation();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const medicines = res?.data?.medicines || [];
  const pagination = res?.data?.pagination;

  const stats = useMemo(() => {
    const totalMedicines = pagination?.total || 0;
    const active = medicines.filter((m) => m.status === 'active').length;
    const totalUnits = medicines.reduce((sum, m) => sum + (m.totalStock || 0), 0);
    const lowStock = medicines.filter(
      (m) => m.totalStock > 0 && m.totalStock < m.minStockLevel
    ).length;
    const outOfStock = medicines.filter((m) => !m.totalStock).length;

    return {
      totalMedicines,
      activeMedicines: active,
      totalUnits,
      totalBatches: medicines.length,
      lowStock,
      outOfStock
    };
  }, [medicines, pagination]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({ category: '', brand: '', status: 'active' });
    setSearch('');
    setPage(1);
  };

  const handleOpenCreate = () => {
    setEditTarget(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (medicine) => {
    setEditTarget(medicine);
    setFormOpen(true);
  };

  const handleOpenDelete = (medicine) => {
    setDeleteTarget(medicine);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMedicine(deleteTarget._id).unwrap();
      toast.success('Medicine deleted');
      setDeleteTarget(null);
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to delete medicine');
    }
  };

  const handleFormSuccess = () => {
    refetch();
  };

  const hasActiveFilters =
    !!filters.category || !!filters.brand || filters.status !== 'active' || !!search;

  // ✅ PDF Export handler
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const token = localStorage.getItem('accessToken');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

      const params = new URLSearchParams({ page: 1, limit: 1000 });
      if (debouncedSearch.trim()) params.set('search', debouncedSearch.trim());
      if (filters.category) params.set('category', filters.category);
      if (filters.brand) params.set('brand', filters.brand);
      if (filters.status !== 'all') params.set('status', filters.status);

      const res = await fetch(`${baseUrl}/medicines?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to fetch medicines');

      const json = await res.json();
      const allMedicines = json?.data?.medicines || [];

      if (allMedicines.length === 0) {
        toast.error('No medicines to export');
        return;
      }

      exportToPDF({
        title: 'Medicine List Report',
        subtitle: `${allMedicines.length} medicines${filters.status !== 'all' ? ` • ${filters.status}` : ''}`,
        company: {
          name: 'PharmaFlow Pharmacy',
          address: 'Dhanmondi, Dhaka, Bangladesh',
          phone: '+8801700000000',
          email: 'info@pharmaflow.com'
        },
        meta: {
          'Total Medicines': allMedicines.length,
          'Status Filter': filters.status === 'all' ? 'All' : filters.status
        },
        columns: [
          { header: '#', key: 'no' },
          { header: 'Medicine', key: 'name' },
          { header: 'Generic', key: 'generic' },
          { header: 'Brand', key: 'brand' },
          { header: 'Strength', key: 'strength' },
          { header: 'Form', key: 'form' },
          { header: 'Stock', key: 'stock' },
          { header: 'Min Level', key: 'min' }
        ],
        data: allMedicines.map((m, i) => ({
          no: i + 1,
          name: m.name || '—',
          generic: m.generic?.name || '—',
          brand: m.brand?.name || '—',
          strength: m.strength || '—',
          form: m.dosageForm || '—',
          stock: `${m.totalStock || 0} units`,
          min: `${m.minStockLevel || 0} units`
        })),
        filename: 'medicines-list'
      });

      toast.success(`PDF downloaded — ${allMedicines.length} medicines`);
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
        title="Medicines"
        subtitle="Manage medicine information, pricing, stock thresholds and availability."
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
              onClick={handleOpenCreate}
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add medicine</span>
            </Button>
          </>
        }
      />

      <div className="space-y-6">
        <MedicineStats stats={stats} isLoading={isLoading} />

        <Card className="overflow-hidden">
          <div className="p-4 border-b border-border space-y-3">
            <div className="flex flex-col lg:flex-row gap-3">
              <SearchBar
                value={search}
                onChange={(v) => {
                  setSearch(v);
                  setPage(1);
                }}
                placeholder="Search by medicine, generic or brand"
                className="flex-1"
              />
              <div className="flex items-center gap-2">
                <MedicineFilters
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onClearFilters={handleClearFilters}
                  categories={categoriesRes?.data?.categories || []}
                  brands={brandsRes?.data?.brands || []}
                  hasActiveFilters={hasActiveFilters}
                />
              </div>
            </div>
          </div>

          <MedicineTable
            data={medicines}
            isLoading={isLoading}
            onEdit={handleOpenEdit}
            onDelete={handleOpenDelete}
          />

          {pagination && pagination.total > 0 && (
            <div className="border-t border-border">
              <Pagination pagination={pagination} onPageChange={setPage} />
            </div>
          )}
        </Card>
      </div>

      <MedicineFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        medicine={editTarget}
        onSuccess={handleFormSuccess}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title={`Delete "${deleteTarget?.name}"?`}
        description="This action cannot be undone. All associated data will be removed."
        confirmText="Delete"
        variant="destructive"
        loading={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}