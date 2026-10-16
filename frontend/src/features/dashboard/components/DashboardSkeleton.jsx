// src/features/dashboard/components/DashboardSkeleton.jsx

export default function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* KPI Grid */}
      <div>
        <div className="h-4 w-40 bg-muted rounded mb-3 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-32 rounded-xl border border-border bg-card animate-pulse relative overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-1 bg-muted" />
            </div>
          ))}
        </div>
      </div>

      {/* Alert Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-20 rounded-xl border border-border bg-card animate-pulse" />
        ))}
      </div>

      {/* Charts Row */}
      <div>
        <div className="h-4 w-32 bg-muted rounded mb-3 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 h-96 rounded-xl border border-border bg-card animate-pulse" />
          <div className="h-96 rounded-xl border border-border bg-card animate-pulse" />
        </div>
      </div>

      {/* Tables Row */}
      <div>
        <div className="h-4 w-36 bg-muted rounded mb-3 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="h-80 rounded-xl border border-border bg-card animate-pulse" />
          <div className="h-80 rounded-xl border border-border bg-card animate-pulse" />
        </div>
      </div>
    </div>
  );
}