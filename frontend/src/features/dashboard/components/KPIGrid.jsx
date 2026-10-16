// src/features/dashboard/components/KPIGrid.jsx
// ✅ Mobile-first responsive

import KPICard from './KPICard';

export default function KPIGrid({ data, isLoading }) {
  if (isLoading || !data) {
    return <KPIGridSkeleton />;
  }

  const { todaySales, todayPurchases, todayProfit, inventoryValue } = data;
  const profitMargin = todayProfit?.netMargin || 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
      <KPICard
        title="Sales"
        value={todaySales?.total || 0}
        change={todaySales?.changePercent}
        subtitle={`${todaySales?.count || 0} orders`}
        icon="ShoppingCart"
        iconBg="bg-accent/10"
        iconColor="text-accent"
        accentColor="accent"
      />
      <KPICard
        title="Purchases"
        value={todayPurchases?.total || 0}
        subtitle={`${todayPurchases?.count || 0} orders`}
        icon="ShoppingBag"
        iconBg="bg-blue-500/10"
        iconColor="text-blue-500"
        accentColor="blue"
      />
      <KPICard
        title="Profit"
        value={todayProfit?.netProfit || 0}
        change={profitMargin}
        subtitle="Net profit"
        icon="TrendingUp"
        iconBg={profitMargin >= 0 ? 'bg-emerald-500/10' : 'bg-rose-500/10'}
        iconColor={profitMargin >= 0 ? 'text-emerald-500' : 'text-rose-500'}
        accentColor={profitMargin >= 0 ? 'emerald' : 'rose'}
      />
      <KPICard
        title="Inventory"
        value={inventoryValue?.costValue || 0}
        subtitle={`${inventoryValue?.totalUnits || 0} units`}
        icon="Package"
        iconBg="bg-amber-500/10"
        iconColor="text-amber-500"
        accentColor="amber"
      />
    </div>
  );
}

function KPIGridSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="rounded-xl border border-border bg-card p-4 animate-pulse relative overflow-hidden"
        >
          <div className="absolute top-0 inset-x-0 h-1 bg-muted" />
          <div className="flex justify-between mb-3">
            <div className="h-3 w-16 bg-muted rounded" />
            <div className="h-8 w-8 bg-muted rounded-xl" />
          </div>
          <div className="h-7 w-24 bg-muted rounded mb-2" />
          <div className="h-3 w-20 bg-muted rounded" />
        </div>
      ))}
    </div>
  );
}