// src/features/pos/components/SaleSuccessDialog.jsx
// ✅ Sale success dialog — professional POS UX

import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2, Printer, Plus, FileText,
} from 'lucide-react';
import {
  Dialog, DialogContent
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn, formatCurrency } from '@/lib/utils';
import { exportInvoicePDF } from '@/lib/pdfExport';

export default function SaleSuccessDialog({
  open,
  onOpenChange,
  sale,
  onNewSale
}) {
  const navigate = useNavigate();

  if (!sale) return null;

  const handlePrint = () => {
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
          date: new Date(sale.saleDate || Date.now()).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          }),
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
    } catch (error) {
      console.error('Print error:', error);
    }
  };

  const handleNewSale = () => {
    onOpenChange(false);
    onNewSale?.();
  };

  const handleViewSale = () => {
    onOpenChange(false);
    navigate('/sales');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden">

        {/* Success Header */}
        <div className="relative p-6 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-b border-emerald-500/20">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-7 w-7 text-emerald-500" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-foreground">
                Sale Completed!
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {sale.invoiceNumber}
              </p>
            </div>
            <Badge
              variant={
                sale.paymentStatus === 'paid'
                  ? 'success'
                  : sale.paymentStatus === 'partial'
                  ? 'warning'
                  : 'destructive'
              }
              className="gap-1 shrink-0"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {(sale.paymentStatus || '').toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Details */}
        <div className="p-6 space-y-4">
          {/* Amount */}
          <div className="text-center py-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              Total Amount
            </p>
            <p className="text-4xl font-bold text-emerald-500 tabular-nums">
              {formatCurrency(sale.total || 0)}
            </p>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-3 gap-3">
            <InfoBox
              label="Customer"
              value={sale.customerName || 'Walk-in'}
            />
            <InfoBox
              label="Paid"
              value={formatCurrency(sale.paidAmount || 0)}
              valueClass="text-emerald-500"
            />
            <InfoBox
              label="Due"
              value={formatCurrency(sale.dueAmount || 0)}
              valueClass={
                sale.dueAmount > 0 ? 'text-destructive' : 'text-muted-foreground'
              }
            />
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-border bg-muted/20 grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="flex-col h-auto py-3 gap-1.5"
          >
            <Printer className="h-4 w-4" />
            <span className="text-[10px] font-medium">Print</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleViewSale}
            className="flex-col h-auto py-3 gap-1.5"
          >
            <FileText className="h-4 w-4" />
            <span className="text-[10px] font-medium">View Sale</span>
          </Button>

          <Button
            size="sm"
            onClick={handleNewSale}
            className={cn(
              'flex-col h-auto py-3 gap-1.5',
              'bg-emerald-600 hover:bg-emerald-700 text-white'
            )}
          >
            <Plus className="h-4 w-4" />
            <span className="text-[10px] font-medium">New Sale</span>
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
}

// ===== Info Box Helper =====
function InfoBox({ label, value, valueClass }) {
  return (
    <div className="rounded-lg border border-border bg-card p-2.5 text-center">
      <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className={cn('text-xs font-semibold truncate', valueClass || 'text-foreground')}>
        {value}
      </p>
    </div>
  );
}