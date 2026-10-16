import { useEffect, useMemo, useState } from 'react';
import { Loader2, RotateCcw } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { REFUND_METHODS } from '@/features/returns/returnsTypes';
import {
  useCreateSalesReturnMutation,
  useGetSaleByIdQuery
} from '../salesApi';

export default function SalesReturnFormDialog({
  open,
  onOpenChange,
  saleId,
  onSuccess
}) {
  const user = useSelector((state) => state.auth.user);
  const branchId = useMemo(() => {
    if (!user?.branch) return null;
    if (typeof user.branch === 'string') return user.branch;
    return user.branch._id;
  }, [user]);

  // ✅ Fetch full sale with populated items
  const {
    data: res,
    isLoading: isLoadingSale,
    isFetching
  } = useGetSaleByIdQuery(saleId, {
    skip: !open || !saleId,
    refetchOnMountOrArgChange: true
  });

  const sale = res?.data;

  const [createSalesReturn, { isLoading: isCreating }] =
    useCreateSalesReturnMutation();

  const [items, setItems] = useState([]);
  const [reason, setReason] = useState('');
  const [refundMethod, setRefundMethod] = useState('cash');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (open && sale && Array.isArray(sale.items)) {
      const initial = sale.items.map((item) => {
        const isPopulated = typeof item === 'object' && item.medicineName;

        const originalQty = isPopulated ? item.quantity || 0 : 0;
        const returnedQty = isPopulated ? item.returnedQuantity || 0 : 0;
        const eligible = Math.max(0, originalQty - returnedQty);

        return {
          saleItemId: isPopulated ? item._id : item,
          medicineName: isPopulated ? item.medicineName : 'Unknown',
          batchNumber: isPopulated ? item.batchNumber : '—',
          originalQuantity: originalQty,
          returnedQuantity: returnedQty,
          eligibleQuantity: eligible,
          sellingPrice: isPopulated ? item.sellingPrice || 0 : 0,
          returnQuantity: 0
        };
      });
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setItems(initial);
      setReason('');
      setRefundMethod('cash');
      setNotes('');
    }
  }, [open, sale]);

  const totalRefund = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + item.returnQuantity * item.sellingPrice,
        0
      ),
    [items]
  );

  const handleQuantityChange = (index, value) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const numValue = parseInt(value) || 0;
        const clamped = Math.max(0, Math.min(numValue, item.eligibleQuantity));
        return { ...item, returnQuantity: clamped };
      })
    );
  };

  const handleSelectAll = (index) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, returnQuantity: item.eligibleQuantity } : item
      )
    );
  };

  const handleClearItem = (index) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, returnQuantity: 0 } : item))
    );
  };

  const handleSubmit = async () => {
    if (!sale) {
      toast.error('Sale data not loaded');
      return;
    }

    if (!branchId) {
      toast.error('Branch not found. Please re-login.');
      return;
    }

    if (!reason.trim()) {
      toast.error('Reason is required');
      return;
    }

    const returnItems = items.filter((item) => item.returnQuantity > 0);
    if (returnItems.length === 0) {
      toast.error('Select at least one item to return');
      return;
    }

    const payload = {
      sale: sale._id,
      branch: branchId,
      items: returnItems.map((item) => ({
        saleItem: item.saleItemId,
        quantity: item.returnQuantity
      })),
      refundAmount: totalRefund,
      refundMethod,
      reason: reason.trim(),
      notes: notes.trim() || undefined
    };

    console.log('[SalesReturnFormDialog] payload:', payload);

    try {
      const result = await createSalesReturn(payload).unwrap();
      toast.success(`Return created — ${result.data.returnNumber}`);
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      const msg =
        error?.data?.message ||
        error?.data?.errors?.[0]?.message ||
        'Failed to create return';
      toast.error(msg);
    }
  };

  // eslint-disable-next-line no-unused-vars
  const isLoading = isLoadingSale || isFetching || isCreating;
  const hasItems = items.length > 0 && items.some((i) => i.eligibleQuantity > 0);
  const canSubmit =
    totalRefund > 0 && reason.trim().length > 0 && !isCreating && hasItems;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-accent" />
            Create Sales Return
          </DialogTitle>
          <DialogDescription>
            {sale ? (
              <>
                Returning items from sale{' '}
                <strong className="font-mono">{sale.invoiceNumber}</strong>
                {sale.customerName && (
                  <>
                    {' · '}
                    <span className="text-foreground font-medium">
                      {sale.customerName}
                    </span>
                  </>
                )}
              </>
            ) : (
              'Loading sale details...'
            )}
          </DialogDescription>
        </DialogHeader>

        {isLoadingSale ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto scrollbar-thin pr-1 space-y-5">
            {!hasItems ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No items available to return (all items already returned or no
                items in this sale).
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">Items to return</Label>
                  <span className="text-xs text-muted-foreground">
                    {items.filter((i) => i.returnQuantity > 0).length} of{' '}
                    {items.length} selected
                  </span>
                </div>

                <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-thin pr-1">
                  {items.map((item, index) => {
                    const lineTotal = item.returnQuantity * item.sellingPrice;
                    const isDisabled = item.eligibleQuantity === 0;

                    return (
                      <div
                        key={item.saleItemId}
                        className={`rounded-lg border p-3 ${
                          item.returnQuantity > 0
                            ? 'border-accent bg-accent/5'
                            : 'border-border bg-muted/20'
                        } ${isDisabled ? 'opacity-50' : ''}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {item.medicineName}
                            </p>
                            <p className="text-[10px] text-muted-foreground font-mono">
                              Batch: {item.batchNumber}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-1.5">
                              <Badge variant="secondary" className="text-[10px]">
                                Sold: {formatNumber(item.originalQuantity)}
                              </Badge>
                              {item.returnedQuantity > 0 && (
                                <Badge
                                  variant="warning"
                                  className="text-[10px]"
                                >
                                  Returned: {formatNumber(item.returnedQuantity)}
                                </Badge>
                              )}
                              <Badge variant="success" className="text-[10px]">
                                Eligible: {formatNumber(item.eligibleQuantity)}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-bold text-foreground tabular-nums">
                              {formatCurrency(item.sellingPrice)}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              each
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                          <Label className="text-xs text-muted-foreground whitespace-nowrap">
                            Return qty:
                          </Label>
                          <Input
                            type="number"
                            min="0"
                            max={item.eligibleQuantity}
                            value={item.returnQuantity || ''}
                            onChange={(e) =>
                              handleQuantityChange(index, e.target.value)
                            }
                            disabled={isDisabled}
                            className="w-20 h-8 text-right text-sm"
                            placeholder="0"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSelectAll(index)}
                            disabled={isDisabled}
                            className="h-8 text-xs"
                          >
                            All
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleClearItem(index)}
                            disabled={item.returnQuantity === 0}
                            className="h-8 text-xs"
                          >
                            Clear
                          </Button>
                          {item.returnQuantity > 0 && (
                            <span className="ml-auto text-sm font-bold text-accent tabular-nums">
                              = {formatCurrency(lineTotal)}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="return-reason">
                Reason <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="return-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g., Wrong medicine, expired, customer changed mind..."
                rows={2}
                className="mt-1.5"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Refund method</Label>
                <Select value={refundMethod} onValueChange={setRefundMethod}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REFUND_METHODS.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Total refund</Label>
                <div className="mt-1.5 h-10 rounded-lg bg-muted/40 px-3 flex items-center justify-end text-base font-bold tabular-nums text-success">
                  {formatCurrency(totalRefund || 0)}
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="return-notes">Notes (optional)</Label>
              <Textarea
                id="return-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes..."
                rows={2}
                className="mt-1.5"
              />
            </div>
          </div>
        )}

        <DialogFooter className="border-t border-border pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {isCreating && <Loader2 className="h-4 w-4 animate-spin" />}
            Create return ({formatCurrency(totalRefund || 0)})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}