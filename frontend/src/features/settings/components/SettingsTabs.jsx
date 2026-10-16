// src/features/settings/components/SettingsTabs.jsx

import { cn } from '@/lib/utils';
import { SETTINGS_TABS } from '../settingsTypes';

export default function SettingsTabs({ value, onChange }) {
  return (
    <div className="flex items-center gap-1 border-b border-border overflow-x-auto scrollbar-thin">
      {SETTINGS_TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = value === tab.value;

        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap',
              isActive
                ? 'border-accent text-accent'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon className="h-4 w-4" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}