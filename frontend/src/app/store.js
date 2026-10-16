// src/app/store.js
// Redux store setup

import { configureStore } from '@reduxjs/toolkit';
import { api } from './api';
import authReducer from '@/features/auth/authSlice';
import themeReducer from '@/features/theme/themeSlice';
import uiReducer from '@/features/ui/uiSlice';
import posReducer from '@/features/pos/posSlice';

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    auth: authReducer,
    theme: themeReducer,
    ui: uiReducer,
    pos: posReducer  // ✅ Ei ta add korlam
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
  devTools: import.meta.env.DEV
});