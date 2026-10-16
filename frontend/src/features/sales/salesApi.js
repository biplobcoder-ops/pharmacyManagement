// src/features/sales/salesApi.js
// Sales API endpoints

import { api } from '@/app/api';

export const salesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSales: builder.query({
      query: (params = {}) => ({ url: '/sales', params }),
      providesTags: ['Sale']
    }),

    // ✅ NEW — Sales stats
    getSalesStats: builder.query({
      query: (params = {}) => ({ url: '/sales/stats', params }),
      providesTags: ['Sale']
    }),

    getSaleById: builder.query({
      query: (id) => `/sales/${id}`,
      providesTags: (result, error, id) => [{ type: 'Sale', id }]
    }),

    cancelSale: builder.mutation({
      query: ({ id, reason }) => ({
        url: `/sales/${id}/cancel`,
        method: 'PATCH',
        body: { reason }
      }),
      invalidatesTags: ['Sale', 'Inventory', 'Batch', 'StockMovement', 'Customer']
    }),

    createSalesReturn: builder.mutation({
      query: (data) => ({
        url: '/sales-returns',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['Sale', 'SalesReturn', 'Inventory', 'Batch', 'StockMovement', 'Customer']
    }),

    getCustomers: builder.query({
      query: () => '/customers?limit=100',
      providesTags: ['Customer']
    })
  })
});

export const {
  useGetSalesQuery,
  useGetSalesStatsQuery,
  useGetSaleByIdQuery,
  useCancelSaleMutation,
  useCreateSalesReturnMutation,
  useGetCustomersQuery
} = salesApi;