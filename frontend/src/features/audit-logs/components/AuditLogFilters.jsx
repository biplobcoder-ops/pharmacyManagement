// src/features/audit-logs/components/AuditLogFilters.jsx

import { Filter, Activity, Layers, Calendar } from 'lucide-react';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  ACTION_OPTIONS, MODULE_OPTIONS, DATE_RANGES
} from '../auditLogsTypes';

export default function AuditLogFilters({
  actionFilter,
  onActionChange,
  moduleFilter,
  onModuleChange,
  dateRange,
  onDateRangeChange
}) {
  return (
    <div className="flex flex-col lg:flex-row gap-3">
      {/* Left side — Info */}
      <div className="flex-1 flex items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Activity className="h-3.5 w-3.5" />
          <span>Filter audit logs by activity, module and date range</span>
        </div>
      </div>

      {/* Right side — Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Action filter */}
        <Select value={actionFilter} onValueChange={onActionChange}>
          <SelectTrigger className="w-40 h-10 text-xs">
            <Filter className="h-3.5 w-3.5 mr-1.5" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ACTION_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Module filter */}
        <Select value={moduleFilter} onValueChange={onModuleChange}>
          <SelectTrigger className="w-40 h-10 text-xs">
            <Layers className="h-3.5 w-3.5 mr-1.5" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MODULE_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Date range filter */}
        <Select value={dateRange} onValueChange={onDateRangeChange}>
          <SelectTrigger className="w-40 h-10 text-xs">
            <Calendar className="h-3.5 w-3.5 mr-1.5" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DATE_RANGES.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}