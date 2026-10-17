// src/app/api.js
// RTK Query base API — FormData safe

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// ✅ Production e Vercel backend link use hobe, local e localhost
const BASE_URL = import.meta.env.VITE_API_URL || 'https://pharmacy-management-beryl.vercel.app/api';

// ✅ Base query with auth token ONLY — no Content-Type
const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.accessToken;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    // ✅ NEVER set Content-Type manually
    return headers;
  }
});

// Wrapper for token refresh
const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  // If 401, try refresh token
  if (result?.error?.status === 401) {
    const refreshToken = api.getState().auth.refreshToken;

    if (refreshToken) {
      const refreshResult = await baseQuery(
        {
          url: '/auth/refresh',
          method: 'POST',
          body: { refreshToken }
        },
        api,
        extraOptions
      );

      if (refreshResult?.data?.data?.accessToken) {
        api.dispatch({
          type: 'auth/setAccessToken',
          payload: refreshResult.data.data.accessToken
        });
        result = await baseQuery(args, api, extraOptions);
      } else {
        api.dispatch({ type: 'auth/logout' });
      }
    }
  }

  return result;
};

// Create base API
export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'Auth', 'User', 'Role',
    'Medicine', 'Batch', 'Inventory', 'StockMovement',
    'Supplier', 'Purchase', 'PurchaseReturn',
    'Customer', 'Sale', 'SalesReturn',
    'Payment', 'Expense', 'Report',
    'Notification', 'AuditLog', 'Setting',
    'Category', 'Brand', 'Generic', 'Unit',
    'Organization', 'Branch'
  ],
  endpoints: () => ({})
});