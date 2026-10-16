// src/features/sales/components/SaleViewDialog.jsx
// ✅ FIXED: ৳ → "BDT " in Invoice PDF

import { Loader2, Printer } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDateTime, formatNumber } from '@/lib/utils';
import { PAYMENT_STATUS } from '../salesTypes';
import { useGetSaleByIdQuery } from '../salesApi';

// ✅ PDF Export
import { exportInvoicePDF } from '@/lib/pdfExport';

export default function SaleViewDialog({ open, onOpenChange, saleId, onPrint }) {
  const { data: res, isLoading } = useGetSaleByIdQuery(saleId, {
    skip: !saleId
  });

  const sale = res?.data;

  // ✅ Print Invoice handler — uses exportInvoicePDF
  const handlePrintInvoice = () => {
    if (!sale) {
      toast.error('Sale data not loaded');
      return;
    }

    try {
      const items = (sale.items || []).map((item) => ({
        name: `${item.medicineName || ''}${item.strength ? ` (${item.strength})` : ''}`,
        quantity: item.quantity || 0,
        price: item.sellingPrice || 0,
        total: item.total || 0
      }));

      exportInvoicePDF({
        title: 'Invoice',
        invoice: {
          number: sale.invoiceNumber || '',
          date: sale.saleDate
            ? new Date(sale.saleDate).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })
            : '',
          status: (sale.paymentStatus || '').toUpperCase(),
          subtotal: sale.subtotal || 0,
          discount: sale.discount || 0,
          tax: sale.tax || 0,
          total: sale.total || 0,
          paid: sale.paidAmount || 0,
          due: sale.dueAmount || 0
        },
        items,
        company: {
          name: 'PharmaFlow Pharmacy',
          address: 'Dhanmondi, Dhaka, Bangladesh',
          phone: '+8801700000000',
          email: 'info@pharmaflow.com'
        },
        customer: {
          name: sale.customerName || 'Walk-in Customer',
          phone: sale.customerPhone || ''
        },
        filename: `invoice-${sale.invoiceNumber || 'sale'}`
      });

      toast.success('Invoice PDF downloaded');
      onPrint?.(sale);
    } catch (error) {
      console.error('Print error:', error);
      toast.error('Failed to generate invoice PDF');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between pr-8">
            <div>
              <DialogTitle>Sale details</DialogTitle>
              <DialogDescription>
                {sale && `Invoice ${sale.invoiceNumber}`}
              </DialogDescription>
            </div>
            {sale && (
              <Badge
                variant={PAYMENT_STATUS[sale.paymentStatus]?.variant || 'secondary'}
                className="gap-1.5"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {PAYMENT_STATUS[sale.paymentStatus]?.label || sale.paymentStatus}
              </Badge>
            )}
          </div>
        </DialogHeader>

        {isLoading || !sale ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-5 overflow-y-auto scrollbar-thin pr-1">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Customer</p>
                <p className="text-sm font-medium">{sale.customerName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="text-sm font-medium">{sale.customerPhone || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Date</p>
                <p className="text-sm font-medium">
                  {formatDateTime(sale.saleDate)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Branch</p>
                <p className="text-sm font-medium">{sale.branch?.name || '—'}</p>
              </div>
            </div>

            <div className="rounded-lg border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead className="bg-muted/40">
                    <tr>
                      <th className="text-left text-[10px] font-semibold uppercase text-muted-foreground px-4 py-2">
                        Medicine
                      </th>
                      <th className="text-left text-[10px] font-semibold uppercase text-muted-foreground px-4 py-2">
                        Batch
                      </th>
                      <th className="text-right text-[10px] font-semibold uppercase text-muted-foreground px-4 py-2">
                        Qty
                      </th>
                      <th className="text-right text-[10px] font-semibold uppercase text-muted-foreground px-4 py-2">
                        Price
                      </th>
                      <th className="text-right text-[10px] font-semibold uppercase text-muted-foreground px-4 py-2">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sale.items?.map((item) => (
                      <tr key={item._id} className="border-t border-border">
                        <td className="px-4 py-2.5">
                          <p className="text-sm font-medium">{item.medicineName}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {item.strength}
                          </p>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
                            {item.batchNumber}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-right text-sm tabular-nums">
                          {formatNumber(item.quantity)}
                        </td>
                        <td className="px-4 py-2.5 text-right text-sm tabular-nums">
                          {formatCurrency(item.sellingPrice)}
                        </td>
                        <td className="px-4 py-2.5 text-right text-sm font-medium tabular-nums">
                          {formatCurrency(item.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-lg bg-muted/40 p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="tabular-nums">{formatCurrency(sale.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Discount</span>
                <span className="tabular-nums">-{formatCurrency(sale.discount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span className="tabular-nums">{formatCurrency(sale.tax)}</span>
              </div>
              <div className="flex justify-between text-base font-semibold border-t border-border pt-2">
                <span>Total</span>
                <span className="tabular-nums">{formatCurrency(sale.total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Paid</span>
                <span className="tabular-nums text-success">
                  {formatCurrency(sale.paidAmount)}
                </span>
              </div>
              {sale.dueAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Due</span>
                  <span className="tabular-nums text-warning">
                    {formatCurrency(sale.dueAmount)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handlePrintInvoice}
            disabled={!sale}
          >
            <Printer className="h-4 w-4" />
            Print invoice
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}