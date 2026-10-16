// src/features/settings/settingsApi.js
// Settings API endpoints — RTK Query

import { api } from '@/app/api';

export const settingsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ All settings
    getSettings: builder.query({
      query: (params = {}) => {
        const clean = {};
        Object.keys(params).forEach((k) => {
          const v = params[k];
          if (v !== undefined && v !== null && v !== '') clean[k] = v;
        });
        return { url: '/settings', params: clean };
      },
      providesTags: ['Setting']
    }),

    // ✅ Category-wise settings
    getSettingsByCategory: builder.query({
      query: (category) => `/settings/category/${category}`,
      providesTags: (r, e, category) => [
        { type: 'Setting', id: `CATEGORY_${category}` }
      ]
    }),

    // ✅ Single setting by key
    getSettingByKey: builder.query({
      query: (key) => `/settings/${key}`,
      providesTags: (r, e, key) => [{ type: 'Setting', id: key }]
    }),

    // ✅ Create new setting
    createSetting: builder.mutation({
      query: (data) => ({
        url: '/settings',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['Setting']
    }),

    // ✅ Update single setting
    updateSetting: builder.mutation({
      query: ({ key, ...data }) => ({
        url: `/settings/${key}`,
        method: 'PATCH',
        body: data
      }),
      invalidatesTags: ['Setting']
    }),

    // ✅ Bulk update
    bulkUpdateSettings: builder.mutation({
      query: (data) => ({
        url: '/settings/bulk',
        method: 'PATCH',
        body: data
      }),
      invalidatesTags: ['Setting']
    }),

    // ✅ Delete setting
    deleteSetting: builder.mutation({
      query: (key) => ({
        url: `/settings/${key}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Setting']
    })
  })
});

export const {
  useGetSettingsQuery,
  useGetSettingsByCategoryQuery,
  useGetSettingByKeyQuery,
  useCreateSettingMutation,
  useUpdateSettingMutation,
  useBulkUpdateSettingsMutation,
  useDeleteSettingMutation
} = settingsApi;