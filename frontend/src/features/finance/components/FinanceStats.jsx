import { TrendingUp, TrendingDown, Users, Truck, DollarSign } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn, formatCurrency } from '@/lib/utils';

export default function FinanceStats({ stats, isLoading }) {
  const netIncome = stats?.netIncome || 0;
  const isLoss = netIncome < 0;
  const periodLabel = stats?.periodLabel || 'Last month';

  const items = [
    {
      label: 'Net Income',
      value: netIncome,
      subtitle: periodLabel,
      // ✅ Loss hole TrendingDown + red
      icon: isLoss ? TrendingDown : TrendingUp,
      color: isLoss ? 'text-destructive' : 'text-success',
      bg: isLoss ? 'bg-destructive/10' : 'bg-success/10',
      valueClass: isLoss ? 'text-destructive' : 'text-foreground'
    },
    {
      label: 'Customer Due',
      value: stats?.customerDue || 0,
      subtitle: `${stats?.customerDueCount || 0} customers`,
      icon: Users,
      color: 'text-warning',
      bg: 'bg-warning/10',
      valueClass: 'text-foreground'
    },
    {
      label: 'Supplier Due',
      value: stats?.supplierDue || 0,
      subtitle: `${stats?.supplierDueCount || 0} suppliers`,
      icon: Truck,
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
      valueClass: 'text-foreground'
    },
    {
      label: 'Total Expenses',
      value: stats?.totalExpenses || 0,
      subtitle: `${stats?.expenseCount || 0} entries • ${periodLabel}`,
      icon: DollarSign,
      color: 'text-destructive',
      bg: 'bg-destructive/10',
      valueClass: 'text-foreground'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.label}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <div className={cn('rounded-lg p-2', item.bg)}>
                  <Icon className={cn('h-4 w-4', item.color)} />
                </div>
              </div>
              <p
                className={cn(
                  'text-2xl lg:text-3xl font-bold tabular-nums',
                  item.valueClass
                )}
              >
                {isLoading ? '—' : formatCurrency(item.value)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{item.subtitle}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}