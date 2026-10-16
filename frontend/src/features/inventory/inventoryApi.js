// src/features/inventory/inventoryApi.js

import { api } from '@/app/api';

export const inventoryApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCurrentStock: builder.query({
      query: (params = {}) => ({ url: '/inventory', params }),
      providesTags: ['Inventory']
    }),
    getInventorySummary: builder.query({
      query: (params = {}) => ({ url: '/inventory/summary', params }),
      providesTags: ['Inventory']
    }),
    getLowStock: builder.query({
      query: (params = {}) => ({ url: '/inventory/low-stock', params }),
      providesTags: ['Inventory']
    }),
    getOutOfStock: builder.query({
      query: (params = {}) => ({ url: '/inventory/out-of-stock', params }),
      providesTags: ['Inventory']
    }),

    getBatches: builder.query({
      query: (params = {}) => ({ url: '/batches', params }),
      providesTags: ['Batch']
    }),
    getExpiringBatches: builder.query({
      query: (params = {}) => ({ url: '/batches/expiring', params }),
      providesTags: ['Batch']
    }),
    getExpiredBatches: builder.query({
      query: () => ({ url: '/batches/expired' }),
      providesTags: ['Batch']
    }),

    getStockMovements: builder.query({
      query: (params = {}) => ({ url: '/stock-movements', params }),
      providesTags: ['StockMovement']
    }),

    adjustStock: builder.mutation({
      query: (data) => ({
        url: '/stock-movements/adjust',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['Inventory', 'Batch', 'StockMovement']
    }),

    deleteBatch: builder.mutation({
      query: (id) => ({
        url: `/batches/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Batch', 'Inventory']
    })
  })
});

export const {
  useGetCurrentStockQuery,
  useGetInventorySummaryQuery,
  useGetLowStockQuery,
  useGetOutOfStockQuery,
  useGetBatchesQuery,
  useGetExpiringBatchesQuery,
  useGetExpiredBatchesQuery,
  useGetStockMovementsQuery,
  useAdjustStockMutation,
  useDeleteBatchMutation
} = inventoryApi;