// src/features/reports/reportsApi.js
// Reports API endpoints — RTK Query

import { api } from '@/app/api';

export const reportsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSalesReport: builder.query({
      query: (params = {}) => ({ url: '/reports/sales', params }),
      providesTags: ['Report', 'Sale']
    }),

    getSalesByProduct: builder.query({
      query: (params = {}) => ({ url: '/reports/sales/product-wise', params }),
      providesTags: ['Report', 'Sale']
    }),

    getSalesByCategory: builder.query({
      query: (params = {}) => ({ url: '/reports/sales/category-wise', params }),
      providesTags: ['Report', 'Sale']
    }),

    getSalesByUser: builder.query({
      query: (params = {}) => ({ url: '/reports/sales/user-wise', params }),
      providesTags: ['Report', 'Sale']
    }),

    getPurchaseReport: builder.query({
      query: (params = {}) => ({ url: '/reports/purchases', params }),
      providesTags: ['Report', 'Purchase']
    }),

    getInventoryReport: builder.query({
      query: (params = {}) => ({ url: '/reports/inventory', params }),
      providesTags: ['Report', 'Inventory', 'Batch']
    })
  })
});

export const {
  useGetSalesReportQuery,
  useGetSalesByProductQuery,
  useGetSalesByCategoryQuery,
  useGetSalesByUserQuery,
  useGetPurchaseReportQuery,
  useGetInventoryReportQuery
} = reportsApi;