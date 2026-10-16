// src/features/notifications/notificationsApi.js
// Notifications API endpoints — RTK Query

import { api } from '@/app/api';

export const notificationsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ List with filters
    getNotifications: builder.query({
      query: (params = {}) => {
        const clean = {};
        Object.keys(params).forEach((k) => {
          const v = params[k];
          if (v !== undefined && v !== null && v !== '') clean[k] = v;
        });
        return { url: '/notifications', params: clean };
      },
      providesTags: (result) =>
        result?.data?.notifications
          ? [
              ...result.data.notifications.map((n) => ({
                type: 'Notification',
                id: n._id
              })),
              { type: 'Notification', id: 'LIST' }
            ]
          : [{ type: 'Notification', id: 'LIST' }]
    }),

    // ✅ Unread count (header bell badge)
    getUnreadCount: builder.query({
      query: (params = {}) => ({ url: '/notifications/unread', params }),
      providesTags: [{ type: 'Notification', id: 'UNREAD' }]
    }),

    // ✅ Single
    getNotificationById: builder.query({
      query: (id) => `/notifications/${id}`,
      providesTags: (r, e, id) => [{ type: 'Notification', id }]
    }),

    // ✅ Mark as read
    markAsRead: builder.mutation({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: 'PATCH'
      }),
      invalidatesTags: (r, e, id) => [
        { type: 'Notification', id },
        { type: 'Notification', id: 'LIST' },
        { type: 'Notification', id: 'UNREAD' }
      ]
    }),

    // ✅ Mark all as read
    markAllAsRead: builder.mutation({
      query: (data = {}) => ({
        url: '/notifications/read-all',
        method: 'PATCH',
        body: data
      }),
      invalidatesTags: [
        { type: 'Notification', id: 'LIST' },
        { type: 'Notification', id: 'UNREAD' }
      ]
    }),

    // ✅ Delete single
    deleteNotification: builder.mutation({
      query: (id) => ({
        url: `/notifications/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: [
        { type: 'Notification', id: 'LIST' },
        { type: 'Notification', id: 'UNREAD' }
      ]
    }),

    // ✅ Delete all read
    deleteAllRead: builder.mutation({
      query: (data = {}) => ({
        url: '/notifications/read-all',
        method: 'DELETE',
        body: data
      }),
      invalidatesTags: [
        { type: 'Notification', id: 'LIST' },
        { type: 'Notification', id: 'UNREAD' }
      ]
    }),

    // ✅ Run system checks (admin)
    runSystemChecks: builder.mutation({
      query: (data = {}) => ({
        url: '/notifications/run-checks',
        method: 'POST',
        body: data
      }),
      invalidatesTags: [
        { type: 'Notification', id: 'LIST' },
        { type: 'Notification', id: 'UNREAD' }
      ]
    })
  })
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useGetNotificationByIdQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
  useDeleteAllReadMutation,
  useRunSystemChecksMutation
} = notificationsApi;