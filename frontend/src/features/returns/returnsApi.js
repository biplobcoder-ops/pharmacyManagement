// src/features/returns/returnsApi.js
// Returns API endpoints

import { api } from '@/app/api';

export const returnsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // ===== SALES RETURNS =====
    getSalesReturns: builder.query({
      query: (params = {}) => {
        const clean = {};
        Object.keys(params).forEach((k) => {
          if (params[k] !== undefined && params[k] !== null && params[k] !== '') {
            clean[k] = params[k];
          }
        });
        return { url: '/sales-returns', params: clean };
      },
      providesTags: ['SalesReturn']
    }),

    // ✅ Sales return stats
    getSalesReturnStats: builder.query({
      query: (params = {}) => ({ url: '/sales-returns/stats', params }),
      providesTags: ['SalesReturn']
    }),

    getSalesReturnById: builder.query({
      query: (id) => `/sales-returns/${id}`,
      providesTags: (result, error, id) => [{ type: 'SalesReturn', id }]
    }),

    cancelSalesReturn: builder.mutation({
      query: ({ id, reason }) => ({
        url: `/sales-returns/${id}/cancel`,
        method: 'PATCH',
        body: { reason }
      }),
      invalidatesTags: ['SalesReturn', 'Inventory', 'Batch', 'StockMovement', 'Customer']
    }),

    // ===== PURCHASE RETURNS =====
    getPurchaseReturns: builder.query({
      query: (params = {}) => {
        const clean = {};
        Object.keys(params).forEach((k) => {
          if (params[k] !== undefined && params[k] !== null && params[k] !== '') {
            clean[k] = params[k];
          }
        });
        return { url: '/purchase-returns', params: clean };
      },
      providesTags: ['PurchaseReturn']
    }),

    // ✅ Purchase return stats
    getPurchaseReturnStats: builder.query({
      query: (params = {}) => ({ url: '/purchase-returns/stats', params }),
      providesTags: ['PurchaseReturn']
    }),

    getPurchaseReturnById: builder.query({
      query: (id) => `/purchase-returns/${id}`,
      providesTags: (result, error, id) => [{ type: 'PurchaseReturn', id }]
    }),

    cancelPurchaseReturn: builder.mutation({
      query: ({ id, reason }) => ({
        url: `/purchase-returns/${id}/cancel`,
        method: 'PATCH',
        body: { reason }
      }),
      invalidatesTags: ['PurchaseReturn', 'Inventory', 'Batch', 'StockMovement', 'Supplier']
    })
  })
});

export const {
  useGetSalesReturnsQuery,
  useGetSalesReturnStatsQuery,
  useGetSalesReturnByIdQuery,
  useCancelSalesReturnMutation,
  useGetPurchaseReturnsQuery,
  useGetPurchaseReturnStatsQuery,
  useGetPurchaseReturnByIdQuery,
  useCancelPurchaseReturnMutation
} = returnsApi;