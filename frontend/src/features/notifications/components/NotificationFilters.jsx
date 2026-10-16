// src/features/notifications/components/NotificationFilters.jsx

import { Filter, AlertCircle, CheckCircle2 } from 'lucide-react';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import SearchBar from '@/components/common/SearchBar';
import {
  TYPE_OPTIONS, PRIORITY_OPTIONS, READ_OPTIONS
} from '../notificationsTypes';

export default function NotificationFilters({
  search, onSearchChange,
  type, onTypeChange,
  priority, onPriorityChange,
  readFilter, onReadFilterChange
}) {
  return (
    <div className="flex flex-col lg:flex-row gap-3">
      <SearchBar
        value={search}
        onChange={onSearchChange}
        placeholder="Search notifications..."
        className="flex-1"
      />

      <div className="flex flex-wrap items-center gap-2">
        <Select value={type} onValueChange={onTypeChange}>
          <SelectTrigger className="w-40 h-10 text-xs">
            <Filter className="h-3.5 w-3.5 mr-1.5" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TYPE_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={priority} onValueChange={onPriorityChange}>
          <SelectTrigger className="w-36 h-10 text-xs">
            <AlertCircle className="h-3.5 w-3.5 mr-1.5" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PRIORITY_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={readFilter} onValueChange={onReadFilterChange}>
          <SelectTrigger className="w-32 h-10 text-xs">
            <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {READ_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}