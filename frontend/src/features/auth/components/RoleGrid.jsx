// src/features/auth/components/RoleGrid.jsx
// ✅ Professional 5-card layout: 3 columns top, 2 centered bottom

import RoleCard from './RoleCard';
import RoleCardSkeleton from './RoleCardSkeleton';
import { ROLES_LIST } from '../authTypes';

export default function RoleGrid({ onSelectRole, isLoading = false }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <RoleCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // ✅ Split 5 roles: first 3 in row 1, last 2 in row 2 (centered)
  const firstRow = ROLES_LIST.slice(0, 3);
  const secondRow = ROLES_LIST.slice(3);

  return (
    <div className="space-y-3 lg:space-y-4">
      {/* Row 1: 3 cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
        {firstRow.map((role) => (
          <RoleCard key={role.value} role={role} onSelect={onSelectRole} />
        ))}
      </div>

      {/* Row 2: 2 cards centered (desktop), 2 cols (mobile) */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
        <div className="hidden lg:block" />
        {secondRow.map((role) => (
          <RoleCard key={role.value} role={role} onSelect={onSelectRole} />
        ))}
        <div className="hidden lg:block" />
      </div>
    </div>
  );
}