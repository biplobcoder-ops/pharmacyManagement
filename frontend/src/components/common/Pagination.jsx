// src/components/common/Pagination.jsx
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function Pagination({ pagination, onPageChange, className, isLoading = false }) {
  if (!pagination) return null;

  const { page, totalPages, total, limit } = pagination;
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 3) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = page - 1; i <= page + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-4',
        className
      )}
    >
      {/* Info & Loading Spinner */}
      <div className="flex items-center gap-2 order-2 sm:order-1">
        {/* ✅ Loading hole spinner dekhabe */}
        {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        
        <p className="text-xs text-muted-foreground">
          Showing <span className="font-medium text-foreground">{start}-{end}</span> of{' '}
          <span className="font-medium text-foreground">{total}</span>
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1 order-1 sm:order-2">
        {/* First */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 hidden sm:flex"
          onClick={() => onPageChange(1)}
          disabled={page === 1 || isLoading} // ✅ isLoading disable kore dibe
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        {/* Prev */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1 || isLoading} // ✅ isLoading disable kore dibe
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Pages */}
        <div className="hidden sm:flex items-center gap-1">
          {getPageNumbers().map((p, i) =>
            p === '...' ? (
              <span
                key={`dots-${i}`}
                className="px-2 text-sm text-muted-foreground"
              >
                ...
              </span>
            ) : (
              <Button
                key={p}
                variant={p === page ? 'default' : 'outline'}
                size="icon"
                className="h-8 w-8 text-xs"
                onClick={() => onPageChange(p)}
                disabled={isLoading} // ✅ isLoading disable kore dibe
              >
                {p}
              </Button>
            )
          )}
        </div>

        {/* Mobile page */}
        <span className="sm:hidden text-sm text-muted-foreground px-2">
          {page} / {totalPages}
        </span>

        {/* Next */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages || isLoading} // ✅ isLoading disable kore dibe
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Last */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 hidden sm:flex"
          onClick={() => onPageChange(totalPages)}
          disabled={page === totalPages || isLoading} // ✅ isLoading disable kore dibe
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}