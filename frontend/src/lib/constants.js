// src/lib/constants.js
// App-wide constants
// ✅ UPDATED: SIDEBAR_ITEMS with requiredPermission

// ===== Sidebar navigation =====
export const SIDEBAR_ITEMS = [
  {
    section: 'WORKSPACE',
    items: [
      {
        label: 'Dashboard',
        icon: 'LayoutDashboard',
        path: '/',
        requiredPermission: null // sob role dekhte parbe
      },
      {
        label: 'Medicines',
        icon: 'Pill',
        path: '/medicines',
        requiredPermission: 'medicine:view'
      },
      {
        label: 'Inventory',
        icon: 'Package',
        path: '/inventory',
        requiredPermission: 'inventory:view'
      },
      {
        label: 'Purchases',
        icon: 'ShoppingBag',
        path: '/purchases',
        requiredPermission: 'purchase:view'
      },
      {
        label: 'Sales / POS',
        icon: 'ShoppingCart',
        path: '/pos',
        requiredPermission: 'sale:create'
      },
      {
        label: 'Sales List',
        icon: 'Receipt',
        path: '/sales',
        requiredPermission: 'sale:view'
      },
      {
        label: 'Customers',
        icon: 'Users',
        path: '/customers',
        requiredPermission: 'customer:view'
      },
      {
        label: 'Suppliers',
        icon: 'Truck',
        path: '/suppliers',
        requiredPermission: 'supplier:view'
      },
      {
        label: 'Returns',
        icon: 'RotateCcw',
        path: '/returns',
        requiredPermission: 'sales-return:view',
        // ✅ OR logic — either sales-return OR purchase-return
        requiredAnyPermission: ['sales-return:view', 'purchase-return:view']
      },
      {
        label: 'Finance',
        icon: 'Wallet',
        path: '/finance',
        requiredPermission: 'payment:view',
        requiredAnyPermission: ['payment:view', 'expense:view']
      },
      {
        label: 'Reports',
        icon: 'BarChart3',
        path: '/reports',
        requiredPermission: 'report:view'
      }
    ]
  },
  {
    section: 'ADMINISTRATION',
    items: [
      {
        label: 'Notifications',
        icon: 'Bell',
        path: '/notifications',
        badge: 'notificationCount',
        requiredPermission: 'notification:view',
        adminOnly: false // permission diye control
      },
      {
        label: 'Users & Roles',
        icon: 'UserCog',
        path: '/users',
        requiredPermission: 'user:view'
      },
      {
        label: 'Audit Logs',
        icon: 'ScrollText',
        path: '/audit-logs',
        requiredPermission: 'audit:view'
      },
      {
        label: 'Settings',
        icon: 'Settings',
        path: '/settings',
        requiredPermission: 'setting:view'
      }
    ]
  }
];

// ===== Payment status colors =====
export const PAYMENT_STATUS = {
  paid: { label: 'Paid', variant: 'success' },
  partial: { label: 'Partial', variant: 'warning' },
  due: { label: 'Due', variant: 'destructive' }
};

// ===== Stock status =====
export const STOCK_STATUS = {
  active: { label: 'In stock', variant: 'success' },
  low: { label: 'Low stock', variant: 'warning' },
  out: { label: 'Out of stock', variant: 'destructive' },
  expiring: { label: 'Expiring soon', variant: 'warning' },
  expired: { label: 'Expired', variant: 'destructive' }
};

// ===== Payment methods =====
export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash', icon: 'Banknote' },
  { value: 'card', label: 'Card', icon: 'CreditCard' },
  { value: 'bank', label: 'Bank', icon: 'Building2' },
  { value: 'mobile', label: 'Mobile', icon: 'Smartphone' },
  { value: 'other', label: 'Other', icon: 'MoreHorizontal' }
];

// ===== Expense categories =====
export const EXPENSE_CATEGORIES = [
  'rent',
  'salary',
  'electricity',
  'water',
  'gas',
  'internet',
  'transport',
  'maintenance',
  'marketing',
  'office',
  'miscellaneous',
  'other'
];

// ===== Pagination =====
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// ===== App info =====
export const APP_NAME = 'PharmaFlow';
export const APP_TAGLINE = 'Business Suite';