// src/features/pos/pages/POSPage.jsx
// ✅ Mobile: Full medicine grid + Floating cart
// ✅ Desktop: Side-by-side layout

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';

import { Card } from '@/components/ui/card';
import { useDebounce } from '@/hooks/useDebounce';

import MedicineSearch from '../components/MedicineSearch';
import MedicineGrid from '../components/MedicineGrid';
import Cart from '../components/Cart';
import CustomerSelect from '../components/CustomerSelect';
import SaleSummary from '../components/SaleSummary';
import PaymentSection from '../components/PaymentSection';
import SaleSuccessDialog from '../components/SaleSuccessDialog';
import FloatingCart from '../components/FloatingCart';       // ✅ NEW
import CartDrawer from '../components/CartDrawer';           // ✅ NEW

import {
  addItem,
  updateQuantity,
  removeItem,
  clearCart,
  setCustomer,
  setDiscount,
  setTax,
  setPaidAmount,
  setPaymentMethod,
  selectCartItems,
  selectCustomer,
  selectSubtotal,
  selectTotal,
  selectDueAmount
} from '../posSlice';

import {
  useSearchMedicinesQuery,
  useLazyGetMedicineByBarcodeQuery,
  useCreateSaleMutation
} from '../posApi';

export default function POSPage() {
  const dispatch = useDispatch();

  const [search, setSearch] = useState('');
  const [branchId, setBranchId] = useState(null);

  const [successOpen, setSuccessOpen] = useState(false);
  const [completedSale, setCompletedSale] = useState(null);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);   // ✅ NEW

  const debouncedSearch = useDebounce(search, 300);

  const cartItems = useSelector(selectCartItems);
  const customer = useSelector(selectCustomer);
  const subtotal = useSelector(selectSubtotal);
  const total = useSelector(selectTotal);
  const dueAmount = useSelector(selectDueAmount);
  const { discount, tax, paidAmount, paymentMethod } = useSelector((s) => s.pos);

  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    const id = user?.branch?._id || user?.branch || null;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBranchId(id);
  }, [user]);

  const { data: medicinesRes, isLoading, isError } = useSearchMedicinesQuery(
    {
      search: debouncedSearch || undefined,
      status: 'active',
      limit: 50
    },
    { refetchOnMountOrArgChange: true }
  );

  const medicines = medicinesRes?.data?.medicines || [];

  const [triggerBarcodeSearch] = useLazyGetMedicineByBarcodeQuery();
  const [createSale, { isLoading: isCreating }] = useCreateSaleMutation();

  const handleAdd = (medicine) => {
    dispatch(
      addItem({
        medicine: {
          ...medicine,
          sellingPrice: medicine.sellingPrice || 0,
          costPrice: medicine.purchasePrice || 0
        },
        quantity: 1
      })
    );
    toast.success(`${medicine.name} added`, { duration: 1000 });
  };

  const handleBarcodeSearch = async (barcode) => {
    if (!barcode) return;
    try {
      const result = await triggerBarcodeSearch(barcode).unwrap();
      const medicine = result?.data;
      if (medicine) {
        handleAdd(medicine);
        setSearch('');
      }
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast.error('Medicine not found for this barcode');
    }
  };

  const handleUpdateQuantity = (index, quantity) => {
    dispatch(updateQuantity({ index, quantity }));
  };

  const handleRemove = (index) => {
    dispatch(removeItem(index));
  };

  const handleClear = () => {
    if (cartItems.length === 0) return;
    if (window.confirm('Clear the cart?')) {
      dispatch(clearCart());
    }
  };

  const handleComplete = async () => {
    if (cartItems.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    if (!branchId) {
      toast.error('Branch not found. Please re-login.');
      return;
    }

    if (!customer && dueAmount > 0) {
      toast.error('Walk-in customer cannot have due. Full payment required.');
      return;
    }

    try {
      const payload = {
        branch: branchId,
        customer: customer?._id || null,
        items: cartItems.map((it) => ({
          medicine: it.medicine._id,
          quantity: it.quantity,
          discount: it.discount || 0
        })),
        discount: discount || 0,
        tax: tax || 0,
        paidAmount: paidAmount || 0,
        paymentMethod: paymentMethod || 'cash'
      };

      const result = await createSale(payload).unwrap();

      setCompletedSale(result.data);
      setSuccessOpen(true);
      dispatch(clearCart());

      // ✅ Close cart drawer
      setCartDrawerOpen(false);
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to complete sale');
    }
  };

  const handleNewSale = () => {
    setCompletedSale(null);
    setSuccessOpen(false);
  };

  return (
    <>
      {/* ===== MAIN LAYOUT ===== */}
      <div className="flex flex-col lg:grid lg:grid-cols-12 lg:gap-4 lg:h-[calc(100vh-6rem)]">

        {/* ===== MEDICINE AREA (full width mobile, 8 cols desktop) ===== */}
        <div className="lg:col-span-8 flex flex-col gap-3 lg:min-h-0">
          <MedicineSearch
            value={search}
            onChange={setSearch}
            onBarcodeSearch={handleBarcodeSearch}
          />

          {/* Medicine grid — full height on mobile (no cart taking space) */}
          <div className="flex-1 overflow-y-auto scrollbar-thin pr-1 -mr-1 pb-24 lg:pb-0">
            <MedicineGrid
              medicines={medicines}
              isLoading={isLoading}
              error={isError}
              onAdd={handleAdd}
            />
          </div>
        </div>

        {/* ===== DESKTOP ONLY: Cart section (right side) ===== */}
        <div className="hidden lg:flex lg:col-span-4 flex-col min-h-0">
          <Card className="flex flex-col h-full overflow-hidden">
            {/* Customer */}
            <div className="px-4 pt-3 pb-3 border-b border-border shrink-0">
              <CustomerSelect
                value={customer}
                onChange={(c) => dispatch(setCustomer(c))}
              />
            </div>

            {/* Cart */}
            <div className="flex-1 min-h-0 overflow-hidden">
              <Cart
                items={cartItems}
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={handleRemove}
                onClear={handleClear}
              />
            </div>

            {/* Summary + Payment */}
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
                onComplete={handleComplete}
              />
            </div>
          </Card>
        </div>
      </div>

      {/* ✅ MOBILE: Floating cart button */}
      <FloatingCart
        itemCount={cartItems.length}
        total={total}
        onClick={() => setCartDrawerOpen(true)}
      />

      {/* ✅ MOBILE: Cart drawer (slide from bottom) */}
      <CartDrawer
        open={cartDrawerOpen}
        onOpenChange={setCartDrawerOpen}
        onUpdateQuantity={handleUpdateQuantity}
        onRemove={handleRemove}
        onComplete={handleComplete}
        isCreating={isCreating}
      />

      {/* Sale success dialog */}
      <SaleSuccessDialog
        open={successOpen}
        onOpenChange={setSuccessOpen}
        sale={completedSale}
        onNewSale={handleNewSale}
      />
    </>
  );
}