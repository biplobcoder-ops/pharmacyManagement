// src/features/pos/components/MedicineSearch.jsx
// Search bar + Barcode scanner button

import { useEffect, useRef, useState } from 'react';
import { Search, X, Camera } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import BarcodeScannerDialog from './BarcodeScannerDialog';

export default function MedicineSearch({
  value,
  onChange,
  onBarcodeSearch,
  className
}) {
  const inputRef = useRef(null);
  const [scannerOpen, setScannerOpen] = useState(false);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && value.trim()) {
      const isBarcode = /^\d{8,}$/.test(value.trim());
      if (isBarcode && onBarcodeSearch) {
        onBarcodeSearch(value.trim());
      }
    }
    if (e.key === 'Escape') {
      onChange('');
    }
  };

  const handleScanSuccess = (barcode) => {
    if (onBarcodeSearch) {
      onBarcodeSearch(barcode);
    }
  };

  return (
    <>
      <div className={cn('relative', className)}>
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search products by name, SKU or barcode..."
          className="pl-11 pr-24 h-12 text-sm rounded-xl bg-muted/40 border-border focus-visible:bg-background"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {/* ✅ Scan button */}
          <button
            type="button"
            onClick={() => setScannerOpen(true)}
            className="rounded-lg p-2 hover:bg-accent/10 transition-colors group"
            title="Scan barcode"
          >
            <Camera className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
          </button>

          {/* Clear button */}
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="rounded-lg p-2 hover:bg-muted transition-colors"
              title="Clear"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* ✅ Barcode scanner dialog */}
      <BarcodeScannerDialog
        open={scannerOpen}
        onOpenChange={setScannerOpen}
        onScanSuccess={handleScanSuccess}
      />
    </>
  );
}