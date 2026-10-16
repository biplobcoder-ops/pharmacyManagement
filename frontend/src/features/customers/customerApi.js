// src/features/customers/customerApi.js
// Customer API endpoints

import { api } from '@/app/api';

export const customerApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCustomers: builder.query({
      query: (params = {}) => ({ url: '/customers', params }),
      providesTags: ['Customer']
    }),
    getCustomerById: builder.query({
      query: (id) => `/customers/${id}`,
      providesTags: (result, error, id) => [{ type: 'Customer', id }]
    }),
    getCustomerByPhone: builder.query({
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
    updateCustomer: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/customers/${id}`,
        method: 'PATCH',
        body: data
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Customer', id },
        'Customer'
      ]
    }),
    deleteCustomer: builder.mutation({
      query: (id) => ({
        url: `/customers/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Customer']
    }),

    // Customer payments
    createCustomerPayment: builder.mutation({
      query: (data) => ({
        url: '/payments/customer',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['Customer', 'Payment', 'Sale']
    }),

    // Customer sales history
    getCustomerSales: builder.query({
      query: ({ customerId, ...params }) => ({
        url: '/sales',
        params: { customer: customerId, ...params }
      }),
      providesTags: ['Sale']
    })
  })
});

export const {
  useGetCustomersQuery,
  useGetCustomerByIdQuery,
  useGetCustomerByPhoneQuery,
  useLazyGetCustomerByPhoneQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
  useCreateCustomerPaymentMutation,
  useGetCustomerSalesQuery
} = customerApi;