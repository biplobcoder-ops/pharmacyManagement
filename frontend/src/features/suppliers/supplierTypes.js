// src/features/suppliers/supplierTypes.js
// Suppliers constants

export const SUPPLIER_STATUS = {
  active: { label: 'Active', variant: 'success' },
  inactive: { label: 'Inactive', variant: 'secondary' }
};

export const DUE_FILTERS = [
  { value: 'all', label: 'All suppliers' },
  { value: 'hasDue', label: 'Has payable' },
  { value: 'noDue', label: 'No payable' }
];