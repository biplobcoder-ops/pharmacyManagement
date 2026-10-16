// src/features/auth/authApi.js
// Auth API endpoints

import { api } from '@/app/api';

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials
      })
    }),
    logout: builder.mutation({
      query: (refreshToken) => ({
        url: '/auth/logout',
        method: 'POST',
        body: { refreshToken }
      })
    }),
    getMe: builder.query({
      query: () => '/auth/me',
      providesTags: ['Auth']
    }),
    updatePreferences: builder.mutation({
      query: (preferences) => ({
        url: '/users/preferences',
        method: 'PATCH',
        body: preferences
      }),
      invalidatesTags: ['Auth']
    }),
    // ✅ NEW: Change password
    changePassword: builder.mutation({
      query: (data) => ({
        url: '/auth/change-password',
        method: 'PATCH',
        body: data // { oldPassword, newPassword }
      })
    }),
    requestPasswordReset: builder.mutation({
      query: (data) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body: data
      })
    })
  })
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useGetMeQuery,
  useUpdatePreferencesMutation,
  useChangePasswordMutation, // ✅ NEW
  useRequestPasswordResetMutation
} = authApi;