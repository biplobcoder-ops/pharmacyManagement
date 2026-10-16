import { useEffect, useMemo, useState } from 'react';
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
import PurchaseItemsForm from './PurchaseItemsForm';
import {
  useCreatePurchaseMutation,
  useGetMedicinesQuery
} from '../purchaseApi';
// ✅ Import supplier options from supplierApi
import { useGetSupplierOptionsQuery } from '@/features/suppliers/supplierApi';
import { PAYMENT_METHODS } from '../purchaseTypes';
import { formatCurrency } from '@/lib/utils';

const EMPTY_ITEM = {
  medicine: '',
  batchNumber: '',
  expiryDate: '',
  quantity: 1,
  freeQuantity: 0,
  purchasePrice: 0,
  sellingPrice: 0,
  discount: 0
};

export default function PurchaseFormDialog({ open, onOpenChange, branchId, onSuccess }) {
  // ✅ Use dedicated options endpoint (no cache conflict)
  const { data: suppliersRes, isLoading: suppliersLoading } =
    useGetSupplierOptionsQuery(undefined, { skip: !open });

  const { data: medicinesRes, isLoading: medicinesLoading } = useGetMedicinesQuery(
    { limit: 100 },
    { skip: !open }
  );

  const suppliers = suppliersRes?.data?.suppliers || [];
  const medicines = medicinesRes?.data?.medicines || [];

  const [createPurchase, { isLoading }] = useCreatePurchaseMutation();

  const [supplier, setSupplier] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [items, setItems] = useState([{ ...EMPTY_ITEM }]);
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSupplier('');
      setPurchaseDate(new Date().toISOString().split('T')[0]);
      setItems([{ ...EMPTY_ITEM }]);
      setDiscount(0);
      setTax(0);
      setPaidAmount(0);
      setPaymentMethod('cash');
      setNotes('');
    }
  }, [open]);

  const subtotal = useMemo(
    () =>
      items.reduce((sum, item) => {
        const qty = (item.quantity || 0) + (item.freeQuantity || 0);
        return sum + qty * (item.purchasePrice || 0) - (item.discount || 0);
      }, 0),
    [items]
  );

  const total = subtotal - discount + tax;
  const dueAmount = Math.max(0, total - paidAmount);

  const handleItemChange = (index, updatedItem) => {
    setItems((prev) => prev.map((it, i) => (i === index ? updatedItem : it)));
  };

  const handleAddItem = () => {
    setItems((prev) => [...prev, { ...EMPTY_ITEM }]);
  };

  const handleRemoveItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    if (!supplier) {
      toast.error('Please select a supplier');
      return false;
    }
    if (!branchId) {
      toast.error('Branch not found');
      return false;
    }
    if (items.length === 0) {
      toast.error('Add at least one item');
      return false;
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.medicine) {
        toast.error(`Item ${i + 1}: select a medicine`);
        return false;
      }
      if (!item.batchNumber) {
        toast.error(`Item ${i + 1}: batch number required`);
        return false;
      }
      if (!item.expiryDate) {
        toast.error(`Item ${i + 1}: expiry date required`);
        return false;
      }
      if (!item.quantity || item.quantity < 1) {
        toast.error(`Item ${i + 1}: quantity required`);
        return false;
      }
      if (item.purchasePrice === undefined || item.purchasePrice < 0) {
        toast.error(`Item ${i + 1}: purchase price required`);
        return false;
      }
      if (item.sellingPrice === undefined || item.sellingPrice < 0) {
        toast.error(`Item ${i + 1}: selling price required`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      const payload = {
        supplier,
        branch: branchId,
        purchaseDate: new Date(purchaseDate).toISOString(),
        items: items.map((it) => ({
          medicine: it.medicine,
          batchNumber: it.batchNumber,
          expiryDate: it.expiryDate,
          quantity: it.quantity,
          freeQuantity: it.freeQuantity || 0,
          purchasePrice: it.purchasePrice,
          sellingPrice: it.sellingPrice,
          discount: it.discount || 0
        })),
        discount,
        tax,
        paidAmount,
        paymentMethod,
        notes
      };

      await createPurchase(payload).unwrap();
      toast.success('Purchase created successfully');
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      const msg =
        error?.data?.message ||
        error?.data?.errors?.[0]?.message ||
        'Failed to create purchase';
      toast.error(msg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Create purchase</DialogTitle>
          <DialogDescription>
            Record a new purchase from supplier. Stock will update automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 overflow-y-auto scrollbar-thin pr-1 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>
                Supplier <span className="text-destructive">*</span>
              </Label>
              <Select
                value={supplier}
                onValueChange={setSupplier}
                disabled={suppliersLoading}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue
                    placeholder={
                      suppliersLoading ? 'Loading...' : 'Select supplier'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.length === 0 ? (
                    <div className="px-2 py-3 text-xs text-muted-foreground text-center">
                      No suppliers found
                    </div>
                  ) : (
                    suppliers.map((s) => (
                      <SelectItem key={s._id} value={s._id}>
                        {s.name}
                        {s.company ? ` — ${s.company}` : ''}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Purchase date</Label>
              <Input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="mt-1.5"
              />
            </div>
          </div>

          {medicinesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">
                Loading medicines...
              </span>
            </div>
          ) : (
            <PurchaseItemsForm
              items={items}
              medicines={medicines}
              onChange={handleItemChange}
              onAdd={handleAddItem}
              onRemove={handleRemoveItem}
            />
          )}

          <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium tabular-nums">
                {formatCurrency(subtotal)}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Discount</span>
              <Input
                type="number"
                min="0"
                value={discount}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                className="w-32 h-8 text-right"
              />
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Tax</span>
              <Input
                type="number"
                min="0"
                value={tax}
                onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                className="w-32 h-8 text-right"
              />
            </div>
            <div className="flex justify-between text-base font-semibold border-t border-border pt-2">
              <span>Total</span>
              <span className="tabular-nums">{formatCurrency(total)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Paid amount</Label>
              <Input
                type="number"
                min="0"
                max={total}
                value={paidAmount}
                onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                className="mt-1.5"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Due: <span className="font-medium">{formatCurrency(dueAmount)}</span>
              </p>
            </div>
            <div>
              <Label>Payment method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
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

          <div>
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes..."
              rows={2}
              className="mt-1.5"
            />
          </div>
        </div>

        <DialogFooter className="border-t border-border pt-4 mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            Create purchase
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}