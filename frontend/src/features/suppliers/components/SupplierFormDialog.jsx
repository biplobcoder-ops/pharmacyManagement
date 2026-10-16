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
  useCreateSupplierMutation,
  useUpdateSupplierMutation
} from '../supplierApi';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(200),
  company: z.string().max(200).optional().nullable(),
  phone: z.string().min(1, 'Phone is required').max(20),
  email: z
    .string()
    .email('Invalid email')
    .optional()
    .nullable()
    .or(z.literal('')),
  address: z.string().max(500).optional().nullable(),
  contactPerson: z.string().max(200).optional().nullable(),
  tradeLicense: z.string().max(100).optional().nullable(),
  taxId: z.string().max(100).optional().nullable(),
  openingBalance: z.number().min(0).default(0),
  notes: z.string().max(500).optional().nullable(),
  status: z.enum(['active', 'inactive']).default('active')
});

export default function SupplierFormDialog({
  open,
  onOpenChange,
  supplier,
  onSuccess
}) {
  const isEdit = !!supplier;
  const [createSupplier, { isLoading: isCreating }] = useCreateSupplierMutation();
  const [updateSupplier, { isLoading: isUpdating }] = useUpdateSupplierMutation();
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
      company: '',
      phone: '',
      email: '',
      address: '',
      contactPerson: '',
      tradeLicense: '',
      taxId: '',
      openingBalance: 0,
      notes: '',
      status: 'active'
    }
  });

  useEffect(() => {
    if (open) {
      if (supplier) {
        reset({
          name: supplier.name || '',
          company: supplier.company || '',
          phone: supplier.phone || '',
          email: supplier.email || '',
          address: supplier.address || '',
          contactPerson: supplier.contactPerson || '',
          tradeLicense: supplier.tradeLicense || '',
          taxId: supplier.taxId || '',
          openingBalance: supplier.openingBalance || 0,
          notes: supplier.notes || '',
          status: supplier.status || 'active'
        });
      } else {
        reset();
      }
    }
  }, [open, supplier, reset]);

  const onSubmit = async (data) => {
    try {
      const payload = { ...data };
      ['company', 'email', 'address', 'contactPerson', 'tradeLicense', 'taxId', 'notes'].forEach((k) => {
        if (!payload[k]) payload[k] = null;
      });

      if (isEdit) {
        delete payload.openingBalance;
        await updateSupplier({ id: supplier._id, ...payload }).unwrap();
        toast.success('Supplier updated');
      } else {
        await createSupplier(payload).unwrap();
        toast.success('Supplier created');
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} supplier`
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit supplier' : 'Add new supplier'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update supplier information and contact details.'
              : 'Enter supplier details to create a new record.'}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto scrollbar-thin pr-1 space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">
                Supplier name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., Square Distributor"
                {...register('name')}
                className="mt-1.5"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                placeholder="e.g., Square Pharmaceuticals Ltd"
                {...register('company')}
                className="mt-1.5"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">
                Phone <span className="text-destructive">*</span>
              </Label>
              <Input
                id="phone"
                placeholder="+8801700000000"
                {...register('phone')}
                className="mt-1.5"
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-destructive">
                  {errors.phone.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="supplier@email.com"
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

          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              placeholder="Street, city"
              {...register('address')}
              className="mt-1.5"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contactPerson">Contact person</Label>
              <Input
                id="contactPerson"
                placeholder="e.g., Mr. Rahman"
                {...register('contactPerson')}
                className="mt-1.5"
              />
            </div>
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tradeLicense">Trade license</Label>
              <Input
                id="tradeLicense"
                placeholder="Optional"
                {...register('tradeLicense')}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="taxId">Tax ID / VAT</Label>
              <Input
                id="taxId"
                placeholder="Optional"
                {...register('taxId')}
                className="mt-1.5"
              />
            </div>
          </div>

          {!isEdit && (
            <div>
              <Label htmlFor="openingBalance">Opening balance (৳)</Label>
              <Input
                id="openingBalance"
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                {...register('openingBalance', { valueAsNumber: true })}
                className="mt-1.5"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Amount you already owe the supplier (if any)
              </p>
            </div>
          )}

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
        </form>

        <DialogFooter className="border-t border-border pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEdit ? 'Save changes' : 'Create supplier'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}