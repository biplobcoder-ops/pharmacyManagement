// src/features/users/components/UserFilters.jsx

import { Plus, Shield, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import SearchBar from '@/components/common/SearchBar';

// Role options
const ROLE_OPTIONS = [
  { value: 'all', label: 'All roles' },
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'pharmacist', label: 'Pharmacist' },
  { value: 'cashier', label: 'Cashier' },
  { value: 'accountant', label: 'Accountant' }
];

// Status options
const STATUS_OPTIONS = [
  { value: 'all', label: 'All status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'suspended', label: 'Suspended' }
];

export default function UserFilters({
  search,
  onSearchChange,
  roleFilter,
  onRoleChange,
  statusFilter,
  onStatusChange,
  onAdd
}) {
  return (
    <div className="flex flex-col lg:flex-row gap-3">
      {/* Search */}
      <SearchBar
        value={search}
        onChange={onSearchChange}
        placeholder="Search by name, email or phone..."
        className="flex-1"
      />

      {/* Filters + Add button */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Role filter */}
        <Select value={roleFilter} onValueChange={onRoleChange}>
          <SelectTrigger className="w-40 h-10 text-xs">
            <Shield className="h-3.5 w-3.5 mr-1.5" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROLE_OPTIONS.map((r) => (
              <SelectItem key={r.value} value={r.value}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status filter */}
        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger className="w-36 h-10 text-xs">
            <Activity className="h-3.5 w-3.5 mr-1.5" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Add user button */}
        <Button
          size="sm"
          className="h-10 bg-accent hover:bg-accent/90 text-accent-foreground"
          onClick={onAdd}
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add user</span>
        </Button>
      </div>
    </div>
  );
}