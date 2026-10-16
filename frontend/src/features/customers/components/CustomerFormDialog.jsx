import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';

import {
  useCreateCustomerMutation,
  useUpdateCustomerMutation
} from '../customerApi';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(200),
  phone: z.string().max(20).optional().nullable(),
  email: z.string().email('Invalid email').optional().nullable().or(z.literal('')),
  address: z.string().max(500).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
  status: z.enum(['active', 'inactive']).default('active')
});

export default function CustomerFormDialog({
  open,
  onOpenChange,
  customer,
  onSuccess
}) {
  const isEdit = !!customer;
  const [createCustomer, { isLoading: isCreating }] = useCreateCustomerMutation();
  const [updateCustomer, { isLoading: isUpdating }] = useUpdateCustomerMutation();
  const isLoading = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      address: '',
      notes: '',
      status: 'active'
    }
  });

  useEffect(() => {
    if (open) {
      if (customer) {
        reset({
          name: customer.name || '',
          phone: customer.phone || '',
          email: customer.email || '',
          address: customer.address || '',
          notes: customer.notes || '',
          status: customer.status || 'active'
        });
      } else {
        reset();
      }
    }
  }, [open, customer, reset]);

  const onSubmit = async (data) => {
    try {
      const payload = { ...data };
      ['phone', 'email', 'address', 'notes'].forEach((k) => {
        if (!payload[k]) payload[k] = null;
      });

      if (isEdit) {
        await updateCustomer({ id: customer._id, ...payload }).unwrap();
        toast.success('Customer updated');
      } else {
        await createCustomer(payload).unwrap();
        toast.success('Customer created');
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} customer`
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit customer' : 'Add new customer'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update customer information and contact details.'
              : 'Enter customer details to create a new record.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div>
            <Label htmlFor="name">
              Full name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., Md. Hasan"
              {...register('name')}
              className={errors.name ? 'border-destructive mt-1.5' : 'mt-1.5'}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Phone + Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                placeholder="+8801700000000"
                {...register('phone')}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="customer@email.com"
                {...register('email')}
                className="mt-1.5"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>
          </div>

          {/* Address */}
          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              placeholder="Street, city"
              {...register('address')}
              className="mt-1.5"
            />
          </div>

          {/* Status */}
          <div>
            <Label>Status</Label>
            <Select
              value={watch('status')}
              onValueChange={(v) => setValue('status', v)}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Optional notes..."
              rows={2}
              {...register('notes')}
              className="mt-1.5"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? 'Save changes' : 'Create customer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}