// src/features/auth/components/LoginForm.jsx

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Eye, EyeOff, Loader2, LogIn, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useLoginMutation } from '../authApi';
import { setCredentials } from '../authSlice';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export default function LoginForm({ role, onForgotPassword }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [login, { isLoading }] = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: role.demo.email,
      password: role.demo.password
    }
  });

  const onSubmit = async (data) => {
    try {
      // ✅ Role soho backend e pathao
      const result = await login({ ...data, role: role.value }).unwrap();
      dispatch(setCredentials(result.data));
      toast.success(`Welcome back, ${result.data.user.name}!`);

      // ✅ Role-specific redirect
      const redirect = role.redirect || '/';
      navigate(redirect, { replace: true });
    } catch (error) {
      toast.error(error?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Email */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-foreground mb-1.5"
        >
          Email address
        </label>
        <Input
          id="email"
          type="email"
          placeholder="you@pharmacy.com"
          autoComplete="email"
          {...register('email')}
          className={errors.email ? 'border-destructive' : ''}
        />
        {errors.email && (
          <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-foreground mb-1.5"
        >
          Password
        </label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            autoComplete="current-password"
            {...register('password')}
            className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-xs text-destructive">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Forgot password — link style (but click korle admin notify) */}
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-xs text-accent hover:underline"
        >
          Forgot password?
        </button>
      </div>

      {/* Submit */}
      <Button
        type="submit"
        className={cn('w-full', role.buttonBg, 'text-white')}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          <>
            <LogIn className="h-4 w-4" />
            Sign in as {role.label}
          </>
        )}
      </Button>

      {/* Role-specific demo credentials */}
      <div
        className={cn(
          'rounded-lg border p-3',
          role.border,
          role.bg
        )}
      >
        <div className="flex items-start gap-2">
          <AlertCircle className={cn('h-3.5 w-3.5 shrink-0 mt-0.5', role.color)} />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-foreground mb-1">
              Demo credentials for {role.label}:
            </p>
            <p className="text-xs text-muted-foreground">
              Email: <span className="font-mono">{role.demo.email}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Password: <span className="font-mono">{role.demo.password}</span>
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}