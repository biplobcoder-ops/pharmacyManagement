import { Moon, Sun } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { toggleTheme } from '@/features/theme/themeSlice';
import { useUpdatePreferencesMutation } from '@/features/auth/authApi';

export default function ThemeToggle() {
  const dispatch = useDispatch();
  const mode = useSelector((state) => state.theme.mode);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const [updatePreferences] = useUpdatePreferencesMutation();

  const handleToggle = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    dispatch(toggleTheme());

    // Sync with backend if logged in
    if (isAuthenticated) {
      updatePreferences({ theme: newMode }).catch(() => {});
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      aria-label="Toggle theme"
      title={mode === 'light' ? 'Switch to dark' : 'Switch to light'}
    >
      {mode === 'light' ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
    </Button>
  );
}