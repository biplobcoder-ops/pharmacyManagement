// src/features/auth/pages/RoleSelectionPage.jsx
// ✅ Viewport-fit — no scroll, professional

import { useState } from 'react';
import { APP_NAME, APP_TAGLINE } from '@/lib/constants';
import ThemeToggle from '@/components/common/ThemeToggle';
import RoleGrid from '../components/RoleGrid';

export default function RoleSelectionPage({ onSelectRole }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSelect = (roleValue) => {
    setIsLoading(true);
    setTimeout(() => {
      onSelectRole(roleValue);
      setIsLoading(false);
    }, 300);
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-background flex flex-col">
      {/* ===== TOP BAR ===== */}
      <div className="flex items-center justify-between px-4 lg:px-8 py-3 lg:py-4 shrink-0 border-b border-border/50">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 lg:h-9 lg:w-9 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-base lg:text-lg">P</span>
          </div>
          <div>
            <h1 className="text-xs lg:text-sm font-bold text-foreground leading-tight">
              {APP_NAME}
            </h1>
            <p className="text-[9px] lg:text-[10px] text-muted-foreground uppercase tracking-wider leading-tight">
              {APP_TAGLINE}
            </p>
          </div>
        </div>
        <ThemeToggle />
      </div>

      {/* ===== MAIN CONTENT (fills remaining space) ===== */}
      <div className="flex-1 flex flex-col min-h-0 px-4 lg:px-8 py-4 lg:py-6">

        {/* Hero — compact */}
        <div className="text-center mb-4 lg:mb-6 shrink-0">
          <h2 className="text-xl lg:text-3xl font-bold text-foreground mb-1.5 lg:mb-2">
            Welcome to {APP_NAME}
          </h2>
          <p className="text-xs lg:text-sm text-muted-foreground max-w-2xl mx-auto">
            Select your role to continue. Each role has its own permissions and access level.
          </p>
        </div>

        {/* Role grid — takes remaining space */}
        <div className="flex-1 min-h-0 flex items-center justify-center">
          <div className="w-full max-w-6xl">
            <RoleGrid onSelectRole={handleSelect} isLoading={isLoading} />
          </div>
        </div>

      </div>

      {/* ===== FOOTER ===== */}
      <div className="px-4 py-2 lg:py-3 text-center shrink-0 border-t border-border/50">
        <p className="text-[10px] lg:text-xs text-muted-foreground">
          © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </p>
      </div>
    </div>
  );
}