// src/features/purchases/purchaseTypes.js
// Purchases constants

export const PAYMENT_STATUS = {
  paid: { label: 'Paid', variant: 'success' },
  partial: { label: 'Partial', variant: 'warning' },
  due: { label: 'Due', variant: 'destructive' }
};

export const PURCHASE_STATUS = {
  pending: { label: 'Pending', variant: 'warning' },
  completed: { label: 'Received', variant: 'success' },
  cancelled: { label: 'Cancelled', variant: 'destructive' }
};

export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'bank', label: 'Bank' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'other', label: 'Other' }
];

export const DATE_RANGES = [
  { value: 'today', label: 'Today' },
  { value: '7days', label: 'Last 7 days' },
  { value: '30days', label: 'Last 30 days' },
  { value: 'thisMonth', label: 'This month' },
  { value: 'custom', label: 'Custom range' }
];