// src/features/theme/useTheme.js
// Theme hook — use Redux + localStorage

import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { setTheme as setThemeAction } from './themeSlice';

export function useTheme() {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme?.mode || 'light');

  // ✅ Apply theme to HTML element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const setTheme = (newTheme) => {
    dispatch(setThemeAction(newTheme));
  };

  return { theme, setTheme };
}