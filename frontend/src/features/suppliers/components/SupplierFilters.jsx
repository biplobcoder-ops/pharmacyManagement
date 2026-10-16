import { Download, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import SearchBar from '@/components/common/SearchBar';
import { DUE_FILTERS } from '../supplierTypes';

export default function SupplierFilters({
  search,
  onSearchChange,
  dueFilter,
  onDueFilterChange,
  onExport,
  onAdd
}) {
  return (
    <div className="flex flex-col lg:flex-row gap-3">
      <SearchBar
        value={search}
        onChange={(value) => {
          console.log('[SupplierFilters] search changed:', value);
          onSearchChange(value);
        }}
        placeholder="Search suppliers by name, company or phone..."
        className="flex-1"
      />
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={dueFilter}
          onValueChange={(value) => {
            console.log('[SupplierFilters] dueFilter changed:', value);
            onDueFilterChange(value);
          }}
        >
          <SelectTrigger className="w-44 h-10 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DUE_FILTERS.map((f) => (
              <SelectItem key={f.value} value={f.value}>
                {f.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" size="sm" className="h-10" onClick={onExport}>
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Export</span>
        </Button>

        <Button
          size="sm"
          className="h-10 bg-accent hover:bg-accent/90 text-accent-foreground"
          onClick={onAdd}
        >
          <Truck className="h-4 w-4" />
          <span className="hidden sm:inline">Add supplier</span>
        </Button>
      </div>
    </div>
  );
}