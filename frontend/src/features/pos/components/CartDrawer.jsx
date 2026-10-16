// src/features/pos/components/CartDrawer.jsx
// ✅ Mobile cart drawer — slides from bottom

import { X, ShoppingCart, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useDispatch, useSelector } from 'react-redux';

import Cart from './Cart';
import CustomerSelect from './CustomerSelect';
import SaleSummary from './SaleSummary';
import PaymentSection from './PaymentSection';

import {
  setCustomer,
  setDiscount,
  setTax,
  setPaidAmount,
  setPaymentMethod,
  clearCart,
  selectCartItems,
  selectCustomer,
  selectSubtotal,
  selectTotal,
  selectDueAmount
} from '../posSlice';

export default function CartDrawer({
  open,
  onOpenChange,
  onUpdateQuantity,
  onRemove,
  onComplete,
  isCreating
}) {
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const customer = useSelector(selectCustomer);
  const subtotal = useSelector(selectSubtotal);
  const total = useSelector(selectTotal);
  const dueAmount = useSelector(selectDueAmount);
  const { discount, tax, paidAmount, paymentMethod } = useSelector((s) => s.pos);

  const handleClear = () => {
    if (cartItems.length === 0) return;
    if (window.confirm('Clear the cart?')) {
      dispatch(clearCart());
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden',
          'transition-opacity duration-300',
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => onOpenChange(false)}
      />

      {/* Drawer */}
      <div
        className={cn(
          'fixed inset-x-0 bottom-0 z-50 lg:hidden',
          'h-[92vh] bg-card rounded-t-3xl',
          'flex flex-col',
          'transition-transform duration-300 ease-out',
          open ? 'translate-y-0' : 'translate-y-full'
        )}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-accent/10 p-1.5">
              <ShoppingCart className="h-4 w-4 text-accent" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">
                Your Cart
              </h2>
              <p className="text-[10px] text-muted-foreground">
                {cartItems.length} item{cartItems.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {cartItems.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="h-8 text-destructive hover:text-destructive gap-1 px-2"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span className="text-[10px]">Clear</span>
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Customer */}
        <div className="px-4 pt-3 pb-3 border-b border-border shrink-0">
          <CustomerSelect
            value={customer}
            onChange={(c) => dispatch(setCustomer(c))}
          />
        </div>

        {/* Cart items — scrollable */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <Cart
            items={cartItems}
            onUpdateQuantity={onUpdateQuantity}
            onRemove={onRemove}
            onClear={handleClear}
          />
        </div>

        {/* Summary + Payment — always visible at bottom */}
        <div className="p-4 space-y-3 border-t border-border bg-muted/20 shrink-0">
          <SaleSummary
            subtotal={subtotal}
            discount={discount}
            tax={tax}
            total={total}
            onDiscountChange={(v) => dispatch(setDiscount(v))}
            onTaxChange={(v) => dispatch(setTax(v))}
          />

          <PaymentSection
            method={paymentMethod}
            onMethodChange={(m) => dispatch(setPaymentMethod(m))}
            paidAmount={paidAmount}
            onPaidChange={(v) => dispatch(setPaidAmount(v))}
            dueAmount={dueAmount}
            total={total}
            isLoading={isCreating}
            disabled={cartItems.length === 0}
            onComplete={onComplete}
          />
        </div>
      </div>
    </>
  );
}