import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import PurchaseItemRow from './PurchaseItemRow';

export default function PurchaseItemsForm({
  items,
  medicines,
  onChange,
  onAdd,
  onRemove
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold">
          Items <span className="text-destructive">*</span>
        </Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAdd}
          className="h-8"
        >
          <Plus className="h-3.5 w-3.5" />
          Add item
        </Button>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-thin pr-1">
        {items.map((item, index) => (
          <PurchaseItemRow
            key={index}
            index={index}
            item={item}
            medicines={medicines}
            onChange={onChange}
            onRemove={onRemove}
            canRemove={items.length > 1}
          />
        ))}
      </div>
    </div>
  );
}