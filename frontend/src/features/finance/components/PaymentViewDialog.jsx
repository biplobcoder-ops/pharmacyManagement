import { Loader2 } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { useGetPaymentByIdQuery } from '../financeApi';

export default function PaymentViewDialog({ open, onOpenChange, paymentId }) {
  const { data: res, isLoading } = useGetPaymentByIdQuery(paymentId, {
    skip: !paymentId
  });

  const payment = res?.data;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between pr-8">
            <div>
              <DialogTitle>Payment details</DialogTitle>
              <DialogDescription>
                {payment && payment.paymentNumber}
              </DialogDescription>
            </div>
            {payment && (
              <Badge
                variant={payment.type === 'customer' ? 'success' : 'warning'}
              >
                {payment.type === 'customer' ? 'Customer Payment' : 'Supplier Payment'}
              </Badge>
            )}
          </div>
        </DialogHeader>

        {isLoading || !payment ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Party</p>
                <p className="text-sm font-medium">
                  {payment.type === 'customer'
                    ? payment.customer?.name || 'Walk-in'
                    : payment.supplier?.name}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Method</p>
                <p className="text-sm font-medium capitalize">{payment.method}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Date</p>
                <p className="text-sm font-medium">
                  {formatDateTime(payment.date)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Reference</p>
                <p className="text-sm font-medium font-mono">
                  {payment.reference || '—'}
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-muted/40 p-4 space-y-2">
              <div className="flex justify-between text-base font-bold">
                <span>Amount</span>
                <span className="tabular-nums text-success">
                  {formatCurrency(payment.amount)}
                </span>
              </div>
            </div>

            {payment.notes && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Notes</p>
                <p className="text-sm">{payment.notes}</p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}