// src/features/users/usersApi.js
// Users API endpoints — RTK Query

import { api } from '@/app/api';

export const usersApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // ===== USERS CRUD =====
    getUsers: builder.query({
      query: (params = {}) => {
        const clean = {};
        Object.keys(params).forEach((k) => {
          const v = params[k];
          if (v !== undefined && v !== null && v !== '') clean[k] = v;
        });
        return { url: '/users', params: clean };
      },
      providesTags: (result) =>
        result?.data?.users
          ? [
              ...result.data.users.map((u) => ({ type: 'User', id: u._id })),
              { type: 'User', id: 'LIST' }
            ]
          : [{ type: 'User', id: 'LIST' }]
    }),

    getUserById: builder.query({
      query: (id) => `/users/${id}`,
      providesTags: (r, e, id) => [{ type: 'User', id }]
    }),

    createUser: builder.mutation({
      query: (data) => ({
        url: '/users',
        method: 'POST',
        body: data
      }),
      invalidatesTags: [{ type: 'User', id: 'LIST' }]
    }),

    updateUser: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/users/${id}`,
        method: 'PATCH',
        body: data
      }),
      invalidatesTags: (r, e, { id }) => [
        { type: 'User', id },
        { type: 'User', id: 'LIST' }
      ]
    }),

    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: [{ type: 'User', id: 'LIST' }]
    }),

    // ===== PERMISSIONS =====
    updateUserPermissions: builder.mutation({
      query: ({ id, permissions }) => ({
        url: `/users/${id}/permissions`,
        method: 'PATCH',
        body: { permissions }
      }),
      invalidatesTags: (r, e, { id }) => [
        { type: 'User', id },
        { type: 'User', id: 'LIST' }
      ]
    }),

    resetUserPermissions: builder.mutation({
      query: (id) => ({
        url: `/users/${id}/reset-permissions`,
        method: 'POST'
      }),
      invalidatesTags: (r, e, id) => [
        { type: 'User', id },
        { type: 'User', id: 'LIST' }
      ]
    }),

    // ===== STATUS =====
    updateUserStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/users/${id}/status`,
        method: 'PATCH',
        body: { status }
      }),
      invalidatesTags: (r, e, { id }) => [
        { type: 'User', id },
        { type: 'User', id: 'LIST' }
      ]
    }),

    // ===== ROLES =====
    getRoles: builder.query({
      query: (params = {}) => ({ url: '/roles', params }),
      providesTags: ['Role']
    }),

    getPermissions: builder.query({
      query: () => '/roles/permissions',
      providesTags: ['Role']
    })
  })
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useUpdateUserPermissionsMutation,
  useResetUserPermissionsMutation,
  useUpdateUserStatusMutation,
  useGetRolesQuery,
  useGetPermissionsQuery
} = usersApi;