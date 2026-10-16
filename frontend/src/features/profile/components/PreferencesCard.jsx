// src/features/profile/components/PreferencesCard.jsx
// Theme preference + account info

import { useDispatch} from 'react-redux';
import toast from 'react-hot-toast';
import {
  Sun, Moon, Palette, Check, Shield, Clock, Layers
} from 'lucide-react';

import {
  Card, CardContent, CardHeader, CardTitle, CardDescription
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn, formatDateTime } from '@/lib/utils';

import { useUpdatePreferencesMutation } from '@/features/auth/authApi';
import { updateTheme } from '@/features/auth/authSlice';
import { useTheme } from '@/features/theme/useTheme';

const THEMES = [
  {
    value: 'light',
    label: 'Light',
    icon: Sun,
    description: 'Bright interface'
  },
  {
    value: 'dark',
    label: 'Dark',
    icon: Moon,
    description: 'Low-light friendly'
  }
];

export default function PreferencesCard({ user }) {
  const dispatch = useDispatch();
  const { theme, setTheme } = useTheme();

  const [updatePreferences, { isLoading }] = useUpdatePreferencesMutation();

  const currentTheme = user?.preferences?.theme || theme || 'light';

  const handleThemeChange = async (newTheme) => {
    if (newTheme === currentTheme) return;

    try {
      // ✅ Optimistic update — UI turant change
      setTheme(newTheme);
      dispatch(updateTheme(newTheme));

      // ✅ Backend save
      await updatePreferences({ theme: newTheme }).unwrap();
      toast.success(`${newTheme === 'dark' ? 'Dark' : 'Light'} theme enabled`);
    } catch (error) {
      // Revert on error
      setTheme(currentTheme);
      dispatch(updateTheme(currentTheme));
      toast.error(error?.data?.message || 'Failed to update theme');
    }
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base flex items-center gap-2">
          <Palette className="h-4 w-4 text-accent" />
          Preferences
        </CardTitle>
        <CardDescription className="text-xs">
          Customize your experience
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Theme selection */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 block">
            Theme
          </label>
          <div className="grid grid-cols-2 gap-3">
            {THEMES.map((t) => {
              const Icon = t.icon;
              const isActive = currentTheme === t.value;

              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => handleThemeChange(t.value)}
                  disabled={isLoading}
                  className={cn(
                    'relative flex flex-col items-start gap-2 p-3 rounded-lg border-2 text-left transition-all',
                    isActive
                      ? 'border-accent bg-accent/5'
                      : 'border-border hover:border-accent/50',
                    isLoading && 'opacity-60 cursor-not-allowed'
                  )}
                >
                  {isActive && (
                    <span className="absolute top-2 right-2 h-4 w-4 rounded-full bg-accent flex items-center justify-center">
                      <Check className="h-2.5 w-2.5 text-accent-foreground" strokeWidth={3} />
                    </span>
                  )}

                  <div
                    className={cn(
                      'rounded-lg p-2',
                      isActive ? 'bg-accent/10' : 'bg-muted'
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-4 w-4',
                        isActive ? 'text-accent' : 'text-muted-foreground'
                      )}
                    />
                  </div>

                  <div>
                    <p
                      className={cn(
                        'text-xs font-semibold',
                        isActive ? 'text-accent' : 'text-foreground'
                      )}
                    >
                      {t.label}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {t.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Account info (read-only) */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 block">
            Account Information
          </label>

          <div className="space-y-2">
            <InfoRow
              icon={Shield}
              label="Role"
              value={user?.role?.name}
              capitalize
            />
            <InfoRow
              icon={Layers}
              label="Branch"
              value={user?.branch?.name || 'Not assigned'}
            />
            <InfoRow
              icon={Clock}
              label="Last Login"
              value={
                user?.lastLogin ? formatDateTime(user.lastLogin) : 'Never'
              }
            />
          </div>
        </div>

        {/* Permissions summary */}
        {user?.role?.name !== 'admin' && (
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 block">
              Permissions
            </label>

            <div className="rounded-lg border border-border bg-muted/20 p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Shield className="h-3.5 w-3.5 text-accent" />
                  <span className="text-xs font-semibold text-foreground">
                    {user?.effectivePermissions?.length || 0} active
                  </span>
                </div>
                {user?.permissionsOverride?.length > 0 ? (
                  <Badge variant="info" className="text-[10px]">
                    Custom
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-[10px]">
                    Role default
                  </Badge>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                {user?.permissionsOverride?.length > 0
                  ? 'Your permissions are customized by admin'
                  : 'You have default permissions from your role'}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ===== Info Row Helper =====
function InfoRow({ icon: Icon, label, value, capitalize }) {
  return (
    <div className="flex items-center justify-between gap-3 p-2 rounded-md hover:bg-muted/30 transition-colors">
      <div className="flex items-center gap-2 min-w-0">
        <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <span
        className={cn(
          'text-xs font-medium text-foreground truncate text-right',
          capitalize && 'capitalize'
        )}
      >
        {value || '—'}
      </span>
    </div>
  );
}