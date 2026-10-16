import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils';

export default function SaleSummary({
  subtotal,
  discount,
  tax,
  total,
  onDiscountChange,
  onTaxChange
}) {
  return (
    <div className="space-y-3 py-4 border-y border-border">
      {/* Subtotal */}
      <div className="flex justify-between items-center">
        <span className="text-xs text-muted-foreground">Subtotal</span>
        <span className="text-sm font-semibold tabular-nums text-foreground">
          {formatCurrency(subtotal)}
        </span>
      </div>

      {/* Discount */}
      <div className="flex justify-between items-center">
        <span className="text-xs text-muted-foreground">Discount</span>
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground">৳</span>
          <Input
            type="number"
            min="0"
            value={discount || 0}
            onChange={(e) => onDiscountChange(parseFloat(e.target.value) || 0)}
            className="w-20 h-8 text-right text-xs rounded-lg"
          />
        </div>
      </div>

      {/* Tax */}
      <div className="flex justify-between items-center">
        <span className="text-xs text-muted-foreground">VAT / Tax</span>
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground">৳</span>
          <Input
            type="number"
            min="0"
            value={tax || 0}
            onChange={(e) => onTaxChange(parseFloat(e.target.value) || 0)}
            className="w-20 h-8 text-right text-xs rounded-lg"
          />
        </div>
      </div>

      {/* Total — Big Bold */}
      <div className="flex justify-between items-center pt-3 border-t border-border">
        <span className="text-sm font-semibold text-foreground">Total</span>
        <span className="text-2xl font-bold text-emerald-500 tabular-nums">
          {formatCurrency(total)}
        </span>
      </div>
    </div>
  );
}