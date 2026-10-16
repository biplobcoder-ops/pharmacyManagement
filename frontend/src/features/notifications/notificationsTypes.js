// src/features/notifications/notificationsTypes.js
// Notifications constants

import {
  Package, Clock, XCircle, Users, Truck, Info, ShoppingCart, ShoppingBag
} from 'lucide-react';

export const NOTIFICATION_TYPES = {
  low_stock: {
    label: 'Low Stock',
    icon: Package,
    color: 'text-warning',
    bg: 'bg-warning/10',
    badge: 'warning'
  },
  expiring_soon: {
    label: 'Expiring Soon',
    icon: Clock,
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
    badge: 'warning'
  },
  expired: {
    label: 'Expired',
    icon: XCircle,
    color: 'text-destructive',
    bg: 'bg-destructive/10',
    badge: 'destructive'
  },
  customer_due: {
    label: 'Customer Due',
    icon: Users,
    color: 'text-warning',
    bg: 'bg-warning/10',
    badge: 'warning'
  },
  supplier_due: {
    label: 'Supplier Due',
    icon: Truck,
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
    badge: 'warning'
  },
  system: {
    label: 'System',
    icon: Info,
    color: 'text-accent',
    bg: 'bg-accent/10',
    badge: 'info'
  },
  sale: {
    label: 'Sale',
    icon: ShoppingCart,
    color: 'text-success',
    bg: 'bg-success/10',
    badge: 'success'
  },
  purchase: {
    label: 'Purchase',
    icon: ShoppingBag,
    color: 'text-accent',
    bg: 'bg-accent/10',
    badge: 'info'
  }
};

export const PRIORITY_CONFIG = {
  low: { label: 'Low', variant: 'secondary' },
  medium: { label: 'Medium', variant: 'info' },
  high: { label: 'High', variant: 'destructive' }
};

// Filter dropdown options
export const TYPE_OPTIONS = [
  { value: 'all', label: 'All types' },
  ...Object.entries(NOTIFICATION_TYPES).map(([value, cfg]) => ({
    value,
    label: cfg.label
  }))
];

export const PRIORITY_OPTIONS = [
  { value: 'all', label: 'All priorities' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' }
];

export const READ_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
  { value: 'read', label: 'Read' }
];

// ✅ Reference type → route mapping (click to navigate)
export const REFERENCE_ROUTES = {
  Medicine: '/medicines',
  Batch: '/inventory',
  Customer: '/customers',
  Supplier: '/suppliers',
  Sale: '/sales',
  Purchase: '/purchases'
};