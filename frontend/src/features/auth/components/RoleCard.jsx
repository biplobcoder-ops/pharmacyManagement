// src/features/auth/components/RoleCard.jsx
// ✅ Compact — fits in viewport

import { ArrowRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function RoleCard({ role, onSelect }) {
  const Icon = role.icon;

  return (
    <button
      type="button"
      onClick={() => onSelect(role.value)}
      className={cn(
        'group relative flex flex-col text-left rounded-2xl border-2 bg-card',
        'p-4 lg:p-5 transition-all duration-300',
        'hover:shadow-xl hover:-translate-y-1',
        'border-border',
        role.hoverBorder,
        'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2'
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'flex h-10 w-10 lg:h-12 lg:w-12 items-center justify-center rounded-xl mb-3 transition-transform group-hover:scale-110',
          role.bg
        )}
      >
        <Icon className={cn('h-5 w-5 lg:h-6 lg:w-6', role.color)} />
      </div>

      {/* Title */}
      <h3 className="text-base lg:text-lg font-bold text-foreground mb-0.5 lg:mb-1">
        {role.label}
      </h3>

      {/* Description */}
      <p className="text-[11px] lg:text-xs text-muted-foreground mb-2 lg:mb-3">
        {role.description}
      </p>

      {/* Features — compact */}
      <ul className="space-y-1 mb-3 lg:mb-4 flex-1">
        {role.features.slice(0, 2).map((feature) => (
          <li
            key={feature}
            className="flex items-start gap-1.5 text-[10px] lg:text-xs text-muted-foreground"
          >
            <Check className={cn('h-3 w-3 lg:h-3.5 lg:w-3.5 shrink-0 mt-0.5', role.color)} />
            <span className="truncate">{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <div
        className={cn(
          'flex items-center justify-center gap-2 w-full py-2 lg:py-2.5 rounded-xl',
          'text-xs lg:text-sm font-semibold text-white transition-all',
          role.buttonBg,
          'group-hover:shadow-lg'
        )}
      >
        Continue
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
      </div>
    </button>
  );
}