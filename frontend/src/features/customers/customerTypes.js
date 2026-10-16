// src/features/customers/customerTypes.js
// Customers constants

export const CUSTOMER_STATUS = {
  active: { label: 'Active', variant: 'success' },
  inactive: { label: 'Inactive', variant: 'secondary' }
};

export const DUE_FILTERS = [
  { value: 'all', label: 'All customers' },
  { value: 'hasDue', label: 'Has due balance' },
  { value: 'noDue', label: 'No due balance' }
];