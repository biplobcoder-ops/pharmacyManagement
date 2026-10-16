// src/features/auth/components/RoleCardSkeleton.jsx

export default function RoleCardSkeleton() {
  return (
    <div className="rounded-2xl border-2 border-border bg-card p-6 animate-pulse">
      {/* Icon */}
      <div className="h-14 w-14 rounded-xl bg-muted/60 mb-4" />

      {/* Title */}
      <div className="h-5 w-24 bg-muted/60 rounded mb-2" />

      {/* Description */}
      <div className="h-3 w-32 bg-muted/60 rounded mb-4" />

      {/* Features */}
      <div className="space-y-2 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-3 w-full bg-muted/60 rounded" />
        ))}
      </div>

      {/* Button */}
      <div className="h-10 w-full bg-muted/60 rounded-xl" />
    </div>
  );
}