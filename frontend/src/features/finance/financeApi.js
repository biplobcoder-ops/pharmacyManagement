// src/features/finance/financeApi.js
// Finance API endpoints

import { api } from '@/app/api';

export const financeApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // ===== PAYMENTS =====
    getPayments: builder.query({
      query: (params = {}) => {
        const clean = {};
        Object.keys(params).forEach((k) => {
          if (params[k] !== undefined && params[k] !== null && params[k] !== '') {
            clean[k] = params[k];
          }
        });
        return { url: '/payments', params: clean };
      },
      providesTags: ['Payment']
    }),

    getPaymentById: builder.query({
      query: (id) => `/payments/${id}`,
      providesTags: (result, error, id) => [{ type: 'Payment', id }]
    }),

    deletePayment: builder.mutation({
      query: (id) => ({
        url: `/payments/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Payment', 'Customer', 'Supplier', 'Sale', 'Purchase']
    }),

    // ===== EXPENSES =====
    getExpenses: builder.query({
      query: (params = {}) => {
        const clean = {};
        Object.keys(params).forEach((k) => {
          if (params[k] !== undefined && params[k] !== null && params[k] !== '') {
            clean[k] = params[k];
          }
        });
        return { url: '/expenses', params: clean };
      },
      providesTags: ['Expense']
    }),

    getExpenseById: builder.query({
      query: (id) => `/expenses/${id}`,
      providesTags: (result, error, id) => [{ type: 'Expense', id }]
    }),

    createExpense: builder.mutation({
      query: (data) => ({
        url: '/expenses',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['Expense', 'Report']
    }),

    updateExpense: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/expenses/${id}`,
        method: 'PATCH',
        body: data
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Expense', id },
        'Expense',
        'Report'
      ]
    }),

    deleteExpense: builder.mutation({
      query: (id) => ({
        url: `/expenses/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Expense', 'Report']
    }),

    // ===== STATS (from reports/finance) =====
    getFinanceStats: builder.query({
      query: (params = {}) => ({
        url: '/reports/finance',
        params
      }),
      providesTags: ['Report']
    })
  })
});

export const {
  useGetPaymentsQuery,
  useGetPaymentByIdQuery,
  useDeletePaymentMutation,
  useGetExpensesQuery,
  useGetExpenseByIdQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
  useGetFinanceStatsQuery
} = financeApi;