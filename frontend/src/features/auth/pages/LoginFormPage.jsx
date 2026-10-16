// src/features/auth/pages/LoginFormPage.jsx

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { APP_NAME, APP_TAGLINE } from '@/lib/constants';
import ThemeToggle from '@/components/common/ThemeToggle';
import ForgotPasswordDialog from '../components/ForgotPasswordDialog';
import LoginForm from '../components/LoginForm';

export default function LoginFormPage({ role, onBack }) {
  const [forgotOpen, setForgotOpen] = useState(false);
  const Icon = role.icon;

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="flex items-center justify-between p-4 lg:p-6">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">P</span>
          </div>
          <div>
            <h1 className="text-sm font-bold text-foreground leading-tight">
              {APP_NAME}
            </h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider leading-tight">
              {APP_TAGLINE}
            </p>
          </div>
        </div>
        <ThemeToggle />
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md animate-fade-in">
          {/* Back button */}
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to role selection
          </button>

          {/* Card */}
          <div className="rounded-2xl border border-border bg-card p-6 lg:p-8 shadow-lg">
            {/* Role header */}
            <div className="flex items-center gap-3 mb-6">
              <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl', role.bg)}>
                <Icon className={cn('h-6 w-6', role.color)} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  {role.label} Login
                </h2>
                <p className="text-xs text-muted-foreground">
                  {role.description}
                </p>
              </div>
            </div>

            {/* Form */}
            <LoginForm
              role={role}
              onForgotPassword={() => setForgotOpen(true)}
            />
          </div>
        </div>
      </div>

      {/* Forgot password dialog */}
      <ForgotPasswordDialog
        open={forgotOpen}
        onOpenChange={setForgotOpen}
        role={role}
      />
    </div>
  );
}