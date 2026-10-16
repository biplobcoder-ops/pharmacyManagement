// src/features/sales/salesSlice.js
// Sales filters state (optional)

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  dateRange: 'today',
  paymentStatus: 'all',
  customerId: 'all'
};

const salesSlice = createSlice({
  name: 'sales',
  initialState,
  reducers: {
    setDateRange: (state, action) => {
      state.dateRange = action.payload;
    },
    setPaymentStatus: (state, action) => {
      state.paymentStatus = action.payload;
    },
    setCustomer: (state, action) => {
      state.customerId = action.payload;
    },
    resetFilters: () => initialState
  }
});

export const { setDateRange, setPaymentStatus, setCustomer, resetFilters } =
  salesSlice.actions;

export default salesSlice.reducer;