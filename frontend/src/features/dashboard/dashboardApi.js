// src/features/dashboard/dashboardApi.js
// Dashboard API endpoints

import { api } from '@/app/api';

export const dashboardApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDashboard: builder.query({
      query: (params = {}) => ({
        url: '/reports/dashboard',
        params
      }),
      providesTags: ['Report']
    }),
    getDashboardUnreadCount: builder.query({
      query: () => '/notifications/unread',
      providesTags: ['Notification']
    })
  })
});

export const {
  useGetDashboardQuery,
  useGetDashboardUnreadCountQuery
} = dashboardApi;