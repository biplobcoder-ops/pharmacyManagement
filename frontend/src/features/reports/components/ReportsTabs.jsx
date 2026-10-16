// src/features/reports/components/ReportsTabs.jsx

import { cn } from '@/lib/utils';
import { REPORT_TABS } from '../reportsTypes';

export default function ReportsTabs({ value, onChange }) {
  return (
    <div className="flex items-center gap-1 border-b border-border overflow-x-auto scrollbar-thin">
      {REPORT_TABS.map((t) => (
        <button
          key={t.value}
          type="button"
          onClick={() => onChange(t.value)}
          className={cn(
            'px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap',
            value === t.value
              ? 'border-accent text-accent'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}