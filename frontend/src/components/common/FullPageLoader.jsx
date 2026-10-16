// src/components/common/FullPageLoader.jsx
// ✅ Full page loading spinner with brand

import { Loader2 } from 'lucide-react';

export default function FullPageLoader({ message = 'Loading...' }) {
  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center">
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-8 animate-pulse">
        <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-lg">P</span>
        </div>
        <div>
          <h1 className="text-base font-bold text-foreground leading-tight">
            PharmaFlow
          </h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider leading-tight">
            Business Suite
          </p>
        </div>
      </div>

      {/* Spinner */}
      <Loader2 className="h-8 w-8 animate-spin text-accent mb-4" />

      {/* Message */}
      <p className="text-xs text-muted-foreground">{message}</p>

      {/* Progress dots */}
      <div className="flex gap-1.5 mt-3">
        <span className="h-1.5 w-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="h-1.5 w-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="h-1.5 w-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}