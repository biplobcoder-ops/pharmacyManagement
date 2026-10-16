// src/features/pos/components/FloatingCart.jsx
// ✅ Fixed top-right (below header) floating cart

import { ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function FloatingCart({ itemCount, total, onClick }) {
  if (itemCount === 0) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        // ✅ FIXED top-right — below header
        'fixed top-[20.5rem] right-0 z-40 lg:hidden',
        'group',
        // Icon button shape — rounded on left side
        'h-14 w-14 rounded-l-2xl',
        'flex items-center justify-center',
        // Gradient dark background
        'bg-gradient-to-br from-slate-900 to-slate-800',
        'dark:from-slate-800 dark:to-slate-900',
        // Border + shadow
        'border border-r-0 border-slate-700/50',
        'shadow-2xl shadow-black/40',
        // Animations
        'active:scale-95 transition-all duration-200',
        'animate-in slide-in-from-right-4 fade-in duration-300'
      )}
      aria-label={`Open cart — ${itemCount} items`}
      title={`${itemCount} items • ৳${total}`}
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 rounded-l-2xl bg-gradient-to-br from-accent/0 via-accent/10 to-accent/0 opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Cart icon */}
      <ShoppingCart className="h-4 w-4 text-white relative z-10" />

      {/* Badge — top-right (outside rounded corner) */}
      <span
        className={cn(
          'absolute -top-1.5 -left-1.5 h-6 min-w-[24px] px-1.5',
          'rounded-full bg-accent',
          'text-accent-foreground text-[11px] font-bold',
          'flex items-center justify-center',
          'ring-2 ring-slate-900 shadow-md',
          'animate-pulse-subtle'
        )}
      >
        {itemCount > 99 ? '99+' : itemCount}
      </span>
    </button>
  );
}