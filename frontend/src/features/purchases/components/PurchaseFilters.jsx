import { Calendar, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import SearchBar from '@/components/common/SearchBar';
import { DATE_RANGES } from '../purchaseTypes';

export default function PurchaseFilters({
  search,
  onSearchChange,
  dateRange,
  onDateRangeChange,
  paymentStatus,
  onPaymentStatusChange,
  onExport
}) {
  return (
    <div className="flex flex-col gap-3">
      {/* Row 1: Search + Export */}
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchBar
          value={search}
          onChange={onSearchChange}
          placeholder="Search purchases..."
          className="flex-1"
        />
        <div className="flex items-center gap-2">
          {/* Date range */}
          <Select value={dateRange} onValueChange={onDateRangeChange}>
            <SelectTrigger className="w-40 h-10 text-xs">
              <Calendar className="h-3.5 w-3.5 mr-1.5" />
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

          {/* Payment status */}
          <Select value={paymentStatus} onValueChange={onPaymentStatusChange}>
            <SelectTrigger className="w-32 h-10 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="partial">Partial</SelectItem>
              <SelectItem value="due">Due</SelectItem>
            </SelectContent>
          </Select>

          {/* Export */}
          <Button variant="outline" size="sm" className="h-10" onClick={onExport}>
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </div>
    </div>
  );
}