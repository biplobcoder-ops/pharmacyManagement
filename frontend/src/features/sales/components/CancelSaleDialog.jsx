import { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function CancelSaleDialog({
  open,
  onOpenChange,
  sale,
  isLoading,
  onConfirm
}) {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    if (reason.trim().length < 3) return;
    onConfirm(reason);
  };

  const handleOpenChange = (o) => {
    if (!o) setReason('');
    onOpenChange(o);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-destructive/10 p-2.5 shrink-0">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <DialogTitle>Cancel sale "{sale?.invoiceNumber}"?</DialogTitle>
              <DialogDescription className="mt-1.5">
                Stock will be restored and customer due will be reversed.
                This cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div>
          <Label htmlFor="cancel-reason">
            Reason for cancellation <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="cancel-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g., Customer changed mind, wrong entry..."
            rows={3}
            className="mt-1.5"
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            Keep sale
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={reason.trim().length < 3 || isLoading}
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            Cancel sale
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}