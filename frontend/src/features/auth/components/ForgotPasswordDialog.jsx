// src/features/auth/components/ForgotPasswordDialog.jsx

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, KeyRound, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useRequestPasswordResetMutation } from '../authApi';

const schema = z.object({
  email: z.string().email('Please enter a valid email')
});

export default function ForgotPasswordDialog({ open, onOpenChange, role }) {
  const [success, setSuccess] = useState(false);
  const [requestReset, { isLoading }] = useRequestPasswordResetMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '' }
  });

  const onSubmit = async (data) => {
    try {
      await requestReset({ email: data.email, role: role.value }).unwrap();
      setSuccess(true);
      toast.success('Admin has been notified');
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to send request');
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setSuccess(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', role.bg)}>
              {success ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              ) : (
                <KeyRound className={cn('h-5 w-5', role.color)} />
              )}
            </div>
            <div>
              <DialogTitle className="text-base">
                {success ? 'Request Sent' : 'Forgot Password?'}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {success
                  ? 'Admin will contact you soon'
                  : 'Admin will be notified to reset your password'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {success ? (
          <div className="space-y-4 mt-2">
            <p className="text-sm text-muted-foreground">
              Ei email er jonno password reset request admin ke pathano hoyeche.
              Admin apnake contact korbe.
            </p>
            <Button onClick={handleClose} className="w-full">
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Your email
              </label>
              <Input
                type="email"
                placeholder="you@pharmacy.com"
                {...register('email')}
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className={cn('flex-1 text-white', role.buttonBg)}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Request'
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}