// src/features/audit-logs/auditLogsApi.js
// Audit Logs API endpoints — RTK Query

import { api } from '@/app/api';

export const auditLogsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ List with filters
    getAuditLogs: builder.query({
      query: (params = {}) => {
        const clean = {};
        Object.keys(params).forEach((k) => {
          const v = params[k];
          if (v !== undefined && v !== null && v !== '') clean[k] = v;
        });
        return { url: '/audit-logs', params: clean };
      },
      providesTags: (result) =>
        result?.data?.logs
          ? [
              ...result.data.logs.map((l) => ({ type: 'AuditLog', id: l._id })),
              { type: 'AuditLog', id: 'LIST' }
            ]
          : [{ type: 'AuditLog', id: 'LIST' }]
    }),

    // ✅ Summary (action/module/user breakdown)
    getAuditSummary: builder.query({
      query: (params = {}) => ({ url: '/audit-logs/summary', params }),
      providesTags: [{ type: 'AuditLog', id: 'SUMMARY' }]
    }),

    // ✅ User-specific logs
    getAuditLogsByUser: builder.query({
      query: ({ userId, ...params }) => ({
        url: `/audit-logs/user/${userId}`,
        params
      }),
      providesTags: (r, e, { userId }) => [
        { type: 'AuditLog', id: `USER_${userId}` }
      ]
    }),

    // ✅ Single log detail
    getAuditLogById: builder.query({
      query: (id) => `/audit-logs/${id}`,
      providesTags: (r, e, id) => [{ type: 'AuditLog', id }]
    })
  })
});

export const {
  useGetAuditLogsQuery,
  useGetAuditSummaryQuery,
  useGetAuditLogsByUserQuery,
  useGetAuditLogByIdQuery
} = auditLogsApi;