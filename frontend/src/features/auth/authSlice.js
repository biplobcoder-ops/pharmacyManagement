// src/features/auth/authSlice.js
// Auth state management — with user persistence

import { createSlice } from '@reduxjs/toolkit';

// ✅ Load user from localStorage (refresh safe)
const loadUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Failed to parse user from localStorage:', error);
    return null;
  }
};

const initialState = {
  user: loadUser(), // ✅ localStorage theke load
  accessToken: localStorage.getItem('accessToken') || null,
  refreshToken: localStorage.getItem('refreshToken') || null,
  isAuthenticated: !!localStorage.getItem('accessToken')
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // ✅ Login success — user + tokens save
    setCredentials: (state, action) => {
      const { user, accessToken, refreshToken } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.isAuthenticated = true;

      // ✅ Persist to localStorage
      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      if (user) localStorage.setItem('user', JSON.stringify(user));
    },

    // ✅ Token refresh — only access token update
    setAccessToken: (state, action) => {
      state.accessToken = action.payload;
      localStorage.setItem('accessToken', action.payload);
    },

    // ✅ getMe success — user update
    setUser: (state, action) => {
      state.user = action.payload;
      if (action.payload) {
        localStorage.setItem('user', JSON.stringify(action.payload));
      }
    },

    // ✅ Theme update — user preferences
    updateTheme: (state, action) => {
      if (state.user?.preferences) {
        state.user.preferences.theme = action.payload;
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    },

    // ✅ Logout — sob clear
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;

      // ✅ localStorage clear
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  }
});

export const {
  setCredentials,
  setAccessToken,
  setUser,
  updateTheme,
  logout
} = authSlice.actions;

export default authSlice.reducer;