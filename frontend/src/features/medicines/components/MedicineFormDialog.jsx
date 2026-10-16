import { useEffect, useState } from 'react';
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
import { Label } from '@/components/ui/label';
import ImageUpload from './ImageUpload';
import MedicineFormFields from './MedicineFormFields';
import {
  useCreateMedicineMutation,
  useUpdateMedicineMutation,
  useGetCategoriesQuery,
  useGetBrandsQuery,
  useGetGenericsQuery,
  useGetUnitsQuery
} from '../medicineApi';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(200),
  generic: z.string().min(1, 'Generic is required'),
  brand: z.string().optional().nullable(),
  category: z.string().min(1, 'Category is required'),
  unit: z.string().min(1, 'Unit is required'),
  strength: z.string().min(1, 'Strength is required').max(50),
  dosageForm: z.string().min(1, 'Dosage form is required'),
  barcode: z.string().optional().nullable(),
  sku: z.string().optional().nullable(),
  prescriptionRequired: z.boolean().default(false),
  description: z.string().optional(),
  minStockLevel: z.number().min(0).optional()
});

export default function MedicineFormDialog({ open, onOpenChange, medicine, onSuccess }) {
  const isEdit = !!medicine;

  const [createMedicine, { isLoading: isCreating }] = useCreateMedicineMutation();
  const [updateMedicine, { isLoading: isUpdating }] = useUpdateMedicineMutation();
  const isLoading = isCreating || isUpdating;

  const [imageFile, setImageFile] = useState(null);
  const [removeExistingImage, setRemoveExistingImage] = useState(false); // ✅ NEW

  const { data: categoriesRes } = useGetCategoriesQuery();
  const { data: brandsRes } = useGetBrandsQuery();
  const { data: genericsRes } = useGetGenericsQuery();
  const { data: unitsRes } = useGetUnitsQuery();

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
      generic: '',
      brand: '',
      category: '',
      unit: '',
      strength: '',
      dosageForm: '',
      barcode: '',
      sku: '',
      prescriptionRequired: false,
      description: '',
      minStockLevel: 0
    }
  });

  useEffect(() => {
    if (open) {
      if (medicine) {
        reset({
          name: medicine.name || '',
          generic: medicine.generic?._id || medicine.generic || '',
          brand: medicine.brand?._id || medicine.brand || '',
          category: medicine.category?._id || medicine.category || '',
          unit: medicine.unit?._id || medicine.unit || '',
          strength: medicine.strength || '',
          dosageForm: medicine.dosageForm || '',
          barcode: medicine.barcode || '',
          sku: medicine.sku || '',
          prescriptionRequired: medicine.prescriptionRequired || false,
          description: medicine.description || '',
          minStockLevel: medicine.minStockLevel || 0
        });
      } else {
        reset();
      }
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setImageFile(null);
      setRemoveExistingImage(false); // ✅ Reset
    }
  }, [open, medicine, reset]);

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();

      // Append form fields
      Object.entries(data).forEach(([key, value]) => {
        if (value === '' || value === undefined || value === null) {
          if (key === 'brand' || key === 'barcode' || key === 'sku') return;
          if (key === 'description') return;
          return;
        }

        if (typeof value === 'boolean') {
          formData.append(key, String(value));
        } else if (typeof value === 'number') {
          formData.append(key, String(value));
        } else {
          formData.append(key, String(value));
        }
      });

      // ✅ Attach new image if selected
      if (imageFile) {
        formData.append('image', imageFile);
      }

      // ✅ Signal backend to remove existing image (if removed & no new uploaded)
      if (removeExistingImage && !imageFile && isEdit) {
        formData.append('removeImage', 'true');
      }

      console.log('=== FormData entries ===');
      for (const pair of formData.entries()) {
        console.log(
          pair[0],
          ':',
          pair[1] instanceof File ? `File(${pair[1].name})` : pair[1]
        );
      }

      if (isEdit) {
        await updateMedicine({ id: medicine._id, formData }).unwrap();
        toast.success('Medicine updated');
      } else {
        await createMedicine(formData).unwrap();
        toast.success('Medicine created');
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(
        error?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} medicine`
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit medicine' : 'Add new medicine'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update medicine information, pricing and stock thresholds.'
              : 'Fill in the details to add a new medicine to your inventory.'}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto scrollbar-thin pr-1 space-y-5"
        >
          <div>
            <Label className="mb-2 block">Medicine image</Label>
            <ImageUpload
              file={imageFile}
              onFileChange={setImageFile}
              existingImage={medicine?.image}
              onExistingImageRemove={() => setRemoveExistingImage(true)} // ✅ NEW
            />
          </div>

          <MedicineFormFields
            register={register}
            errors={errors}
            watch={watch}
            setValue={setValue}
            categories={categoriesRes?.data?.categories || []}
            brands={brandsRes?.data?.brands || []}
            generics={genericsRes?.data?.generics || []}
            units={unitsRes?.data?.units || []}
          />
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
            {isEdit ? 'Save changes' : 'Create medicine'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}