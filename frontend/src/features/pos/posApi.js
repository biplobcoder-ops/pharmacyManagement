// src/features/pos/posApi.js
// POS API endpoints

import { api } from '@/app/api';

export const posApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Search medicines (POS)
    searchMedicines: builder.query({
      query: (params = {}) => ({ url: '/medicines', params }),
      providesTags: ['Medicine']
    }),

    // Get medicine by barcode
    getMedicineByBarcode: builder.query({
      query: (barcode) => `/medicines/barcode/${barcode}`,
      providesTags: ['Medicine']
    }),

    // Get batches for medicine (FEFO display)
    getMedicineBatches: builder.query({
      query: (medicineId) => ({
        url: '/batches',
        params: { medicine: medicineId, status: 'active', sort: 'expiryDate' }
      }),
      providesTags: ['Batch']
    }),

    // Customers
    getCustomers: builder.query({
      query: (params = {}) => ({ url: '/customers', params }),
      providesTags: ['Customer']
    }),
    searchCustomerByPhone: builder.query({
      query: (phone) => `/customers/phone/${phone}`,
      providesTags: ['Customer']
    }),
    createCustomer: builder.mutation({
      query: (data) => ({
        url: '/customers',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['Customer']
    }),

    // Create Sale
    createSale: builder.mutation({
      query: (data) => ({
        url: '/sales',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['Sale', 'Inventory', 'Batch', 'StockMovement', 'Customer', 'Medicine']
    })
  })
});

export const {
  useSearchMedicinesQuery,
  useGetMedicineByBarcodeQuery,
  useLazyGetMedicineByBarcodeQuery,
  useGetMedicineBatchesQuery,
  useGetCustomersQuery,
  useLazySearchCustomerByPhoneQuery,
  useCreateCustomerMutation,
  useCreateSaleMutation
} = posApi;