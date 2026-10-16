import { Loader2, RotateCcw, TrendingDown } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog';

import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDateTime, formatNumber } from '@/lib/utils';
import { RETURN_STATUS } from '../returnsTypes';
import {
  useGetSalesReturnByIdQuery,
  useGetPurchaseReturnByIdQuery
} from '../returnsApi';

export default function ReturnViewDialog({
  open,
  onOpenChange,
  returnId,
  type = 'sales'
}) {
  // ✅ Call both hooks unconditionally
  const salesRes = useGetSalesReturnByIdQuery(returnId, {
    skip: !returnId || type !== 'sales'
  });
  const purchaseRes = useGetPurchaseReturnByIdQuery(returnId, {
    skip: !returnId || type !== 'purchase'
  });

  const res = type === 'sales' ? salesRes : purchaseRes;
  const { data, isLoading } = res;
  const returnDoc = data?.data;

  const isSales = type === 'sales';
  const Icon = isSales ? RotateCcw : TrendingDown;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between pr-8">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <Icon className="h-5 w-5 text-accent" />
                {isSales ? 'Sales Return' : 'Purchase Return'} Details
              </DialogTitle>
              <DialogDescription>
                {returnDoc && `${returnDoc.returnNumber}`}
              </DialogDescription>
            </div>
            {returnDoc && (
              <Badge
                variant={RETURN_STATUS[returnDoc.status]?.variant || 'secondary'}
                className="gap-1.5"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {RETURN_STATUS[returnDoc.status]?.label || returnDoc.status}
              </Badge>
            )}
          </div>
        </DialogHeader>

        {isLoading || !returnDoc ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-5 overflow-y-auto scrollbar-thin pr-1">
            {/* Header info */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">
                  {isSales ? 'Original Sale' : 'Original Purchase'}
                </p>
                <p className="text-sm font-medium font-mono">
                  {isSales
                    ? returnDoc.sale?.invoiceNumber
                    : returnDoc.purchase?.invoiceNumber}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  {isSales ? 'Customer' : 'Supplier'}
                </p>
                <p className="text-sm font-medium">
                  {isSales
                    ? returnDoc.customer?.name || 'Walk-in'
                    : returnDoc.supplier?.name}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Return date</p>
                <p className="text-sm font-medium">
                  {formatDateTime(returnDoc.returnDate)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Reason</p>
                <p className="text-sm font-medium truncate">{returnDoc.reason}</p>
              </div>
            </div>

            {/* Items */}
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
                    {returnDoc.items?.map((item) => (
                      <tr key={item._id} className="border-t border-border">
                        <td className="px-4 py-2.5">
                          <p className="text-sm font-medium">
                            {item.medicineName}
                          </p>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
                            {item.batchNumber}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-right text-sm tabular-nums">
                          {formatNumber(item.quantity)}
                        </td>
                        <td className="px-4 py-2.5 text-right text-sm tabular-nums">
                          {formatCurrency(
                            isSales ? item.sellingPrice : item.purchasePrice
                          )}
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
              <div className="flex justify-between text-base font-semibold">
                <span>Total Return</span>
                <span className="tabular-nums">
                  {formatCurrency(returnDoc.total)}
                </span>
              </div>
              {isSales && returnDoc.refundAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Refund Amount</span>
                  <span className="tabular-nums text-success">
                    {formatCurrency(returnDoc.refundAmount)}
                  </span>
                </div>
              )}
              {isSales && returnDoc.refundMethod && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Refund Method</span>
                  <span className="capitalize">{returnDoc.refundMethod}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}