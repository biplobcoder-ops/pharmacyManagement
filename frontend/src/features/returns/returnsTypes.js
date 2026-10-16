// src/features/returns/returnsTypes.js
// Returns constants

export const RETURN_STATUS = {
  completed: { label: 'Completed', variant: 'success' },
  pending: { label: 'Pending', variant: 'warning' },
  cancelled: { label: 'Cancelled', variant: 'destructive' }
};

export const REFUND_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'bank', label: 'Bank' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'other', label: 'Other' },
  { value: 'credit', label: 'Credit (Due adjustment)' }
];

export const DATE_RANGES = [
  { value: 'today', label: 'Today' },
  { value: 'thisWeek', label: 'This week' },
  { value: 'thisMonth', label: 'This month' },
  { value: 'last30days', label: 'Last 30 days' },
  { value: 'custom', label: 'Custom range' }
];