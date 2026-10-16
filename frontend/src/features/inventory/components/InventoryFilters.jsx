import { Filter, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SearchBar from '@/components/common/SearchBar';

export default function InventoryFilters({
  search,
  onSearchChange,
  onExport
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <SearchBar
        value={search}
        onChange={onSearchChange}
        placeholder="Search medicine or batch number..."
        className="flex-1"
      />
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="h-10">
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">Filter</span>
        </Button>
        <Button variant="outline" size="sm" className="h-10" onClick={onExport}>
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Export</span>
        </Button>
      </div>
    </div>
  );
}