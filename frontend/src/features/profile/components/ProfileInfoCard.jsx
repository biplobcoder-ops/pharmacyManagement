// src/features/profile/components/ProfileInfoCard.jsx
// Edit profile info — name, phone, email

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { User, Loader2, Save, Edit, X, Mail, Phone } from 'lucide-react';

import {
  Card, CardContent, CardHeader, CardTitle, CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

import { useUpdateUserMutation } from '@/features/users/usersApi';
import { setUser } from '@/features/auth/authSlice';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email'),
  phone: z.string().optional().or(z.literal(''))
});

export default function ProfileInfoCard({ user }) {
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);

  const [updateUser, { isLoading }] = useUpdateUserMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty }
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || ''
    }
  });

  // Reset form when user changes or cancel
  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
  }, [user, reset]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    reset({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || ''
    });
    setIsEditing(false);
  };

  const onSubmit = async (data) => {
    if (!user?._id) return;

    try {
      const result = await updateUser({
        id: user._id,
        ...data
      }).unwrap();

      // ✅ Update Redux state
      const updatedUser = result?.data;
      if (updatedUser) {
        dispatch(
          setUser({
            ...user,
            ...updatedUser
          })
        );
      }

      toast.success('Profile updated');
      setIsEditing(false);
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to update profile');
    }
  };

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4 text-accent" />
            Personal Information
          </CardTitle>
          <CardDescription className="text-xs">
            Update your name, email and phone number
          </CardDescription>
        </div>

        {!isEditing ? (
          <Button
            variant="outline"
            size="sm"
            onClick={handleEdit}
            className="shrink-0"
          >
            <Edit className="h-3.5 w-3.5" />
            Edit
          </Button>
        ) : (
          <div className="flex gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={isLoading}
            >
              <X className="h-3.5 w-3.5" />
              Cancel
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div>
            <Label htmlFor="name">Full Name</Label>
            <div className="relative mt-1.5">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                id="name"
                {...register('name')}
                disabled={!isEditing}
                className={cn(
                  'pl-9',
                  errors.name && 'border-destructive',
                  !isEditing && 'bg-muted/30 cursor-not-allowed'
                )}
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-xs text-destructive">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">Email Address</Label>
            <div className="relative mt-1.5">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                id="email"
                type="email"
                {...register('email')}
                disabled={!isEditing}
                className={cn(
                  'pl-9',
                  errors.email && 'border-destructive',
                  !isEditing && 'bg-muted/30 cursor-not-allowed'
                )}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative mt-1.5">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                id="phone"
                {...register('phone')}
                disabled={!isEditing}
                placeholder="+8801700000000"
                className={cn(
                  'pl-9',
                  !isEditing && 'bg-muted/30 cursor-not-allowed'
                )}
              />
            </div>
          </div>

          {/* Save button */}
          {isEditing && (
            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={isLoading || !isDirty}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save changes
                  </>
                )}
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}