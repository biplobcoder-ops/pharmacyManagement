import { Loader2, Phone, Mail, MapPin, Calendar} from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import {
  useGetCustomerByIdQuery,
  useGetCustomerSalesQuery
} from '../customerApi';

export default function CustomerViewDialog({ open, onOpenChange, customerId }) {
  const { data: res, isLoading } = useGetCustomerByIdQuery(customerId, {
    skip: !customerId
  });
  const { data: salesRes } = useGetCustomerSalesQuery(
    { customerId, limit: 10 },
    { skip: !customerId }
  );

  const customer = res?.data;
  const sales = salesRes?.data?.sales || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Customer details</DialogTitle>
          <DialogDescription>Full profile and transaction history</DialogDescription>
        </DialogHeader>

        {isLoading || !customer ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-5 overflow-y-auto scrollbar-thin pr-1">
            {/* Profile */}
            <div className="rounded-lg border border-border p-4 space-y-3">
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                  <span className="text-2xl font-bold text-accent">
                    {customer.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-foreground">
                    {customer.name}
                  </h3>
                  <Badge
                    variant={customer.status === 'active' ? 'success' : 'secondary'}
                    className="gap-1.5 mt-1"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {customer.status === 'active' ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-border">
                {customer.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{customer.phone}</span>
                  </div>
                )}
                {customer.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="truncate">{customer.email}</span>
                  </div>
                )}
                {customer.address && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="truncate">{customer.address}</span>
                  </div>
                )}
                {customer.createdAt && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Joined {formatDate(customer.createdAt)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Financial summary */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-muted/40 p-3 text-center">
                <p className="text-xs text-muted-foreground">Total Purchases</p>
                <p className="text-lg font-bold tabular-nums mt-1">
                  {formatCurrency(customer.totalPurchase || 0)}
                </p>
              </div>
              <div className="rounded-lg bg-success/10 p-3 text-center">
                <p className="text-xs text-success">Paid</p>
                <p className="text-lg font-bold tabular-nums mt-1 text-success">
                  {formatCurrency(customer.totalPaid || 0)}
                </p>
              </div>
              <div className="rounded-lg bg-warning/10 p-3 text-center">
                <p className="text-xs text-warning">Due Balance</p>
                <p className="text-lg font-bold tabular-nums mt-1 text-warning">
                  {formatCurrency(customer.dueBalance || 0)}
                </p>
              </div>
            </div>

            {/* Recent sales */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">
                Recent Sales ({sales.length})
              </h4>
              {sales.length === 0 ? (
                <div className="text-center py-6 text-sm text-muted-foreground">
                  No sales yet
                </div>
              ) : (
                <div className="rounded-lg border border-border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[500px]">
                      <thead className="bg-muted/40">
                        <tr>
                          <th className="text-left text-[10px] font-semibold uppercase text-muted-foreground px-4 py-2">
                            Invoice
                          </th>
                          <th className="text-left text-[10px] font-semibold uppercase text-muted-foreground px-4 py-2">
                            Date
                          </th>
                          <th className="text-right text-[10px] font-semibold uppercase text-muted-foreground px-4 py-2">
                            Total
                          </th>
                          <th className="text-left text-[10px] font-semibold uppercase text-muted-foreground px-4 py-2">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {sales.map((sale) => (
                          <tr key={sale._id} className="border-t border-border">
                            <td className="px-4 py-2 text-xs font-medium">
                              {sale.invoiceNumber}
                            </td>
                            <td className="px-4 py-2 text-xs text-muted-foreground">
                              {formatDateTime(sale.saleDate)}
                            </td>
                            <td className="px-4 py-2 text-xs text-right tabular-nums">
                              {formatCurrency(sale.total)}
                            </td>
                            <td className="px-4 py-2">
                              <Badge
                                variant={
                                  sale.paymentStatus === 'paid'
                                    ? 'success'
                                    : sale.paymentStatus === 'partial'
                                    ? 'warning'
                                    : 'destructive'
                                }
                                className="text-[10px]"
                              >
                                {sale.paymentStatus}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}