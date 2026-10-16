// src/features/pos/components/MedicineCard.jsx
// ✅ Mobile-first compact card

import { Plus } from 'lucide-react';
import MedicineImage from '@/features/medicines/components/MedicineImage';
import { cn, formatCurrency, formatNumber } from '@/lib/utils';

export default function MedicineCard({ medicine, onAdd, disabled }) {
  const stock = medicine.totalStock ?? 0;
  const isOutOfStock = stock === 0;
  const price = medicine.sellingPrice || 0;

  return (
    <button
      type="button"
      onClick={() => !isOutOfStock && onAdd(medicine)}
      disabled={isOutOfStock || disabled}
      className={cn(
        'group relative flex flex-col rounded-xl lg:rounded-2xl border border-border bg-card p-2 lg:p-2.5 text-left transition-all',
        'hover:border-accent hover:shadow-lg hover:-translate-y-0.5',
        isOutOfStock && 'opacity-40 cursor-not-allowed',
        !isOutOfStock && 'cursor-pointer'
      )}
    >
      {/* Stock badge */}
      {!isOutOfStock && (
        <div className="absolute top-1.5 right-1.5 lg:top-2 lg:right-2 z-10">
          <div
            className={cn(
              'flex h-5 min-w-[22px] lg:h-7 lg:min-w-[28px] items-center justify-center rounded-full px-1.5 lg:px-2 text-[9px] lg:text-[10px] font-bold text-white shadow-md',
              stock < 20 ? 'bg-warning' : 'bg-emerald-500'
            )}
          >
            {formatNumber(stock)}
          </div>
        </div>
      )}

      {/* Image — smaller on mobile */}
      <div className="w-full aspect-square rounded-lg lg:rounded-xl overflow-hidden bg-muted mb-1.5 lg:mb-2.5 flex items-center justify-center">
        <MedicineImage medicine={medicine} size="xl" />
      </div>

      {/* Info — compact */}
      <div className="flex-1 min-w-0 mb-1.5 lg:mb-2">
        <p className="text-[11px] lg:text-sm font-semibold text-foreground truncate leading-tight">
          {medicine.name}
        </p>
        <p className="text-[9px] lg:text-[10px] text-muted-foreground truncate mt-0.5">
          {medicine.generic?.name || medicine.strength}
        </p>
      </div>

      {/* Price + Add */}
      <div className="flex items-center justify-between mt-auto pt-1 lg:pt-1.5 border-t border-border/50">
        <span className="text-[11px] lg:text-sm font-bold text-foreground tabular-nums">
          {formatCurrency(price)}
        </span>
        {!isOutOfStock ? (
          <div className="rounded-full bg-emerald-500/10 p-0.5 lg:p-1 group-hover:bg-emerald-500 transition-colors">
            <Plus className="h-3 w-3 lg:h-3.5 lg:w-3.5 text-emerald-500 group-hover:text-white transition-colors" />
          </div>
        ) : (
          <span className="text-[8px] lg:text-[9px] text-destructive font-semibold">
            Out
          </span>
        )}
      </div>
    </button>
  );
}