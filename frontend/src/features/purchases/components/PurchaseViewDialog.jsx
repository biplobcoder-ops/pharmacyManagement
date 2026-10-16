import { Loader2 } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { PAYMENT_STATUS } from '../purchaseTypes';
import { useGetPurchaseByIdQuery } from '../purchaseApi';

export default function PurchaseViewDialog({ open, onOpenChange, purchaseId }) {
  const { data: res, isLoading } = useGetPurchaseByIdQuery(purchaseId, {
    skip: !purchaseId
  });

  const purchase = res?.data;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Purchase details</DialogTitle>
          <DialogDescription>
            {purchase && `Invoice ${purchase.invoiceNumber}`}
          </DialogDescription>
        </DialogHeader>

        {isLoading || !purchase ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-5 max-h-[60vh] overflow-y-auto scrollbar-thin pr-1">
            {/* Header info */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Supplier</p>
                <p className="text-sm font-medium">{purchase.supplier?.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Date</p>
                <p className="text-sm font-medium">
                  {formatDate(purchase.purchaseDate)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <Badge variant={PAYMENT_STATUS[purchase.paymentStatus]?.variant || 'secondary'}>
                  {PAYMENT_STATUS[purchase.paymentStatus]?.label || purchase.paymentStatus}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Items</p>
                <p className="text-sm font-medium">{purchase.items?.length || 0}</p>
              </div>
            </div>

            {/* Items table */}
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead className="bg-muted/40">
                    <tr>
                      <th className="text-left text-[10px] font-semibold uppercase text-muted-foreground px-4 py-2">
                        Medicine
                      </th>
                      <th className="text-left text-[10px] font-semibold uppercase text-muted-foreground px-4 py-2">
                        Batch
                      </th>
                      <th className="text-right text-[10px] font-semibold uppercase text-muted-foreground px-4 py-2">
                        Qty
                      </th>
                      <th className="text-right text-[10px] font-semibold uppercase text-muted-foreground px-4 py-2">
                        Price
                      </th>
                      <th className="text-right text-[10px] font-semibold uppercase text-muted-foreground px-4 py-2">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchase.items?.map((item) => (
                      <tr key={item._id} className="border-t border-border">
                        <td className="px-4 py-2.5">
                          <p className="text-sm font-medium">{item.medicineName}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {item.batchNumber}
                          </p>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
                            {item.batchNumber}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-right text-sm tabular-nums">
                          {item.quantity}
                          {item.freeQuantity > 0 && (
                            <span className="text-success text-xs ml-1">
                              +{item.freeQuantity}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-right text-sm tabular-nums">
                          {formatCurrency(item.purchasePrice)}
                        </td>
                        <td className="px-4 py-2.5 text-right text-sm font-medium tabular-nums">
                          {formatCurrency(item.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary */}
            <div className="rounded-lg bg-muted/40 p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="tabular-nums">{formatCurrency(purchase.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Discount</span>
                <span className="tabular-nums">-{formatCurrency(purchase.discount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span className="tabular-nums">{formatCurrency(purchase.tax)}</span>
              </div>
              <div className="flex justify-between text-base font-semibold border-t border-border pt-2">
                <span>Total</span>
                <span className="tabular-nums">{formatCurrency(purchase.total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Paid</span>
                <span className="tabular-nums text-success">
                  {formatCurrency(purchase.paidAmount)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Due</span>
                <span className="tabular-nums text-warning">
                  {formatCurrency(purchase.dueAmount)}
                </span>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}