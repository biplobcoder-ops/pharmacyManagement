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
import { formatCurrency, formatNumber } from '@/lib/utils';
import {
  useCreatePurchaseReturnMutation,
  useGetPurchaseByIdQuery
} from '../purchaseApi';

export default function PurchaseReturnFormDialog({
  open,
  onOpenChange,
  purchaseId,
  onSuccess
}) {
  const user = useSelector((state) => state.auth.user);
  const branchId = useMemo(() => {
    if (!user?.branch) return null;
    if (typeof user.branch === 'string') return user.branch;
    return user.branch._id;
  }, [user]);

  // ✅ Fetch full purchase with populated items
  const {
    data: res,
    isLoading: isLoadingPurchase,
    isFetching
  } = useGetPurchaseByIdQuery(purchaseId, {
    skip: !open || !purchaseId,
    refetchOnMountOrArgChange: true
  });

  const purchase = res?.data;

  const [createPurchaseReturn, { isLoading: isCreating }] =
    useCreatePurchaseReturnMutation();

  const [items, setItems] = useState([]);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  // ✅ Initialize items when purchase data loads
  useEffect(() => {
    if (open && purchase && Array.isArray(purchase.items)) {
      const initial = purchase.items.map((item) => {
        // item could be populated object OR ObjectId string
        const isPopulated = typeof item === 'object' && item.medicineName;

        const originalQty = isPopulated ? item.quantity || 0 : 0;
        const returnedQty = isPopulated ? item.returnedQuantity || 0 : 0;
        const eligible = Math.max(0, originalQty - returnedQty);

        return {
          purchaseItemId: isPopulated ? item._id : item,
          medicineName: isPopulated ? item.medicineName : 'Unknown',
          batchNumber: isPopulated ? item.batchNumber : '—',
          originalQuantity: originalQty,
          returnedQuantity: returnedQty,
          eligibleQuantity: eligible,
          purchasePrice: isPopulated ? item.purchasePrice || 0 : 0,
          returnQuantity: 0
        };
      });
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setItems(initial);
      setReason('');
      setNotes('');
    }
  }, [open, purchase]);

  const totalReturn = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + item.returnQuantity * item.purchasePrice,
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
    if (!purchase) {
      toast.error('Purchase data not loaded');
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
      purchase: purchase._id,
      branch: branchId,
      items: returnItems.map((item) => ({
        purchaseItem: item.purchaseItemId,
        quantity: item.returnQuantity
      })),
      reason: reason.trim(),
      notes: notes.trim() || undefined
    };

    console.log('[PurchaseReturnFormDialog] payload:', payload);

    try {
      const result = await createPurchaseReturn(payload).unwrap();
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
  const isLoading = isLoadingPurchase || isFetching || isCreating;
  const hasItems = items.length > 0 && items.some((i) => i.eligibleQuantity > 0);
  const canSubmit =
    totalReturn > 0 && reason.trim().length > 0 && !isCreating && hasItems;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-orange-500" />
            Create Purchase Return
          </DialogTitle>
          <DialogDescription>
            {purchase ? (
              <>
                Returning items to supplier from purchase{' '}
                <strong className="font-mono">{purchase.invoiceNumber}</strong>
                {purchase.supplier?.name && (
                  <>
                    {' · '}
                    <span className="text-foreground font-medium">
                      {purchase.supplier.name}
                    </span>
                  </>
                )}
              </>
            ) : (
              'Loading purchase details...'
            )}
          </DialogDescription>
        </DialogHeader>

        {isLoadingPurchase ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto scrollbar-thin pr-1 space-y-5">
            {!hasItems ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No items available to return (all items already returned or no
                items in this purchase).
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
                    const lineTotal = item.returnQuantity * item.purchasePrice;
                    const isDisabled = item.eligibleQuantity === 0;

                    return (
                      <div
                        key={item.purchaseItemId}
                        className={`rounded-lg border p-3 ${
                          item.returnQuantity > 0
                            ? 'border-orange-500 bg-orange-500/5'
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
                                Purchased: {formatNumber(item.originalQuantity)}
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
                              {formatCurrency(item.purchasePrice)}
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
                            <span className="ml-auto text-sm font-bold text-orange-500 tabular-nums">
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
                placeholder="e.g., Damaged, expired, wrong delivery..."
                rows={2}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label>Total return value</Label>
              <div className="mt-1.5 h-10 rounded-lg bg-muted/40 px-3 flex items-center justify-end text-base font-bold tabular-nums text-orange-500">
                {formatCurrency(totalReturn || 0)}
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
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            {isCreating && <Loader2 className="h-4 w-4 animate-spin" />}
            Create return ({formatCurrency(totalReturn || 0)})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}