import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { useAdjustStockMutation } from '../inventoryApi';
import { formatNumber } from '@/lib/utils';

const schema = z.object({
  type: z.enum(['DAMAGE', 'EXPIRED', 'ADJUSTMENT', 'TRANSFER_IN', 'TRANSFER_OUT']),
  quantity: z
    .number({ invalid_type_error: 'Quantity must be a number' })
    .int('Quantity must be a whole number')
    .refine((v) => v !== 0, 'Quantity cannot be zero'),
  reason: z.string().min(3, 'Reason must be at least 3 characters').max(500)
});

const ADJUSTMENT_TYPES = [
  { value: 'ADJUSTMENT', label: 'Adjustment (+/-)' },
  { value: 'DAMAGE', label: 'Damage' },
  { value: 'EXPIRED', label: 'Expired' },
  { value: 'TRANSFER_IN', label: 'Transfer In' },
  { value: 'TRANSFER_OUT', label: 'Transfer Out' }
];

export default function StockAdjustmentDialog({ open, onOpenChange, batch, onSuccess }) {
  const [adjustStock, { isLoading }] = useAdjustStockMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      type: 'ADJUSTMENT',
      quantity: 0,
      reason: ''
    }
  });

  useEffect(() => {
    if (open) {
      reset({ type: 'ADJUSTMENT', quantity: 0, reason: '' });
    }
  }, [open, reset]);

  const onSubmit = async (data) => {
    if (!batch) return;

    // Prepare quantity based on type
    let quantity = data.quantity;
    const isNegativeType = ['DAMAGE', 'EXPIRED', 'TRANSFER_OUT'].includes(data.type);
    const isPositiveType = ['TRANSFER_IN'].includes(data.type);

    if (isNegativeType || isPositiveType) {
      quantity = Math.abs(quantity);
    }

    const payload = {
      medicine: batch.medicine?._id || batch.medicine,
      batch: batch._id,
      branch: batch.branch?._id || batch.branch,
      type: data.type,
      quantity,
      reason: data.reason
    };

    try {
      await adjustStock(payload).unwrap();
      toast.success('Stock adjusted successfully');
      // RTK Query auto-invalidate kore — manual refetch lagbe na
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      const message =
        error?.data?.message ||
        error?.data?.errors?.[0]?.message ||
        error?.message ||
        'Failed to adjust stock';
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Adjust stock</DialogTitle>
          <DialogDescription>
            {batch && (
              <>
                <span className="font-medium text-foreground">
                  {batch.medicine?.name}
                </span>
                {' · Batch '}
                <span className="font-mono">{batch.batchNumber}</span>
                {' · Current: '}
                <span className="font-medium text-foreground">
                  {formatNumber(batch.quantity)} units
                </span>
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Type */}
          <div>
            <Label>Adjustment type</Label>
            <div className="mt-1.5">
              <Select
                value={watch('type')}
                onValueChange={(v) => setValue('type', v, { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ADJUSTMENT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quantity */}
          <div>
            <Label htmlFor="quantity">
              Quantity <span className="text-destructive">*</span>
            </Label>
            <Input
              id="quantity"
              type="number"
              placeholder="e.g., 10"
              className="mt-1.5"
              {...register('quantity', { valueAsNumber: true })}
            />
            {errors.quantity && (
              <p className="mt-1 text-xs text-destructive">{errors.quantity.message}</p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              {watch('type') === 'ADJUSTMENT'
                ? 'Positive (+) increases stock, negative (-) decreases stock.'
                : watch('type') === 'TRANSFER_IN'
                ? 'Positive quantity — stock will increase.'
                : 'Positive quantity — stock will decrease.'}
            </p>
          </div>

          {/* Reason */}
          <div>
            <Label htmlFor="reason">
              Reason <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="reason"
              placeholder="e.g., Damaged during transport"
              className="mt-1.5"
              rows={3}
              {...register('reason')}
            />
            {errors.reason && (
              <p className="mt-1 text-xs text-destructive">{errors.reason.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Adjust stock
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}