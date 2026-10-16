// src/features/pos/components/MedicineGrid.jsx
// ✅ Mobile: 3 columns, Desktop: 5 columns

import { Package } from 'lucide-react';
import MedicineCard from './MedicineCard';
import EmptyState from '@/components/common/EmptyState';

export default function MedicineGrid({ medicines, isLoading, onAdd, error }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-4 xl:grid-cols-5 gap-2 lg:gap-3">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
          <div
            key={i}
            className="aspect-[3/4] rounded-xl lg:rounded-2xl border border-border bg-muted/40 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-destructive">Failed to load medicines</p>
      </div>
    );
  }

  if (!medicines || medicines.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="No medicines found"
        description="Try searching with a different name or barcode."
      />
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-4 xl:grid-cols-5 gap-2 lg:gap-3">
      {medicines.map((med) => (
        <MedicineCard key={med._id} medicine={med} onAdd={onAdd} />
      ))}
    </div>
  );
}