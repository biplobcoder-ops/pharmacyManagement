// src/features/medicines/components/MedicineFilters.jsx
// ✅ Mobile-first professional filter design

import { useState } from 'react';
import {X, ChevronDown, SlidersHorizontal, RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function MedicineFilters({
  filters,
  onFilterChange,
  onClearFilters,
  categories = [],
  brands = [],
  hasActiveFilters
}) {
  const [expanded, setExpanded] = useState(false);

  // Active filter count
  const activeCount = [
    filters.category,
    filters.brand,
    filters.status !== 'active' ? filters.status : null
  ].filter(Boolean).length;

  return (
    <div className="space-y-3">
      {/* Mobile: Filter toggle button */}
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className={cn(
            'w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl',
            'border border-border bg-card hover:bg-muted/40 transition-colors',
            'text-sm font-medium text-foreground'
          )}
        >
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-accent" />
            <span>Filters</span>
            {activeCount > 0 && (
              <Badge variant="info" className="text-[10px] h-5 px-2">
                {activeCount}
              </Badge>
            )}
          </div>
          <ChevronDown
            className={cn(
              'h-4 w-4 text-muted-foreground transition-transform',
              expanded && 'rotate-180'
            )}
          />
        </button>
      </div>

      {/* Filters — mobile: collapsible, desktop: inline */}
      <div
        className={cn(
          'lg:flex lg:items-center lg:gap-2',
          !expanded && 'hidden lg:flex'
        )}
      >
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {/* Category */}
          <Select
            value={filters.category || 'all'}
            onValueChange={(v) =>
              onFilterChange('category', v === 'all' ? '' : v)
            }
          >
            <SelectTrigger
              id="filter-category"
              name="category"
              className="h-9 lg:h-9 text-xs flex-1 lg:flex-none lg:w-40 min-w-0"
            >
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c._id} value={c._id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Brand */}
          <Select
            value={filters.brand || 'all'}
            onValueChange={(v) =>
              onFilterChange('brand', v === 'all' ? '' : v)
            }
          >
            <SelectTrigger
              id="filter-brand"
              name="brand"
              className="h-9 lg:h-9 text-xs flex-1 lg:flex-none lg:w-40 min-w-0"
            >
              <SelectValue placeholder="Brand" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All brands</SelectItem>
              {brands.map((b) => (
                <SelectItem key={b._id} value={b._id}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status */}
          <Select
            value={filters.status}
            onValueChange={(v) => onFilterChange('status', v)}
          >
            <SelectTrigger
              id="filter-status"
              name="status"
              className="h-9 lg:h-9 text-xs flex-1 lg:flex-none lg:w-32 min-w-0"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="all">All status</SelectItem>
            </SelectContent>
          </Select>

          {/* Clear filters */}
          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="h-9 px-3 text-xs text-muted-foreground hover:text-foreground gap-1.5 shrink-0"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Clear</span>
            </Button>
          )}
        </div>
      </div>

      {/* Active filter chips — mobile friendly */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.category && (
            <FilterChip
              label={
                categories.find((c) => c._id === filters.category)?.name ||
                'Category'
              }
              onRemove={() => onFilterChange('category', '')}
            />
          )}
          {filters.brand && (
            <FilterChip
              label={
                brands.find((b) => b._id === filters.brand)?.name || 'Brand'
              }
              onRemove={() => onFilterChange('brand', '')}
            />
          )}
          {filters.status !== 'active' && (
            <FilterChip
              label={
                filters.status === 'all'
                  ? 'All status'
                  : filters.status === 'inactive'
                  ? 'Inactive'
                  : filters.status
              }
              onRemove={() => onFilterChange('status', 'active')}
            />
          )}
        </div>
      )}
    </div>
  );
}

// ===== Filter Chip =====
function FilterChip({ label, onRemove }) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full',
        'bg-accent/10 text-accent border border-accent/20',
        'text-[11px] font-medium'
      )}
    >
      <span className="truncate max-w-[120px] capitalize">{label}</span>
      <button
        type="button"
        onClick={onRemove}
        className="rounded-full p-0.5 hover:bg-accent/20 transition-colors shrink-0"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}