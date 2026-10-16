// src/features/settings/settingsTypes.js
// Settings constants

import {
  Settings, Receipt, Clock, Bell, Percent, Building2, FileText
} from 'lucide-react';

// ✅ Tabs config
export const SETTINGS_TABS = [
  { value: 'general', label: 'General', icon: Settings },
  { value: 'invoice', label: 'Invoice', icon: Receipt },
  { value: 'expiry', label: 'Expiry', icon: Clock },
  { value: 'notification', label: 'Notification', icon: Bell },
  { value: 'business', label: 'Business', icon: Building2 },
  { value: 'tax', label: 'Tax', icon: Percent },
  { value: 'other', label: 'Other', icon: FileText }
];

// ✅ Data type config
export const DATA_TYPES = {
  string: { label: 'Text', input: 'text' },
  number: { label: 'Number', input: 'number' },
  boolean: { label: 'Toggle', input: 'boolean' },
  array: { label: 'List', input: 'array' },
  object: { label: 'Object', input: 'json' }
};

// ✅ Known setting descriptions (helpful for UI)
export const SETTING_META = {
  // General
  currency: {
    label: 'Currency Code',
    description: '3-letter currency code (e.g., BDT, USD)',
    placeholder: 'BDT'
  },
  currency_symbol: {
    label: 'Currency Symbol',
    description: 'Symbol shown with amounts',
    placeholder: '৳'
  },
  timezone: {
    label: 'Timezone',
    description: 'System timezone',
    placeholder: 'Asia/Dhaka'
  },
  date_format: {
    label: 'Date Format',
    description: 'How dates are displayed',
    placeholder: 'DD/MM/YYYY'
  },

  // Invoice
  invoice_prefix: {
    label: 'Sale Invoice Prefix',
    description: 'Prefix for sale invoices (e.g., SL)',
    placeholder: 'SL'
  },
  purchase_prefix: {
    label: 'Purchase Invoice Prefix',
    description: 'Prefix for purchase invoices',
    placeholder: 'PU'
  },
  sales_return_prefix: {
    label: 'Sales Return Prefix',
    description: 'Prefix for sales returns',
    placeholder: 'SR'
  },
  purchase_return_prefix: {
    label: 'Purchase Return Prefix',
    description: 'Prefix for purchase returns',
    placeholder: 'PR'
  },
  invoice_footer: {
    label: 'Invoice Footer',
    description: 'Text shown at bottom of invoices',
    placeholder: 'Thank you for your business!'
  },

  // Expiry
  expiry_threshold_days: {
    label: 'Expiry Alert Days',
    description: 'Alert when medicine expires within X days',
    placeholder: '30'
  },
  auto_expire_batches: {
    label: 'Auto-Expire Batches',
    description: 'Automatically mark expired batches',
    placeholder: 'true'
  },

  // Notification
  low_stock_alert: {
    label: 'Low Stock Alerts',
    description: 'Enable low stock notifications',
    placeholder: 'true'
  },
  expiry_alert: {
    label: 'Expiry Alerts',
    description: 'Enable expiry notifications',
    placeholder: 'true'
  },
  due_alert: {
    label: 'Due Alerts',
    description: 'Enable customer/supplier due notifications',
    placeholder: 'true'
  },

  // Business
  company_name: {
    label: 'Business Name',
    description: 'Your pharmacy name',
    placeholder: 'My Pharmacy'
  },
  company_address: {
    label: 'Business Address',
    description: 'Full address for invoices',
    placeholder: 'Dhanmondi, Dhaka'
  },
  company_phone: {
    label: 'Business Phone',
    description: 'Contact phone number',
    placeholder: '+8801700000000'
  },
  company_email: {
    label: 'Business Email',
    description: 'Contact email',
    placeholder: 'info@pharmacy.com'
  },
  company_website: {
    label: 'Website',
    description: 'Business website URL',
    placeholder: 'https://pharmacy.com'
  },
  tax_id: {
    label: 'Tax ID / VAT Number',
    description: 'Business tax identification',
    placeholder: 'VAT-123456'
  },

  // Tax
  default_tax_rate: {
    label: 'Default Tax Rate',
    description: 'Default tax percentage (%)',
    placeholder: '0'
  },
  tax_included: {
    label: 'Tax Included in Price',
    description: 'Prices include tax by default',
    placeholder: 'false'
  }
};