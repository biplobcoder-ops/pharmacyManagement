// src/features/search/searchApi.js

import { api } from '@/app/api';

export const searchApi = api.injectEndpoints({
  endpoints: (builder) => ({
    globalSearch: builder.query({
      query: (params = {}) => {
        const clean = {};
        Object.keys(params).forEach((k) => {
          const v = params[k];
          if (v !== undefined && v !== null && v !== '') clean[k] = v;
        });
        return { url: '/search', params: clean };
      },
      providesTags: ['Search']
    })
  })
});

export const { useGlobalSearchQuery } = searchApi;