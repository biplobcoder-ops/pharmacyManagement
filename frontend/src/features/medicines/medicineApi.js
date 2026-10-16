// src/features/medicines/medicineApi.js
// Medicine API endpoints — FormData safe

import { api } from '@/app/api';

export const medicineApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getMedicines: builder.query({
      query: (params = {}) => ({ url: '/medicines', params }),
      providesTags: (result) =>
        result?.data?.medicines
          ? [
              ...result.data.medicines.map((m) => ({
                type: 'Medicine',
                id: m._id
              })),
              { type: 'Medicine', id: 'LIST' }
            ]
          : [{ type: 'Medicine', id: 'LIST' }]
    }),
    getMedicineById: builder.query({
      query: (id) => `/medicines/${id}`,
      providesTags: (result, error, id) => [{ type: 'Medicine', id }]
    }),
    getMedicineStats: builder.query({
      query: () => '/medicines/stats',
      providesTags: [{ type: 'Medicine', id: 'STATS' }]
    }),

    // ✅ CREATE — accepts FormData
    createMedicine: builder.mutation({
      query: (formData) => ({
        url: '/medicines',
        method: 'POST',
        body: formData
        // FormData → fetch auto sets multipart/form-data + boundary
      }),
      invalidatesTags: [
        { type: 'Medicine', id: 'LIST' },
        { type: 'Medicine', id: 'STATS' }
      ]
    }),

    // ✅ UPDATE — receives { id, formData }
    updateMedicine: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/medicines/${id}`,
        method: 'PATCH',
        body: formData
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Medicine', id },
        { type: 'Medicine', id: 'LIST' },
        { type: 'Medicine', id: 'STATS' }
      ]
    }),

    deleteMedicine: builder.mutation({
      query: (id) => ({
        url: `/medicines/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: [
        { type: 'Medicine', id: 'LIST' },
        { type: 'Medicine', id: 'STATS' }
      ]
    }),

    uploadMedicineImage: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/medicines/${id}/image`,
        method: 'POST',
        body: formData
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Medicine', id }]
    }),

    deleteMedicineImage: builder.mutation({
      query: (id) => ({
        url: `/medicines/${id}/image`,
        method: 'DELETE'
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Medicine', id }]
    }),

    getCategories: builder.query({
      query: () => '/categories?limit=100',
      providesTags: ['Category']
    }),
    getBrands: builder.query({
      query: () => '/brands?limit=100',
      providesTags: ['Brand']
    }),
    getGenerics: builder.query({
      query: () => '/generics?limit=100',
      providesTags: ['Generic']
    }),
    getUnits: builder.query({
      query: () => '/units?limit=100',
      providesTags: ['Unit']
    })
  })
});

export const {
  useGetMedicinesQuery,
  useGetMedicineByIdQuery,
  useGetMedicineStatsQuery,
  useCreateMedicineMutation,
  useUpdateMedicineMutation,
  useDeleteMedicineMutation,
  useUploadMedicineImageMutation,
  useDeleteMedicineImageMutation,
  useGetCategoriesQuery,
  useGetBrandsQuery,
  useGetGenericsQuery,
  useGetUnitsQuery
} = medicineApi;