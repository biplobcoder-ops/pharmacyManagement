// src/features/audit-logs/auditLogsTypes.js
// Audit Logs constants

import {
  LogIn, LogOut, Plus, Edit, Trash2, Check, XCircle,
  Sliders, DollarSign, RotateCcw, Shield, Settings
} from 'lucide-react';

// ✅ Action config — icon, color, label
export const ACTION_CONFIG = {
  login: {
    label: 'Login',
    icon: LogIn,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    badge: 'info'
  },
  logout: {
    label: 'Logout',
    icon: LogOut,
    color: 'text-muted-foreground',
    bg: 'bg-muted',
    badge: 'secondary'
  },
  create: {
    label: 'Create',
    icon: Plus,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    badge: 'success'
  },
  update: {
    label: 'Update',
    icon: Edit,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    badge: 'warning'
  },
  delete: {
    label: 'Delete',
    icon: Trash2,
    color: 'text-destructive',
    bg: 'bg-destructive/10',
    badge: 'destructive'
  },
  approve: {
    label: 'Approve',
    icon: Check,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    badge: 'success'
  },
  cancel: {
    label: 'Cancel',
    icon: XCircle,
    color: 'text-destructive',
    bg: 'bg-destructive/10',
    badge: 'destructive'
  },
  adjust: {
    label: 'Adjust',
    icon: Sliders,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
    badge: 'info'
  },
  payment: {
    label: 'Payment',
    icon: DollarSign,
    color: 'text-success',
    bg: 'bg-success/10',
    badge: 'success'
  },
  return: {
    label: 'Return',
    icon: RotateCcw,
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
    badge: 'warning'
  },
  permission_change: {
    label: 'Permission Change',
    icon: Shield,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
    badge: 'info'
  },
  setting_change: {
    label: 'Setting Change',
    icon: Settings,
    color: 'text-cyan-500',
    bg: 'bg-cyan-500/10',
    badge: 'info'
  }
};

// ✅ Filter options
export const ACTION_OPTIONS = [
  { value: 'all', label: 'All actions' },
  ...Object.entries(ACTION_CONFIG).map(([value, cfg]) => ({
    value,
    label: cfg.label
  }))
];

export const MODULE_OPTIONS = [
  { value: 'all', label: 'All modules' },
  { value: 'Auth', label: 'Auth' },
  { value: 'User', label: 'User' },
  { value: 'Role', label: 'Role' },
  { value: 'Category', label: 'Category' },
  { value: 'Brand', label: 'Brand' },
  { value: 'Generic', label: 'Generic' },
  { value: 'Unit', label: 'Unit' },
  { value: 'Medicine', label: 'Medicine' },
  { value: 'Batch', label: 'Batch' },
  { value: 'Supplier', label: 'Supplier' },
  { value: 'Purchase', label: 'Purchase' },
  { value: 'Customer', label: 'Customer' },
  { value: 'Sale', label: 'Sale' },
  { value: 'Payment', label: 'Payment' },
  { value: 'Expense', label: 'Expense' },
  { value: 'Setting', label: 'Setting' }
];

export const DATE_RANGES = [
  { value: 'today', label: 'Today' },
  { value: 'last7days', label: 'Last 7 days' },
  { value: 'last30days', label: 'Last 30 days' },
  { value: 'thisMonth', label: 'This month' },
  { value: 'custom', label: 'Custom range' }
];

// ✅ Reference type → route mapping
export const REFERENCE_ROUTES = {
  User: '/users',
  Role: '/users',
  Medicine: '/medicines',
  Batch: '/inventory',
  Supplier: '/suppliers',
  Purchase: '/purchases',
  Customer: '/customers',
  Sale: '/sales',
  Payment: '/finance'
};