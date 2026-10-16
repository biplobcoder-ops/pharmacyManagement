import { useState } from 'react';
import {  Package } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import SearchBar from '@/components/common/SearchBar';
import { useDebounce } from '@/hooks/useDebounce';
import { useGetCurrentStockQuery } from '../inventoryApi';
import { formatNumber } from '@/lib/utils';

export default function BatchSelectDialog({ open, onOpenChange, onSelect }) {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);

  const { data: res, isLoading } = useGetCurrentStockQuery(
    { search: debouncedSearch || undefined, limit: 20 },
    { skip: !open }
  );

  const batches = res?.data?.batches || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Select batch to adjust</DialogTitle>
          <DialogDescription>
            Search and select a batch to adjust its stock.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search medicine or batch number..."
          />

          <div className="max-h-[400px] overflow-y-auto scrollbar-thin space-y-2">
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 rounded-lg bg-muted/40 animate-pulse" />
                ))}
              </div>
            ) : batches.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">No batches found</p>
              </div>
            ) : (
              batches.map((batch) => (
                <button
                  key={batch._id}
                  onClick={() => {
                    onSelect(batch);
                    onOpenChange(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:border-accent hover:bg-muted/40 transition-all text-left"
                >
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-muted-foreground">
                      {batch.medicine?.name?.charAt(0) || '?'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {batch.medicine?.name} · {batch.medicine?.strength}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {batch.batchNumber}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-foreground tabular-nums">
                      {formatNumber(batch.quantity)}
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase">units</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}