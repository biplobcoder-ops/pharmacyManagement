// src/features/ui/uiSlice.js
// UI state (sidebar, notifications count)

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  collapsed: false,
  mobileOpen: false,
  notificationCount: 0
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state, action) => {
      if (action.payload === 'mobile') {
        state.mobileOpen = !state.mobileOpen;
      } else {
        state.collapsed = !state.collapsed;
      }
    },
    closeSidebar: (state) => {
      state.mobileOpen = false;
    },
    setNotificationCount: (state, action) => {
      state.notificationCount = action.payload;
    }
  }
});

export const { toggleSidebar, closeSidebar, setNotificationCount } = uiSlice.actions;
export default uiSlice.reducer;