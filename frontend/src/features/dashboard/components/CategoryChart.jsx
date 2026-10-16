import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { MoreHorizontal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';

const COLORS = [
  'hsl(var(--accent))',
  'hsl(217 91% 70%)',
  'hsl(262 83% 68%)',
  'hsl(199 89% 58%)',
  'hsl(38 92% 60%)',
  'hsl(0 84% 70%)'
];

export default function CategoryChart({ data, isLoading }) {
  const categories = data?.salesByCategory || [];

  // Fallback demo data
  const chartData = categories.length > 0
    ? categories.slice(0, 5).map((c) => ({
        name: c._id || 'Others',
        value: c.total || 0,
        quantity: c.quantity || 0
      }))
    : [
        { name: 'Prescription', value: 36000 },
        { name: 'OTC Medicine', value: 23000 },
        { name: 'Personal Care', value: 15000 },
        { name: 'Baby Care', value: 8000 },
        { name: 'Others', value: 4400 }
      ];

  const total = chartData.reduce((sum, c) => sum + c.value, 0);

  return (
    <Card className="h-full">
      <CardHeader className="flex-row items-start justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-base">Sales by category</CardTitle>
          <CardDescription className="text-xs">Today's contribution</CardDescription>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-64 bg-muted/40 rounded-lg animate-pulse" />
        ) : (
          <>
            <div className="relative">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                    formatter={(value) => formatCurrency(value)}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Center label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-lg font-bold text-foreground tabular-nums">
                  {formatCurrency(total, '৳')}
                </p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  Total sales
                </p>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-4 space-y-2">
              {chartData.map((cat, i) => {
                const percent = total > 0 ? ((cat.value / total) * 100).toFixed(0) : 0;
                return (
                  <div key={cat.name} className="flex items-center gap-3 text-xs">
                    <div
                      className="h-2.5 w-2.5 rounded-sm shrink-0"
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    />
                    <span className="flex-1 text-foreground truncate">{cat.name}</span>
                    <span className="font-medium text-muted-foreground tabular-nums">
                      {percent}%
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}