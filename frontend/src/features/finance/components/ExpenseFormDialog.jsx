import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
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
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from '../financeTypes';
import {
  useCreateExpenseMutation,
  useUpdateExpenseMutation
} from '../financeApi';

const schema = z.object({
  category: z.string().min(1, 'Category is required'),
  title: z.string().min(2, 'Title is required').max(200),
  amount: z.number().positive('Amount must be greater than 0'),
  date: z.string().min(1, 'Date is required'),
  description: z.string().max(1000).optional().nullable(),
  paymentMethod: z.enum(['cash', 'card', 'bank', 'mobile', 'other']).default('cash'),
  reference: z.string().max(100).optional().nullable()
});

export default function ExpenseFormDialog({
  open,
  onOpenChange,
  expense,
  onSuccess
}) {
  const isEdit = !!expense;
  // eslint-disable-next-line no-unused-vars
  const user = useSelector((state) => state.auth.user);
  const branchId = useSelector((s) => {
    const b = s.auth.user?.branch;
    if (!b) return null;
    return typeof b === 'string' ? b : b._id;
  });

  const [createExpense, { isLoading: isCreating }] = useCreateExpenseMutation();
  const [updateExpense, { isLoading: isUpdating }] = useUpdateExpenseMutation();
  const isLoading = isCreating || isUpdating;

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
      category: 'other',
      title: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      description: '',
      paymentMethod: 'cash',
      reference: ''
    }
  });

  useEffect(() => {
    if (open) {
      if (expense) {
        reset({
          category: expense.category || 'other',
          title: expense.title || '',
          amount: expense.amount || 0,
          date: expense.date
            ? new Date(expense.date).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
          description: expense.description || '',
          paymentMethod: expense.paymentMethod || 'cash',
          reference: expense.reference || ''
        });
      } else {
        reset();
      }
    }
  }, [open, expense, reset]);

  const onSubmit = async (data) => {
    if (!branchId) {
      toast.error('Branch not found. Please re-login.');
      return;
    }

    try {
      const payload = {
        category: data.category,
        title: data.title,
        amount: data.amount,
        date: new Date(data.date).toISOString(),
        description: data.description || '',
        paymentMethod: data.paymentMethod,
        reference: data.reference || '',
        branch: branchId
      };

      if (isEdit) {
        delete payload.branch;
        await updateExpense({ id: expense._id, ...payload }).unwrap();
        toast.success('Expense updated');
      } else {
        await createExpense(payload).unwrap();
        toast.success('Expense created');
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} expense`
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit expense' : 'Add new expense'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update expense information.'
              : 'Record a new business expense.'}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto scrollbar-thin pr-1 space-y-4"
        >
          {/* Category + Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Category *</Label>
              <Select
                value={watch('category')}
                onValueChange={(v) => setValue('category', v)}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="amount">Amount (৳) *</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                {...register('amount', { valueAsNumber: true })}
                className="mt-1.5"
              />
              {errors.amount && (
                <p className="mt-1 text-xs text-destructive">
                  {errors.amount.message}
                </p>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Office Rent - May 2026"
              {...register('title')}
              className="mt-1.5"
            />
            {errors.title && (
              <p className="mt-1 text-xs text-destructive">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Date + Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                {...register('date')}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Payment method</Label>
              <Select
                value={watch('paymentMethod')}
                onValueChange={(v) => setValue('paymentMethod', v)}
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
          </div>

          {/* Reference */}
          <div>
            <Label htmlFor="reference">Reference (optional)</Label>
            <Input
              id="reference"
              placeholder="Receipt/bill number"
              {...register('reference')}
              className="mt-1.5"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Optional notes..."
              rows={2}
              {...register('description')}
              className="mt-1.5"
            />
          </div>
        </form>

        <DialogFooter className="border-t border-border pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEdit ? 'Save changes' : 'Create expense'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}