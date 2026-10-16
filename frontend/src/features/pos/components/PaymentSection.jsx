// src/features/pos/components/PaymentSection.jsx
// ✅ FIXED: Floating point precision

import { Banknote, CreditCard, Smartphone, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn, formatCurrency } from '@/lib/utils';

const METHODS = [
  { value: 'cash', label: 'Cash', icon: Banknote },
  { value: 'card', label: 'Card', icon: CreditCard },
  { value: 'mobile', label: 'Mobile', icon: Smartphone }
];

// ✅ Money helper
const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

export default function PaymentSection({
  method,
  onMethodChange,
  paidAmount,
  onPaidChange,
  total,
  isLoading,
  disabled,
  onComplete
}) {
  // ✅ Round to 2 decimals — safe comparison
  const roundedTotal = round2(total);
  const roundedPaid = round2(paidAmount || 0);

  // ✅ Paid amount <= total + 1 paisa tolerance
  const isValidPaid = roundedPaid <= roundedTotal + 0.01;

  const handlePaidChange = (e) => {
    const val = parseFloat(e.target.value) || 0;
    // ✅ Cap at total
    const capped = Math.min(round2(val), roundedTotal);
    onPaidChange(capped);
  };

  const handlePayFull = () => {
    onPaidChange(roundedTotal);
  };

  return (
    <div className="space-y-3">
      {/* Method */}
      <div>
        <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
          Payment Method
        </label>
        <div className="grid grid-cols-3 gap-2">
          {METHODS.map((m) => {
            const Icon = m.icon;
            const isActive = method === m.value;
            return (
              <button
                key={m.value}
                type="button"
                onClick={() => onMethodChange(m.value)}
                className={cn(
                  'flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl border-2 text-xs font-medium transition-all',
                  isActive
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500'
                    : 'border-border hover:border-emerald-500/50 text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Amount paid */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Paid Amount
          </label>
          <button
            type="button"
            onClick={handlePayFull}
            className="text-[10px] text-accent hover:underline"
          >
            Pay full ({formatCurrency(roundedTotal)})
          </button>
        </div>
        <Input
          type="number"
          min="0"
          max={roundedTotal}
          step="0.01"
          value={paidAmount || ''}
          onChange={handlePaidChange}
          className={cn(
            'h-12 text-lg font-bold text-right tabular-nums rounded-xl',
            !isValidPaid && 'border-destructive'
          )}
          placeholder="0.00"
        />
        {!isValidPaid && (
          <p className="mt-1 text-xs text-destructive text-right">
            Paid amount cannot exceed total
          </p>
        )}
        {isValidPaid && roundedPaid > 0 && (
          <p className="mt-1.5 text-xs text-right">
            {roundedPaid < roundedTotal ? (
              <>
                <span className="text-muted-foreground">Change Due: </span>
                <span className="text-destructive font-semibold">
                  {formatCurrency(round2(roundedTotal - roundedPaid))}
                </span>
              </>
            ) : (
              <>
                <span className="text-muted-foreground">Change: </span>
                <span className="text-emerald-500 font-semibold">
                  {formatCurrency(round2(roundedPaid - roundedTotal))}
                </span>
              </>
            )}
          </p>
        )}
      </div>

      {/* Complete Sale */}
      <Button
        onClick={onComplete}
        disabled={disabled || isLoading || !isValidPaid}
        className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-md"
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        Complete Sale
      </Button>
    </div>
  );
}