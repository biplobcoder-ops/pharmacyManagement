import { useState } from 'react';
import { cn } from '@/lib/utils';

const COLORS = [
  'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400'
];

export default function MedicineImage({ medicine, size = 'md' }) {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: 'h-9 w-9 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-14 w-14 text-xl',
    xl: 'h-full w-full text-4xl'
  };

  const initial = medicine?.name?.charAt(0)?.toUpperCase() || '?';
  const colorIndex = medicine?.name?.charCodeAt(0) % COLORS.length || 0;
  const colorClass = COLORS[colorIndex];

  const hasImage = medicine?.image?.url && !imageError;

  if (hasImage) {
    return (
      <img
        src={medicine.image.url}
        alt={medicine.name}
        className={cn('object-cover', size === 'xl' ? 'h-full w-full' : sizeClasses[size])}
        onError={() => setImageError(true)}
        loading="lazy"
      />
    );
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center font-bold',
        colorClass,
        sizeClasses[size]
      )}
    >
      {initial}
    </div>
  );
}