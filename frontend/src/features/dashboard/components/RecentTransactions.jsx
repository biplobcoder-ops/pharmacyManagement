/* eslint-disable react-hooks/purity */
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import StatusBadge from '@/components/common/StatusBadge';
import { formatCurrency, formatTime } from '@/lib/utils';

export default function RecentTransactions({ data, isLoading }) {
  const transactions = data?.recentTransactions || [];

  // Fallback demo
  const displayData = transactions.length > 0
    ? transactions
    : [
        { _id: '1', invoiceNumber: 'SL-4829', customerName: 'Walk-in customer', total: 2840, paymentStatus: 'paid', createdAt: new Date(Date.now() - 5 * 60000) },
        { _id: '2', invoiceNumber: 'SL-4828', customerName: 'Md. Hasan', total: 1260, paymentStatus: 'partial', createdAt: new Date(Date.now() - 15 * 60000) },
        { _id: '3', invoiceNumber: 'SL-4827', customerName: 'Nusrat Jahan', total: 3520, paymentStatus: 'paid', createdAt: new Date(Date.now() - 30 * 60000) },
        { _id: '4', invoiceNumber: 'SL-4826', customerName: 'Walk-in customer', total: 780, paymentStatus: 'paid', createdAt: new Date(Date.now() - 45 * 60000) }
      ];

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-base">Recent transactions</CardTitle>
          <CardDescription className="text-xs">Latest sales from this branch</CardDescription>
        </div>
        <Link
          to="/pos/history"
          className="text-xs font-medium text-accent hover:underline flex items-center gap-1"
        >
          View all
          <ArrowRight className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-muted/40 rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-6 py-3">
                    Invoice
                  </th>
                  <th className="text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-6 py-3">
                    Customer
                  </th>
                  <th className="text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-6 py-3">
                    Amount
                  </th>
                  <th className="text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-6 py-3">
                    Status
                  </th>
                  <th className="text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-6 py-3">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody>
                {displayData.map((t) => (
                  <tr
                    key={t._id}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-6 py-3 text-sm font-medium text-foreground">
                      {t.invoiceNumber}
                    </td>
                    <td className="px-6 py-3 text-sm text-muted-foreground truncate max-w-[200px]">
                      {t.customerName}
                    </td>
                    <td className="px-6 py-3 text-sm font-semibold text-foreground text-right tabular-nums">
                      {formatCurrency(t.total)}
                    </td>
                    <td className="px-6 py-3">
                      <StatusBadge status={t.paymentStatus} />
                    </td>
                    <td className="px-6 py-3 text-xs text-muted-foreground text-right tabular-nums">
                      {formatTime(t.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}