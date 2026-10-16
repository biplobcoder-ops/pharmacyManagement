// src/features/settings/components/SettingGroup.jsx
// Groups settings by their `group` field (optional) or renders list

import { useMemo } from 'react';
import SettingItem from './SettingItem';

export default function SettingGroup({
  settings = [],
  dirtyValues = {},
  onChange
}) {
  // ✅ Group settings by `group` field (fallback: single group)
  const groups = useMemo(() => {
    const grouped = {};
    settings.forEach((setting) => {
      const groupName = setting.group || 'General';
      if (!grouped[groupName]) grouped[groupName] = [];
      grouped[groupName].push(setting);
    });
    return grouped;
  }, [settings]);

  const groupNames = Object.keys(groups);

  return (
    <div className="divide-y divide-border">
      {groupNames.map((groupName) => (
        <div key={groupName} className="p-6">
          {/* Group header */}
          {groupNames.length > 1 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-foreground capitalize">
                {groupName}
              </h3>
            </div>
          )}

          {/* Settings list */}
          <div className="space-y-1">
            {groups[groupName].map((setting, index) => (
              <SettingItem
                key={setting.key}
                setting={setting}
                value={
                  // eslint-disable-next-line no-prototype-builtins
                  dirtyValues.hasOwnProperty(setting.key)
                    ? dirtyValues[setting.key]
                    : setting.value
                }
                // eslint-disable-next-line no-prototype-builtins
                isDirty={dirtyValues.hasOwnProperty(setting.key)}
                onChange={(newValue) => onChange(setting.key, newValue)}
                isLast={index === groups[groupName].length - 1}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}