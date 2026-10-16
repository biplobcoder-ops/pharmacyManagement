import { Calendar, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import SearchBar from '@/components/common/SearchBar';
import { DATE_RANGES, PAYMENT_METHODS } from '../financeTypes';

export default function FinanceFilters({
  search,
  onSearchChange,
  dateRange,
  onDateRangeChange,
  method,
  onMethodChange,
  onExport
}) {
  return (
    <div className="flex flex-col lg:flex-row gap-3">
      <SearchBar
        value={search}
        onChange={onSearchChange}
        placeholder="Search by reference, party or amount..."
        className="flex-1"
      />

      <div className="flex flex-wrap items-center gap-2">
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

        <Select value={method} onValueChange={onMethodChange}>
          <SelectTrigger className="w-32 h-10 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All methods</SelectItem>
            {PAYMENT_METHODS.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" size="sm" className="h-10" onClick={onExport}>
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Export</span>
        </Button>
      </div>
    </div>
  );
}