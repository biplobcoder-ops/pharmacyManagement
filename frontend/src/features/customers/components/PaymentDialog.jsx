import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, DollarSign } from 'lucide-react';
import { useSelector } from 'react-redux';
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
import { formatCurrency } from '@/lib/utils';
import { useCreateCustomerPaymentMutation } from '../customerApi';
import { PAYMENT_METHODS } from '@/lib/constants';

const schema = z.object({
  amount: z.number().positive('Amount must be greater than 0'),
  method: z.enum(['cash', 'card', 'bank', 'mobile', 'other']).default('cash'),
  reference: z.string().max(100).optional().nullable(),
  notes: z.string().max(500).optional().nullable()
});

export default function PaymentDialog({ open, onOpenChange, customer, onSuccess }) {
  const user = useSelector((state) => state.auth.user);
  const branchId =
    typeof user?.branch === 'object' ? user.branch?._id : user?.branch;

  const [createPayment, { isLoading }] = useCreateCustomerPaymentMutation();

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
      amount: 0,
      method: 'cash',
      reference: '',
      notes: ''
    }
  });

  useEffect(() => {
    if (open && customer) {
      reset({
        amount: customer.dueBalance || 0,
        method: 'cash',
        reference: '',
        notes: ''
      });
    }
  }, [open, customer, reset]);

  const onSubmit = async (data) => {
    if (!branchId) {
      toast.error('Branch not found. Please re-login.');
      return;
    }

    if (data.amount > customer.dueBalance) {
      toast.error(`Amount cannot exceed due balance ${formatCurrency(customer.dueBalance)}`);
      return;
    }

    try {
      await createPayment({
        customer: customer._id,
        amount: data.amount,
        method: data.method,
        reference: data.reference || '',
        branch: branchId,
        notes: data.notes || ''
      }).unwrap();

      toast.success('Payment received');
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to record payment');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Receive payment</DialogTitle>
          <DialogDescription>
            {customer && (
              <>
                Payment from <strong>{customer.name}</strong> · Due:{' '}
                <span className="text-warning font-medium">
                  {formatCurrency(customer.dueBalance || 0)}
                </span>
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Amount */}
          <div>
            <Label htmlFor="amount">
              Amount <span className="text-destructive">*</span>
            </Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              max={customer?.dueBalance}
              {...register('amount', { valueAsNumber: true })}
              className="mt-1.5 text-lg font-bold text-right tabular-nums"
            />
            {errors.amount && (
              <p className="mt-1 text-xs text-destructive">{errors.amount.message}</p>
            )}
          </div>

          {/* Method */}
          <div>
            <Label>Payment method</Label>
            <Select
              value={watch('method')}
              onValueChange={(v) => setValue('method', v)}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reference */}
          <div>
            <Label htmlFor="reference">Reference (optional)</Label>
            <Input
              id="reference"
              placeholder="Transaction ID, cheque number..."
              {...register('reference')}
              className="mt-1.5"
            />
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Optional notes..."
              rows={2}
              {...register('notes')}
              className="mt-1.5"
            />
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
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-success hover:bg-success/90 text-white"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              <DollarSign className="h-4 w-4" />
              Receive payment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}