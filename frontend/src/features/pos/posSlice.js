// src/features/pos/posSlice.js
// POS Cart state management — with floating point safety

import { createSlice } from '@reduxjs/toolkit';

// ✅ Money helper — 2 decimal round
const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

const initialState = {
  items: [],
  customer: null,
  discount: 0,
  tax: 0,
  paidAmount: 0,
  paymentMethod: 'cash',
  notes: '',
};

const posSlice = createSlice({
  name: 'pos',
  initialState,
  reducers: {
    addItem: (state, action) => {
      const { medicine, quantity = 1, batch } = action.payload;
      const existing = state.items.find(
        (it) => it.medicine._id === medicine._id && (!batch || it.batch?._id === batch?._id)
      );

      if (existing) {
        existing.quantity += quantity;
      } else {
        state.items.push({
          medicine,
          batch: batch || null,
          quantity,
          sellingPrice: round2(medicine.sellingPrice || 0),
          costPrice: round2(medicine.costPrice || 0),
          discount: 0
        });
      }
    },
    updateQuantity: (state, action) => {
      const { index, quantity } = action.payload;
      if (state.items[index]) {
        if (quantity <= 0) {
          state.items.splice(index, 1);
        } else {
          state.items[index].quantity = quantity;
        }
      }
    },
    updateItemDiscount: (state, action) => {
      const { index, discount } = action.payload;
      if (state.items[index]) {
        state.items[index].discount = round2(discount);
      }
    },
    removeItem: (state, action) => {
      state.items.splice(action.payload, 1);
    },
    clearCart: (state) => {
      state.items = [];
      state.customer = null;
      state.discount = 0;
      state.tax = 0;
      state.paidAmount = 0;
      state.paymentMethod = 'cash';
      state.notes = '';
    },
    setCustomer: (state, action) => {
      state.customer = action.payload;
    },
    setDiscount: (state, action) => {
      state.discount = round2(action.payload);
    },
    setTax: (state, action) => {
      state.tax = round2(action.payload);
    },
    setPaidAmount: (state, action) => {
      state.paidAmount = round2(action.payload);
    },
    setPaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
    },
    setNotes: (state, action) => {
      state.notes = action.payload;
    }
  }
});

export const {
  addItem,
  updateQuantity,
  updateItemDiscount,
  removeItem,
  clearCart,
  setCustomer,
  setDiscount,
  setTax,
  setPaidAmount,
  setPaymentMethod,
  setNotes
} = posSlice.actions;

// ✅ Selectors — with round2
export const selectCartItems = (state) => state.pos.items;

export const selectCustomer = (state) => state.pos.customer;

export const selectSubtotal = (state) =>
  round2(
    state.pos.items.reduce(
      (sum, it) =>
        sum + round2(round2(it.sellingPrice || 0) * (it.quantity || 0)) - round2(it.discount || 0),
      0
    )
  );

export const selectTotal = (state) => {
  const subtotal = selectSubtotal(state);
  return round2(subtotal - round2(state.pos.discount) + round2(state.pos.tax));
};

export const selectDueAmount = (state) => {
  const total = selectTotal(state);
  return round2(Math.max(0, total - round2(state.pos.paidAmount)));
};

export default posSlice.reducer;