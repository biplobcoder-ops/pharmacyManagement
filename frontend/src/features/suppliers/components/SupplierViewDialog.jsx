import { Loader2, Phone, Mail, MapPin, User, FileText } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  useGetSupplierByIdQuery,
  useGetSupplierPurchasesQuery
} from '../supplierApi';

export default function SupplierViewDialog({ open, onOpenChange, supplierId }) {
  const { data: res, isLoading } = useGetSupplierByIdQuery(supplierId, {
    skip: !supplierId
  });
  const { data: purchasesRes } = useGetSupplierPurchasesQuery(
    { supplierId, limit: 10 },
    { skip: !supplierId }
  );

  const supplier = res?.data;
  const purchases = purchasesRes?.data?.purchases || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Supplier details</DialogTitle>
          <DialogDescription>
            Full profile and purchase history
          </DialogDescription>
        </DialogHeader>

        {isLoading || !supplier ? (
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
                    {supplier.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-foreground">
                    {supplier.name}
                  </h3>
                  {supplier.company && (
                    <p className="text-sm text-muted-foreground">
                      {supplier.company}
                    </p>
                  )}
                  <Badge
                    variant={supplier.status === 'active' ? 'success' : 'secondary'}
                    className="gap-1.5 mt-1"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {supplier.status === 'active' ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-border">
                {supplier.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{supplier.phone}</span>
                  </div>
                )}
                {supplier.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="truncate">{supplier.email}</span>
                  </div>
                )}
                {supplier.address && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="truncate">{supplier.address}</span>
                  </div>
                )}
                {supplier.contactPerson && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{supplier.contactPerson}</span>
                  </div>
                )}
                {supplier.tradeLicense && (
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Trade: {supplier.tradeLicense}</span>
                  </div>
                )}
                {supplier.taxId && (
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Tax: {supplier.taxId}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Financial summary */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-muted/40 p-3 text-center">
                <p className="text-xs text-muted-foreground">Total Purchases</p>
                <p className="text-lg font-bold tabular-nums mt-1">
                  {formatCurrency(supplier.totalPurchase || 0)}
                </p>
              </div>
              <div className="rounded-lg bg-success/10 p-3 text-center">
                <p className="text-xs text-success">Paid</p>
                <p className="text-lg font-bold tabular-nums mt-1 text-success">
                  {formatCurrency(supplier.totalPaid || 0)}
                </p>
              </div>
              <div className="rounded-lg bg-warning/10 p-3 text-center">
                <p className="text-xs text-warning">Payable</p>
                <p className="text-lg font-bold tabular-nums mt-1 text-warning">
                  {formatCurrency(supplier.dueBalance || 0)}
                </p>
              </div>
            </div>

            {/* Recent purchases */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">
                Recent Purchases ({purchases.length})
              </h4>
              {purchases.length === 0 ? (
                <div className="text-center py-6 text-sm text-muted-foreground">
                  No purchases yet
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
                          <th className="text-right text-[10px] font-semibold uppercase text-muted-foreground px-4 py-2">
                            Due
                          </th>
                          <th className="text-left text-[10px] font-semibold uppercase text-muted-foreground px-4 py-2">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {purchases.map((p) => (
                          <tr key={p._id} className="border-t border-border">
                            <td className="px-4 py-2 text-xs font-medium">
                              {p.invoiceNumber}
                            </td>
                            <td className="px-4 py-2 text-xs text-muted-foreground">
                              {formatDate(p.purchaseDate)}
                            </td>
                            <td className="px-4 py-2 text-xs text-right tabular-nums">
                              {formatCurrency(p.total)}
                            </td>
                            <td className="px-4 py-2 text-xs text-right tabular-nums text-warning">
                              {formatCurrency(p.dueAmount || 0)}
                            </td>
                            <td className="px-4 py-2">
                              <Badge
                                variant={
                                  p.paymentStatus === 'paid'
                                    ? 'success'
                                    : p.paymentStatus === 'partial'
                                    ? 'warning'
                                    : 'destructive'
                                }
                                className="text-[10px]"
                              >
                                {p.paymentStatus}
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