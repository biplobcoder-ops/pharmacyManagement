// src/features/users/components/UserFormDialog.jsx
// Create/Edit user dialog

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Loader2, UserPlus, Save, Eye, EyeOff } from 'lucide-react';

import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

import {
  useCreateUserMutation,
  useUpdateUserMutation,
  useGetRolesQuery
} from '../usersApi';

// Schema
const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email'),
  phone: z.string().optional().or(z.literal('')),
  password: z.string().optional().or(z.literal('')),
  role: z.string().min(1, 'Role is required'),
  status: z.enum(['active', 'inactive', 'suspended']).default('active')
});

export default function UserFormDialog({ open, onOpenChange, user, onSuccess }) {
  const isEdit = !!user;
  const [showPassword, setShowPassword] = useState(false);

  const { data: rolesRes } = useGetRolesQuery();
  const roles = rolesRes?.data?.roles || [];

  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  const isLoading = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      role: '',
      status: 'active'
    }
  });

  const selectedRole = watch('role');
  const selectedStatus = watch('status');

  // Populate on edit / reset on close
  useEffect(() => {
    if (open) {
      if (user) {
        reset({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          password: '',
          role: user.role?._id || '',
          status: user.status || 'active'
        });
      } else {
        reset({
          name: '',
          email: '',
          phone: '',
          password: '',
          role: '',
          status: 'active'
        });
      }
    }
  }, [open, user, reset]);

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        // Password empty hole bad dao
        const payload = { ...data };
        if (!payload.password) delete payload.password;

        await updateUser({ id: user._id, ...payload }).unwrap();
        toast.success('User updated');
      } else {
        await createUser(data).unwrap();
        toast.success('User created');
      }
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to save user');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <UserPlus className="h-5 w-5 text-accent" />
            </div>
            <div>
              <DialogTitle className="text-base">
                {isEdit ? 'Edit User' : 'Create User'}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {isEdit
                  ? 'Update user information and role'
                  : 'Add a new user to the system'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          {/* Name */}
          <div>
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              placeholder="John Doe"
              {...register('name')}
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="user@pharmacy.com"
              {...register('email')}
              className={errors.email ? 'border-destructive' : ''}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              placeholder="+8801700000000"
              {...register('phone')}
            />
          </div>

          {/* Password */}
          <div>
            <Label htmlFor="password">
              Password {!isEdit && '*'}
              {isEdit && (
                <span className="text-xs text-muted-foreground ml-1">
                  (leave empty to keep current)
                </span>
              )}
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder={isEdit ? '••••••••' : 'Min 6 characters'}
                {...register('password')}
                className={cn('pr-10', errors.password && 'border-destructive')}
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
              <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          {/* Role + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Role *</Label>
              <Select
                value={selectedRole}
                onValueChange={(v) => setValue('role', v)}
              >
                <SelectTrigger className={errors.role ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r._id} value={r._id}>
                      <span className="capitalize">{r.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="mt-1 text-xs text-destructive">{errors.role.message}</p>
              )}
            </div>

            <div>
              <Label>Status</Label>
              <Select
                value={selectedStatus}
                onValueChange={(v) => setValue('status', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {isEdit ? 'Update' : 'Create'}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}