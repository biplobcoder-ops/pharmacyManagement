import { Loader2 } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { EXPENSE_CATEGORIES } from '../financeTypes';
import { useGetExpenseByIdQuery } from '../financeApi';

export default function ExpenseViewDialog({ open, onOpenChange, expenseId }) {
  const { data: res, isLoading } = useGetExpenseByIdQuery(expenseId, {
    skip: !expenseId
  });

  const expense = res?.data;

  const getCategoryLabel = (val) => {
    const cat = EXPENSE_CATEGORIES.find((c) => c.value === val);
    return cat?.label || val;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between pr-8">
            <div>
              <DialogTitle>Expense details</DialogTitle>
              <DialogDescription>
                {expense && expense.expenseNumber}
              </DialogDescription>
            </div>
            {expense && (
              <Badge variant="secondary" className="capitalize">
                {getCategoryLabel(expense.category)}
              </Badge>
            )}
          </div>
        </DialogHeader>

        {isLoading || !expense ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Title</p>
                <p className="text-sm font-medium">{expense.title}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Date</p>
                <p className="text-sm font-medium">{formatDate(expense.date)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Method</p>
                <p className="text-sm font-medium capitalize">
                  {expense.paymentMethod}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Reference</p>
                <p className="text-sm font-medium font-mono">
                  {expense.reference || '—'}
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-muted/40 p-4">
              <div className="flex justify-between text-base font-bold">
                <span>Amount</span>
                <span className="tabular-nums text-destructive">
                  {formatCurrency(expense.amount)}
                </span>
              </div>
            </div>

            {expense.description && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Description</p>
                <p className="text-sm">{expense.description}</p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}