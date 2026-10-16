// src/features/sales/components/SalesFilters.jsx
// ✅ Mobile-first professional filter design

import { useState } from 'react';
import {
  SlidersHorizontal, ChevronDown, X, RotateCcw, Download, Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import SearchBar from '@/components/common/SearchBar';
import { cn } from '@/lib/utils';

const DATE_RANGES = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'thisWeek', label: 'This week' },
  { value: 'thisMonth', label: 'This month' },
  { value: 'thisYear', label: 'This year' },
  { value: 'last7days', label: 'Last 7 days' },
  { value: 'last30days', label: 'Last 30 days' },
  { value: 'custom', label: 'Custom range' }
];

const PAYMENT_STATUSES = [
  { value: 'all', label: 'All statuses' },
  { value: 'paid', label: 'Paid' },
  { value: 'partial', label: 'Partial' },
  { value: 'due', label: 'Due' }
];

export default function SalesFilters({
  search,
  onSearchChange,
  dateRange,
  onDateRangeChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  paymentStatus,
  onPaymentStatusChange,
  customerId,
  onCustomerChange,
  customers = [],
  onExport
}) {
  const [expanded, setExpanded] = useState(false);

  // Active filter count
  const activeCount = [
    dateRange !== 'today' ? dateRange : null,
    paymentStatus !== 'all' ? paymentStatus : null,
    customerId !== 'all' ? customerId : null
  ].filter(Boolean).length;

  const hasActiveFilters = activeCount > 0;

  const handleClear = () => {
    onDateRangeChange('today');
    onPaymentStatusChange('all');
    onCustomerChange('all');
  };

  return (
    <div className="space-y-3">
      {/* Search + Filter button row */}
      <div className="flex gap-2">
        <SearchBar
          value={search}
          onChange={onSearchChange}
          placeholder="Search by invoice or customer..."
          className="flex-1"
        />

        {/* Mobile: Filter toggle button */}
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className={cn(
            'lg:hidden shrink-0 flex items-center gap-2 px-3 rounded-xl',
            'border border-border bg-card hover:bg-muted/40 transition-colors',
            'text-sm font-medium text-foreground',
            activeCount > 0 && 'border-accent/40 bg-accent/5'
          )}
        >
          <SlidersHorizontal className="h-4 w-4 text-accent" />
          {activeCount > 0 && (
            <Badge variant="info" className="text-[10px] h-5 px-1.5">
              {activeCount}
            </Badge>
          )}
          <ChevronDown
            className={cn(
              'h-3.5 w-3.5 text-muted-foreground transition-transform',
              expanded && 'rotate-180'
            )}
          />
        </button>
      </div>

      {/* Filters — mobile: collapsible, desktop: always visible */}
      <div
        className={cn(
          'lg:flex lg:items-center lg:gap-2 lg:flex-wrap',
          !expanded && 'hidden lg:flex'
        )}
      >
        <div className="flex flex-wrap items-center gap-2 w-full">
          {/* Date Range */}
          <Select value={dateRange} onValueChange={onDateRangeChange}>
            <SelectTrigger
              id="sales-date-range"
              name="dateRange"
              className="h-9 text-xs flex-1 lg:flex-none lg:w-36 min-w-0"
            >
              <Calendar className="h-3.5 w-3.5 mr-1.5 shrink-0" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DATE_RANGES.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Payment Status */}
          <Select value={paymentStatus} onValueChange={onPaymentStatusChange}>
            <SelectTrigger
              id="sales-payment-status"
              name="paymentStatus"
              className="h-9 text-xs flex-1 lg:flex-none lg:w-36 min-w-0"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Customer */}
          <Select value={customerId} onValueChange={onCustomerChange}>
            <SelectTrigger
              id="sales-customer"
              name="customerId"
              className="h-9 text-xs flex-1 lg:flex-none lg:w-40 min-w-0"
            >
              <SelectValue placeholder="All customers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All customers</SelectItem>
              {customers.map((c) => (
                <SelectItem key={c._id} value={c._id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Clear (if active) */}
          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-9 px-2 text-xs text-muted-foreground hover:text-foreground gap-1.5 shrink-0"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Clear</span>
            </Button>
          )}

          {/* Export (desktop) */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onExport}
            className="hidden lg:flex h-9 px-3 text-xs ml-auto gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
        </div>
      </div>

      {/* Custom date range inputs (conditional) */}
      {dateRange === 'custom' && (
        <div className="grid grid-cols-2 gap-2 pt-1">
          <input
            type="date"
            id="sales-start-date"
            name="startDate"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="h-9 px-3 rounded-lg border border-border bg-card text-xs text-foreground outline-none focus:border-accent"
          />
          <input
            type="date"
            id="sales-end-date"
            name="endDate"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="h-9 px-3 rounded-lg border border-border bg-card text-xs text-foreground outline-none focus:border-accent"
          />
        </div>
      )}

      {/* Active filter chips (mobile) */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 lg:hidden">
          {dateRange !== 'today' && (
            <FilterChip
              label={DATE_RANGES.find((r) => r.value === dateRange)?.label || dateRange}
              onRemove={() => onDateRangeChange('today')}
            />
          )}
          {paymentStatus !== 'all' && (
            <FilterChip
              label={
                PAYMENT_STATUSES.find((s) => s.value === paymentStatus)?.label ||
                paymentStatus
              }
              onRemove={() => onPaymentStatusChange('all')}
            />
          )}
          {customerId !== 'all' && (
            <FilterChip
              label={
                customers.find((c) => c._id === customerId)?.name || 'Customer'
              }
              onRemove={() => onCustomerChange('all')}
            />
          )}
        </div>
      )}

      {/* Export button (mobile) */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onExport}
        className="lg:hidden w-full h-9 text-xs gap-1.5"
      >
        <Download className="h-3.5 w-3.5" />
        Export Sales
      </Button>
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