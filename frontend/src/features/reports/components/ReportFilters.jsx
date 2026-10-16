// src/features/reports/components/ReportFilters.jsx

import { Calendar, Layers } from 'lucide-react';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { DATE_PRESETS, GROUP_BY_OPTIONS } from '../reportsTypes';

export default function ReportFilters({
  tab, datePreset, onDatePresetChange, groupBy, onGroupByChange
}) {
  const showDateFilter = tab !== 'inventory';
  const showGroupBy = tab === 'sales' || tab === 'purchases';

  return (
    <div className="flex flex-wrap items-center gap-3">
      {showDateFilter && (
        <Select value={datePreset} onValueChange={onDatePresetChange}>
          <SelectTrigger className="w-44 h-10 text-xs">
            <Calendar className="h-3.5 w-3.5 mr-1.5" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DATE_PRESETS.map((p) => (
              <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {showGroupBy && (
        <Select value={groupBy} onValueChange={onGroupByChange}>
          <SelectTrigger className="w-32 h-10 text-xs">
            <Layers className="h-3.5 w-3.5 mr-1.5" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {GROUP_BY_OPTIONS.map((g) => (
              <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}