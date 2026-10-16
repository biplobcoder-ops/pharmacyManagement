// src/features/suppliers/supplierApi.js
// Supplier API endpoints — cache-safe

import { api } from '@/app/api';

export const supplierApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ MAIN LIST — with cache tag per query
    getSuppliers: builder.query({
      query: (params = {}) => {
        const cleanParams = {};
        Object.keys(params).forEach((key) => {
          const val = params[key];
          if (val !== undefined && val !== null && val !== '') {
            cleanParams[key] = val;
          }
        });

        console.log('[supplierApi.getSuppliers] params:', cleanParams);

        return {
          url: '/suppliers',
          params: cleanParams
        };
      },
      // ✅ SERIALIZE unique per params — cache separate
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        // Sort keys for consistent serialization
        const sorted = Object.keys(queryArgs || {})
          .sort()
          .reduce((acc, key) => {
            if (queryArgs[key] !== undefined && queryArgs[key] !== null && queryArgs[key] !== '') {
              acc[key] = queryArgs[key];
            }
            return acc;
          }, {});
        return `${endpointName}(${JSON.stringify(sorted)})`;
      },
      providesTags: (result) =>
        result?.data?.suppliers
          ? [
              ...result.data.suppliers.map((s) => ({
                type: 'Supplier',
                id: s._id
              })),
              { type: 'Supplier', id: 'LIST' }
            ]
          : [{ type: 'Supplier', id: 'LIST' }]
    }),

    // ✅ DROPDOWN — separate endpoint (no conflict with main list)
    getSupplierOptions: builder.query({
      query: () => ({
        url: '/suppliers',
        params: { limit: 100, status: 'active' }
      }),
      providesTags: [{ type: 'Supplier', id: 'OPTIONS' }]
    }),

    getSupplierById: builder.query({
      query: (id) => `/suppliers/${id}`,
      providesTags: (result, error, id) => [{ type: 'Supplier', id }]
    }),

    createSupplier: builder.mutation({
      query: (data) => ({
        url: '/suppliers',
        method: 'POST',
        body: data
      }),
      invalidatesTags: [
        { type: 'Supplier', id: 'LIST' },
        { type: 'Supplier', id: 'OPTIONS' }
      ]
    }),

    updateSupplier: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/suppliers/${id}`,
        method: 'PATCH',
        body: data
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Supplier', id },
        { type: 'Supplier', id: 'LIST' },
        { type: 'Supplier', id: 'OPTIONS' }
      ]
    }),

    deleteSupplier: builder.mutation({
      query: (id) => ({
        url: `/suppliers/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: [
        { type: 'Supplier', id: 'LIST' },
        { type: 'Supplier', id: 'OPTIONS' }
      ]
    }),

    createSupplierPayment: builder.mutation({
      query: (data) => ({
        url: '/payments/supplier',
        method: 'POST',
        body: data
      }),
      invalidatesTags: [
        { type: 'Supplier', id: 'LIST' },
        'Payment',
        'Purchase'
      ]
    }),

    getSupplierPurchases: builder.query({
      query: ({ supplierId, ...params }) => ({
        url: '/purchases',
        params: { supplier: supplierId, ...params }
      }),
      providesTags: ['Purchase']
    })
  })
});

export const {
  useGetSuppliersQuery,
  useGetSupplierOptionsQuery,
  useGetSupplierByIdQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
  useCreateSupplierPaymentMutation,
  useGetSupplierPurchasesQuery
} = supplierApi;