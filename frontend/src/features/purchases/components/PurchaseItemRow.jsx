import { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { useGetBatchesQuery } from '../purchaseApi';

export default function PurchaseItemRow({
  index,
  item,
  medicines,
  onChange,
  onRemove,
  canRemove
}) {
  // Local state for number inputs (string value to avoid "0" issue)
  const [quantityStr, setQuantityStr] = useState(
    item.quantity ? String(item.quantity) : ''
  );
  const [freeQuantityStr, setFreeQuantityStr] = useState(
    item.freeQuantity ? String(item.freeQuantity) : '0'
  );
  const [purchasePriceStr, setPurchasePriceStr] = useState(
    item.purchasePrice ? String(item.purchasePrice) : ''
  );
  const [sellingPriceStr, setSellingPriceStr] = useState(
    item.sellingPrice ? String(item.sellingPrice) : ''
  );
  const [discountStr, setDiscountStr] = useState(
    item.discount ? String(item.discount) : '0'
  );

  // Batch combobox state
  const [batchNumber, setBatchNumber] = useState(item.batchNumber || '');
  const [batchDropdownOpen, setBatchDropdownOpen] = useState(false);
  const [filteredBatches, setFilteredBatches] = useState([]);

  // Get existing batches for selected medicine
  const { data: batchesRes } = useGetBatchesQuery(
    { medicine: item.medicine, limit: 50 },
    { skip: !item.medicine }
  );

  const existingBatches = batchesRes?.data?.batches || [];

  // Filter batches based on input
  useEffect(() => {
    if (!batchNumber) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFilteredBatches(existingBatches);
      return;
    }
    const filtered = existingBatches.filter((b) =>
      b.batchNumber.toLowerCase().includes(batchNumber.toLowerCase())
    );
    setFilteredBatches(filtered);
  }, [batchNumber, existingBatches]);

  // Sync when parent item changes externally (e.g., reset form)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuantityStr(item.quantity ? String(item.quantity) : '');
    setFreeQuantityStr(item.freeQuantity ? String(item.freeQuantity) : '0');
    setPurchasePriceStr(item.purchasePrice ? String(item.purchasePrice) : '');
    setSellingPriceStr(item.sellingPrice ? String(item.sellingPrice) : '');
    setDiscountStr(item.discount ? String(item.discount) : '0');
    setBatchNumber(item.batchNumber || '');
  }, [
    item.medicine,
    item.quantity,
    item.freeQuantity,
    item.purchasePrice,
    item.sellingPrice,
    item.discount,
    item.batchNumber
  ]);

  const update = (field, value) => {
    onChange(index, { ...item, [field]: value });
  };

  // Number input handlers
  const handleQuantityChange = (e) => {
    const val = e.target.value;
    if (val === '' || /^\d+$/.test(val)) {
      setQuantityStr(val);
      update('quantity', val === '' ? 0 : parseInt(val));
    }
  };

  const handleFreeQuantityChange = (e) => {
    const val = e.target.value;
    if (val === '' || /^\d+$/.test(val)) {
      setFreeQuantityStr(val);
      update('freeQuantity', val === '' ? 0 : parseInt(val));
    }
  };

  const handlePurchasePriceChange = (e) => {
    const val = e.target.value;
    if (val === '' || /^\d*\.?\d*$/.test(val)) {
      setPurchasePriceStr(val);
      update('purchasePrice', val === '' ? 0 : parseFloat(val));
    }
  };

  const handleSellingPriceChange = (e) => {
    const val = e.target.value;
    if (val === '' || /^\d*\.?\d*$/.test(val)) {
      setSellingPriceStr(val);
      update('sellingPrice', val === '' ? 0 : parseFloat(val));
    }
  };

  const handleDiscountChange = (e) => {
    const val = e.target.value;
    if (val === '' || /^\d*\.?\d*$/.test(val)) {
      setDiscountStr(val);
      update('discount', val === '' ? 0 : parseFloat(val));
    }
  };

  // Batch input handler
  const handleBatchChange = (e) => {
    const val = e.target.value.toUpperCase();
    setBatchNumber(val);
    update('batchNumber', val);
    setBatchDropdownOpen(true);
  };

  const handleBatchSelect = (batch) => {
    setBatchNumber(batch.batchNumber);
    update('batchNumber', batch.batchNumber);

    // Auto-fill expiry, purchase price, selling price
    onChange(index, {
      ...item,
      batchNumber: batch.batchNumber,
      expiryDate: batch.expiryDate,
      purchasePrice: batch.purchasePrice,
      sellingPrice: batch.sellingPrice
    });

    // Update local states
    setPurchasePriceStr(String(batch.purchasePrice));
    setSellingPriceStr(String(batch.sellingPrice));

    setBatchDropdownOpen(false);
  };

  // eslint-disable-next-line no-unused-vars
  const selectedMedicine = medicines.find((m) => m._id === item.medicine);

  const lineTotal =
    ((item.quantity || 0) + (item.freeQuantity || 0)) * (item.purchasePrice || 0) -
    (item.discount || 0);

  return (
    <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
      {/* Row 1: Medicine + Remove */}
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <Label className="text-xs">
            Medicine <span className="text-destructive">*</span>
          </Label>
          <Select
            value={item.medicine || ''}
            onValueChange={(v) => update('medicine', v)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select medicine" />
            </SelectTrigger>
            <SelectContent>
              {medicines.map((m) => (
                <SelectItem key={m._id} value={m._id}>
                  {m.name} · {m.strength}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onRemove(index)}
          disabled={!canRemove}
          className="mt-6 text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Row 2: Batch number (combobox) + Expiry */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <Label className="text-xs">
            Batch number <span className="text-destructive">*</span>
          </Label>
          <Input
            value={batchNumber}
            onChange={handleBatchChange}
            onFocus={() => setBatchDropdownOpen(true)}
            onBlur={() => setTimeout(() => setBatchDropdownOpen(false), 200)}
            placeholder="Type or select batch"
            className="mt-1"
            autoComplete="off"
          />

          {/* Batch dropdown */}
          {batchDropdownOpen && item.medicine && (
            <div className="absolute z-50 w-full mt-1 max-h-48 overflow-y-auto scrollbar-thin rounded-lg border border-border bg-popover shadow-lg animate-fade-in">
              {filteredBatches.length === 0 ? (
                <div className="px-3 py-2 text-xs text-muted-foreground">
                  {batchNumber
                    ? `No batch matches "${batchNumber}" — you can create new`
                    : 'No existing batches for this medicine'}
                </div>
              ) : (
                filteredBatches.map((b) => (
                  <button
                    key={b._id}
                    type="button"
                    onClick={() => handleBatchSelect(b)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors border-b border-border last:border-0"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-medium">{b.batchNumber}</span>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {b.quantity} units
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Exp: {new Date(b.expiryDate).toLocaleDateString('en-GB')} ·
                      ৳{b.purchasePrice} / ৳{b.sellingPrice}
                    </p>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <div>
          <Label className="text-xs">
            Expiry date <span className="text-destructive">*</span>
          </Label>
          <Input
            type="date"
            value={item.expiryDate ? item.expiryDate.split('T')[0] : ''}
            onChange={(e) =>
              update(
                'expiryDate',
                e.target.value ? new Date(e.target.value).toISOString() : ''
              )
            }
            className="mt-1"
          />
        </div>
      </div>

      {/* Row 3: Quantity + Free + Purchase + Selling */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <Label className="text-xs">
            Quantity <span className="text-destructive">*</span>
          </Label>
          <Input
            type="text"
            inputMode="numeric"
            value={quantityStr}
            onChange={handleQuantityChange}
            placeholder="0"
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-xs">Free qty</Label>
          <Input
            type="text"
            inputMode="numeric"
            value={freeQuantityStr}
            onChange={handleFreeQuantityChange}
            placeholder="0"
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-xs">
            Purchase price <span className="text-destructive">*</span>
          </Label>
          <Input
            type="text"
            inputMode="decimal"
            value={purchasePriceStr}
            onChange={handlePurchasePriceChange}
            placeholder="0.00"
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-xs">
            Selling price <span className="text-destructive">*</span>
          </Label>
          <Input
            type="text"
            inputMode="decimal"
            value={sellingPriceStr}
            onChange={handleSellingPriceChange}
            placeholder="0.00"
            className="mt-1"
          />
        </div>
      </div>

      {/* Row 4: Discount + Line total */}
      <div className="flex items-center justify-between gap-3 pt-2 border-t border-border">
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground">Discount</Label>
          <Input
            type="text"
            inputMode="decimal"
            value={discountStr}
            onChange={handleDiscountChange}
            placeholder="0"
            className="w-24 h-8 text-right text-sm"
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">Line total:</span>
          <span className="text-sm font-semibold text-foreground tabular-nums">
            ৳{lineTotal.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}