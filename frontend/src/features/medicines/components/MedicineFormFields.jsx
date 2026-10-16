import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';

const DOSAGE_FORMS = [
  'tablet', 'capsule', 'syrup', 'suspension', 'injection',
  'ointment', 'cream', 'gel', 'drops', 'inhaler',
  'spray', 'suppository', 'powder', 'other'
];

// ✅ Field component — OUTSIDE the main component
function Field({ label, name, required, children, error }) {
  return (
    <div>
      <Label htmlFor={name}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <div className="mt-1.5">{children}</div>
      {error && <p className="mt-1 text-xs text-destructive">{error.message}</p>}
    </div>
  );
}

export default function MedicineFormFields({
  register,
  errors,
  watch,
  setValue,
  categories = [],
  brands = [],
  generics = [],
  units = []
}) {
  return (
    <div className="space-y-4">
      {/* Name + Strength */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Medicine name" name="name" required error={errors.name}>
          <Input
            id="name"
            placeholder="e.g., Napa 500"
            {...register('name')}
            className={errors.name ? 'border-destructive' : ''}
          />
        </Field>

        <Field label="Strength" name="strength" required error={errors.strength}>
          <Input
            id="strength"
            placeholder="e.g., 500 mg"
            {...register('strength')}
            className={errors.strength ? 'border-destructive' : ''}
          />
        </Field>
      </div>

      {/* Generic + Brand */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Generic" name="generic" required error={errors.generic}>
          <Select
            value={watch('generic') || ''}
            onValueChange={(v) => setValue('generic', v, { shouldValidate: true })}
          >
            <SelectTrigger className={errors.generic ? 'border-destructive' : ''}>
              <SelectValue placeholder="Select generic" />
            </SelectTrigger>
            <SelectContent>
              {generics.map((g) => (
                <SelectItem key={g._id} value={g._id}>
                  {g.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Brand" name="brand" error={errors.brand}>
          <Select
            value={watch('brand') || ''}
            onValueChange={(v) => setValue('brand', v, { shouldValidate: true })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select brand (optional)" />
            </SelectTrigger>
            <SelectContent>
              {brands.map((b) => (
                <SelectItem key={b._id} value={b._id}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      {/* Category + Unit */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Category" name="category" required error={errors.category}>
          <Select
            value={watch('category') || ''}
            onValueChange={(v) => setValue('category', v, { shouldValidate: true })}
          >
            <SelectTrigger className={errors.category ? 'border-destructive' : ''}>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c._id} value={c._id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Unit" name="unit" required error={errors.unit}>
          <Select
            value={watch('unit') || ''}
            onValueChange={(v) => setValue('unit', v, { shouldValidate: true })}
          >
            <SelectTrigger className={errors.unit ? 'border-destructive' : ''}>
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent>
              {units.map((u) => (
                <SelectItem key={u._id} value={u._id}>
                  {u.name} {u.shortName ? `(${u.shortName})` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      {/* Dosage form + Min stock */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Dosage form" name="dosageForm" required error={errors.dosageForm}>
          <Select
            value={watch('dosageForm') || ''}
            onValueChange={(v) => setValue('dosageForm', v, { shouldValidate: true })}
          >
            <SelectTrigger className={errors.dosageForm ? 'border-destructive' : ''}>
              <SelectValue placeholder="Select form" />
            </SelectTrigger>
            <SelectContent>
              {DOSAGE_FORMS.map((f) => (
                <SelectItem key={f} value={f} className="capitalize">
                  {f}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Min. stock level" name="minStockLevel" error={errors.minStockLevel}>
          <Input
            id="minStockLevel"
            type="number"
            min="0"
            placeholder="e.g., 50"
            {...register('minStockLevel', { valueAsNumber: true })}
          />
        </Field>
      </div>

      {/* Barcode + SKU */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Barcode" name="barcode" error={errors.barcode}>
          <Input id="barcode" placeholder="Optional" {...register('barcode')} />
        </Field>

        <Field label="SKU" name="sku" error={errors.sku}>
          <Input id="sku" placeholder="Optional" {...register('sku')} />
        </Field>
      </div>

      {/* Prescription required */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="prescriptionRequired"
          {...register('prescriptionRequired')}
          className="h-4 w-4 rounded border-input accent-accent"
        />
        <Label htmlFor="prescriptionRequired" className="cursor-pointer">
          Prescription required
        </Label>
      </div>

      {/* Description */}
      <Field label="Description" name="description" error={errors.description}>
        <Textarea
          id="description"
          placeholder="Optional medicine description..."
          rows={3}
          {...register('description')}
        />
      </Field>
    </div>
  );
}