// src/features/users/components/PermissionsMatrix.jsx
// ⭐ Permission checkbox grid — grouped by category

import { useState } from 'react';
import { Check, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PERMISSION_GROUPS } from '../usersTypes';

export default function PermissionsMatrix({
  selected = [],
  onChange,
  roleDefaults = []
}) {
  // Expanded groups state
  const [expandedGroups, setExpandedGroups] = useState(
    PERMISSION_GROUPS.map((g) => g.label) // sob group expanded by default
  );

  const toggleGroup = (label) => {
    setExpandedGroups((prev) =>
      prev.includes(label)
        ? prev.filter((l) => l !== label)
        : [...prev, label]
    );
  };

  const isSelected = (perm) => selected.includes(perm);

  const togglePermission = (perm) => {
    if (isSelected(perm)) {
      onChange(selected.filter((p) => p !== perm));
    } else {
      onChange([...selected, perm]);
    }
  };

  // Toggle all permissions in a group
  const toggleGroupAll = (group) => {
    const groupPerms = group.permissions.map((p) => p.key);
    const allSelected = groupPerms.every((p) => isSelected(p));

    if (allSelected) {
      // Uncheck all
      onChange(selected.filter((p) => !groupPerms.includes(p)));
    } else {
      // Check all
      const newSelected = [...selected];
      groupPerms.forEach((p) => {
        if (!newSelected.includes(p)) newSelected.push(p);
      });
      onChange(newSelected);
    }
  };

  return (
    <div className="space-y-3">
      {PERMISSION_GROUPS.map((group) => {
        const GroupIcon = group.icon;
        const groupPerms = group.permissions.map((p) => p.key);
        const selectedCount = groupPerms.filter((p) =>
          isSelected(p)
        ).length;
        const totalCount = groupPerms.length;
        const allSelected = selectedCount === totalCount;
        const someSelected = selectedCount > 0 && !allSelected;

        const isExpanded = expandedGroups.includes(group.label);

        return (
          <div
            key={group.label}
            className="rounded-lg border border-border bg-card overflow-hidden"
          >
            {/* Group header */}
            <div
              className={cn(
                'flex items-center gap-2 p-3 cursor-pointer hover:bg-muted/30 transition-colors',
                isExpanded && 'border-b border-border'
              )}
              onClick={() => toggleGroup(group.label)}
            >
              {/* Expand icon */}
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              )}

              {/* Group icon */}
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent/10 shrink-0">
                <GroupIcon className="h-3.5 w-3.5 text-accent" />
              </div>

              {/* Group name */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  {group.label}
                </p>
              </div>

              {/* Count badge */}
              <span
                className={cn(
                  'text-xs font-medium tabular-nums px-2 py-0.5 rounded-full',
                  allSelected
                    ? 'bg-success/10 text-success'
                    : someSelected
                    ? 'bg-accent/10 text-accent'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {selectedCount}/{totalCount}
              </span>

              {/* Toggle all button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleGroupAll(group);
                }}
                className="text-[10px] font-medium text-accent hover:underline shrink-0 px-1.5"
              >
                {allSelected ? 'Uncheck all' : 'Check all'}
              </button>
            </div>

            {/* Permissions list */}
            {isExpanded && (
              <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {group.permissions.map((perm) => {
                  const checked = isSelected(perm.key);
                  const isDefault = roleDefaults.includes(perm.key);

                  return (
                    <label
                      key={perm.key}
                      className={cn(
                        'flex items-start gap-2.5 p-2 rounded-md cursor-pointer transition-colors',
                        'hover:bg-muted/40',
                        checked && 'bg-accent/5'
                      )}
                    >
                      {/* Custom checkbox */}
                      <button
                        type="button"
                        onClick={() => togglePermission(perm.key)}
                        className={cn(
                          'flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all mt-0.5',
                          checked
                            ? 'bg-accent border-accent text-accent-foreground'
                            : 'border-border bg-transparent hover:border-accent'
                        )}
                      >
                        {checked && <Check className="h-3 w-3" strokeWidth={3} />}
                      </button>

                      {/* Label */}
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            'text-xs leading-tight',
                            checked
                              ? 'font-medium text-foreground'
                              : 'text-muted-foreground'
                          )}
                        >
                          {perm.label}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <code className="text-[9px] font-mono text-muted-foreground/70">
                            {perm.key}
                          </code>
                          {isDefault && (
                            <span className="text-[9px] text-accent/70 font-medium">
                              • default
                            </span>
                          )}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}