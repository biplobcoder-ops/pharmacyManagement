import { ShoppingCart, Trash2 } from 'lucide-react';
import CartItem from './CartItem';
import EmptyState from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';

export default function Cart({ items, onUpdateQuantity, onRemove, onClear }) {
  const isEmpty = !items || items.length === 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-4 w-4 text-accent" />
          <h3 className="text-sm font-semibold text-foreground">
            Current Cart
          </h3>
          <span className="rounded-full bg-accent/10 text-accent px-2 py-0.5 text-[10px] font-bold">
            {items?.length || 0}
          </span>
        </div>
        {!isEmpty && onClear && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="h-7 text-[10px] text-destructive hover:text-destructive gap-1 px-2"
          >
            <Trash2 className="h-3 w-3" />
            Clear
          </Button>
        )}
      </div>

      {/* Content */}
      {isEmpty ? (
        <div className="flex-1 flex items-center justify-center">
          <EmptyState
            icon={ShoppingCart}
            title="Cart is empty"
            description="Add medicines from the left to start a sale."
          />
        </div>
      ) : (
        // ✅ Fixed height for ~3 items + scroll for overflow
        <div
          className="overflow-y-auto scrollbar-thin p-3 space-y-2"
          style={{ maxHeight: '320px' }} // ✅ ~3 items × ~100px each
        >
          {items.map((item, index) => (
            <CartItem
              key={`${item.medicine._id}-${index}`}
              item={item}
              index={index}
              onUpdateQuantity={onUpdateQuantity}
              onRemove={onRemove}
            />
          ))}
        </div>
      )}
    </div>
  );
}