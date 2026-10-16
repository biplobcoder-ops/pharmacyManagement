// src/features/reports/components/ReportChart.jsx

import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatCompact, formatCurrency } from '@/lib/utils';

export default function ReportChart({
  title, description, data = [], type = 'line',
  xKey = 'label', series = [], isLoading, height = 300
}) {
  const Chart = type === 'bar' ? BarChart : LineChart;

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <CardDescription className="text-xs">{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="bg-muted/40 rounded-lg animate-pulse" style={{ height }} />
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center text-sm text-muted-foreground" style={{ height }}>
            No data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={height}>
            <Chart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey={xKey} stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis
                stroke="hsl(var(--muted-foreground))" fontSize={11}
                tickLine={false} axisLine={false}
                tickFormatter={(v) => `৳${formatCompact(v)}`} width={55}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px', fontSize: '12px'
                }}
                formatter={(value) => formatCurrency(value)}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} iconType="circle" iconSize={8} />
              {series.map((s) => type === 'bar' ? (
                <Bar key={s.key} dataKey={s.key} name={s.name} fill={s.color || 'hsl(var(--accent))'} radius={[4, 4, 0, 0]} />
              ) : (
                <Line
                  key={s.key} type="monotone" dataKey={s.key} name={s.name}
                  stroke={s.color || 'hsl(var(--accent))'} strokeWidth={2.5}
                  strokeDasharray={s.dashed ? '4 4' : undefined}
                  dot={false} activeDot={{ r: 5 }}
                />
              ))}
            </Chart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}