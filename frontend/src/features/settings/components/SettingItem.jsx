// src/features/settings/components/SettingItem.jsx
// Single setting row — input based on data type


import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { SETTING_META, DATA_TYPES } from '../settingsTypes';

export default function SettingItem({
  setting,
  value,
  isDirty,
  onChange,
  isLast
}) {
  // ✅ Metadata lookup (label, description, placeholder)
  const meta = SETTING_META[setting.key] || {};
  const label = meta.label || setting.label || setting.key;
  const description = meta.description || setting.description || '';
  const placeholder = meta.placeholder || '';

  // ✅ Determine input type based on setting.dataType
  const dataType = setting.dataType || 'string';

  return (
    <div
      className={cn(
        'py-3 transition-colors',
        !isLast && 'border-b border-border/50',
        isDirty && 'bg-accent/5 -mx-3 px-3 rounded-lg border-b-0'
      )}
    >
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        {/* Left: Label + description */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Label className="text-sm font-medium text-foreground">
              {label}
            </Label>
            {isDirty && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-accent">
                <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                Modified
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {description}
            </p>
          )}
          <div className="flex items-center gap-1.5 mt-1">
            <code className="text-[10px] font-mono text-muted-foreground/70">
              {setting.key}
            </code>
            <span className="text-[10px] text-muted-foreground/50">•</span>
            <span className="text-[10px] text-muted-foreground/70">
              {DATA_TYPES[dataType]?.label || dataType}
            </span>
            {setting.isSystem && (
              <>
                <span className="text-[10px] text-muted-foreground/50">•</span>
                <span className="text-[10px] font-medium text-accent/70">
                  System
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right: Input */}
        <div className="lg:w-80 shrink-0">
          <SettingInput
            type={dataType}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
          />
        </div>
      </div>
    </div>
  );
}

// ===== Input Renderer by Type =====
function SettingInput({ type, value, onChange, placeholder }) {
  // ✅ BOOLEAN → Switch
  if (type === 'boolean') {
    return (
      <div className="flex items-center gap-3">
        <Switch
          checked={value === true || value === 'true'}
          onCheckedChange={(checked) => onChange(checked)}
        />
        <span
          className={cn(
            'text-xs font-medium',
            value === true || value === 'true'
              ? 'text-success'
              : 'text-muted-foreground'
          )}
        >
          {value === true || value === 'true' ? 'Enabled' : 'Disabled'}
        </span>
      </div>
    );
  }

  // ✅ NUMBER → Number input
  if (type === 'number') {
    return (
      <Input
        type="number"
        value={value ?? ''}
        onChange={(e) => {
          const val = e.target.value;
          onChange(val === '' ? '' : Number(val));
        }}
        placeholder={placeholder || '0'}
        className="h-9"
      />
    );
  }

  // ✅ ARRAY → Textarea (newline separated)
  if (type === 'array') {
    const arrayValue = Array.isArray(value)
      ? value.join('\n')
      : String(value || '');

    return (
      <Textarea
        value={arrayValue}
        onChange={(e) => {
          const lines = e.target.value
            .split('\n')
            .map((l) => l.trim())
            .filter(Boolean);
          onChange(lines);
        }}
        placeholder={placeholder || 'One item per line'}
        rows={3}
        className="text-xs resize-none"
      />
    );
  }

  // ✅ OBJECT → Textarea (JSON)
  if (type === 'object') {
    // eslint-disable-next-line no-useless-assignment
    let jsonValue = '';
    try {
      jsonValue =
        typeof value === 'string' ? value : JSON.stringify(value || {}, null, 2);
    // eslint-disable-next-line no-unused-vars
    } catch (e) {
      jsonValue = String(value || '');
    }

    return (
      <Textarea
        value={jsonValue}
        onChange={(e) => {
          try {
            const parsed = JSON.parse(e.target.value);
            onChange(parsed);
          // eslint-disable-next-line no-unused-vars
          } catch (err) {
            // Invalid JSON — keep as string temporarily
            onChange(e.target.value);
          }
        }}
        placeholder='{"key": "value"}'
        rows={4}
        className="text-xs font-mono resize-none"
      />
    );
  }

  // ✅ DEFAULT → Text input
  return (
    <Input
      type="text"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-9"
    />
  );
}