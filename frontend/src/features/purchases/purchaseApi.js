// src/features/purchases/purchaseApi.js
// Purchase API endpoints

import { api } from '@/app/api';

export const purchaseApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPurchases: builder.query({
      query: (params = {}) => ({ url: '/purchases', params }),
      providesTags: ['Purchase']
    }),
    getPurchaseById: builder.query({
      query: (id) => `/purchases/${id}`,
      providesTags: (result, error, id) => [{ type: 'Purchase', id }]
    }),
    createPurchase: builder.mutation({
      query: (data) => ({
        url: '/purchases',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['Purchase', 'Inventory', 'Batch', 'StockMovement', 'Supplier']
    }),
    cancelPurchase: builder.mutation({
      query: ({ id, reason }) => ({
        url: `/purchases/${id}/cancel`,
        method: 'PATCH',
        body: { reason }
      }),
      invalidatesTags: ['Purchase', 'Inventory', 'Batch', 'StockMovement', 'Supplier']
    }),
    deletePurchase: builder.mutation({
      query: (id) => ({
        url: `/purchases/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Purchase']
    }),

    // ✅ NEW — Create Purchase Return
    createPurchaseReturn: builder.mutation({
      query: (data) => ({
        url: '/purchase-returns',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['Purchase', 'PurchaseReturn', 'Inventory', 'Batch', 'StockMovement', 'Supplier']
    }),

    getMedicines: builder.query({
      query: (params = {}) => ({ url: '/medicines', params }),
      providesTags: ['Medicine']
    }),
    getBranches: builder.query({
      query: () => '/branches',
      providesTags: ['Branch']
    }),
    getBatches: builder.query({
      query: (params = {}) => ({ url: '/batches', params }),
      providesTags: ['Batch']
    })
  })
});

export const {
  useGetPurchasesQuery,
  useGetPurchaseByIdQuery,
  useCreatePurchaseMutation,
  useCancelPurchaseMutation,
  useDeletePurchaseMutation,
  useCreatePurchaseReturnMutation,
  useGetMedicinesQuery,
  useGetBranchesQuery,
  useGetBatchesQuery
} = purchaseApi;