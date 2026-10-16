import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MedicineImage from '@/features/medicines/components/MedicineImage';
import { formatCurrency } from '@/lib/utils';

export default function CartItem({ item, index, onUpdateQuantity, onRemove }) {
  const { medicine, quantity, sellingPrice } = item;
  const lineTotal = (sellingPrice || 0) * (quantity || 0) - (item.discount || 0);
  const unitPrice = sellingPrice || 0;

  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border/50">
      {/* Image */}
      <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted shrink-0">
        <MedicineImage medicine={medicine} size="md" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">
          {medicine?.name}
        </p>
        <p className="text-[10px] text-muted-foreground truncate">
          {formatCurrency(unitPrice)} each
        </p>

        {/* Quantity controls */}
        <div className="flex items-center gap-1 mt-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-md bg-background"
            onClick={() => onUpdateQuantity(index, quantity - 1)}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="w-8 text-center text-sm font-semibold tabular-nums">
            {quantity}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-md bg-background"
            onClick={() => onUpdateQuantity(index, quantity + 1)}
          >
            <Plus className="h-3 w-3" />
          </Button>

          <span className="text-[10px] text-muted-foreground ml-1">×</span>

          <button
            type="button"
            onClick={() => onRemove(index)}
            className="text-[10px] text-destructive hover:underline ml-auto"
          >
            Remove
          </button>
        </div>
      </div>

      {/* Line total */}
      <div className="text-right shrink-0">
        <p className="text-sm font-bold text-foreground tabular-nums">
          {formatCurrency(lineTotal)}
        </p>
      </div>
    </div>
  );
}