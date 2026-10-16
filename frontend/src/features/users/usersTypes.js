// src/features/users/usersTypes.js
// Users constants

import {
  // eslint-disable-next-line no-unused-vars
  User, Users, UserCheck, UserX, Shield, Crown,
  BarChart3, Pill, Wallet, TrendingUp
} from 'lucide-react';

// ===== User Status =====
export const USER_STATUS = {
  active: { label: 'Active', variant: 'success', color: 'text-success' },
  inactive: { label: 'Inactive', variant: 'secondary', color: 'text-muted-foreground' },
  suspended: { label: 'Suspended', variant: 'destructive', color: 'text-destructive' }
};

// ===== Role Icons =====
export const ROLE_ICONS = {
  admin: Crown,
  manager: BarChart3,
  pharmacist: Pill,
  cashier: Wallet,
  accountant: TrendingUp
};

export const ROLE_COLORS = {
  admin: { color: 'text-purple-500', bg: 'bg-purple-500/10' },
  manager: { color: 'text-blue-500', bg: 'bg-blue-500/10' },
  pharmacist: { color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  cashier: { color: 'text-orange-500', bg: 'bg-orange-500/10' },
  accountant: { color: 'text-teal-500', bg: 'bg-teal-500/10' }
};

// ===== Permission Groups (for matrix UI) =====
export const PERMISSION_GROUPS = [
  {
    label: 'User Management',
    icon: Users,
    permissions: [
      { key: 'user:view', label: 'View users' },
      { key: 'user:create', label: 'Create user' },
      { key: 'user:update', label: 'Update user' },
      { key: 'user:delete', label: 'Delete user' }
    ]
  },
  {
    label: 'Role Management',
    icon: Shield,
    permissions: [
      { key: 'role:view', label: 'View roles' },
      { key: 'role:create', label: 'Create role' },
      { key: 'role:update', label: 'Update role' },
      { key: 'role:delete', label: 'Delete role' }
    ]
  },
  {
    label: 'Master Data',
    icon: BarChart3,
    permissions: [
      { key: 'category:view', label: 'View categories' },
      { key: 'category:create', label: 'Create category' },
      { key: 'brand:view', label: 'View brands' },
      { key: 'brand:create', label: 'Create brand' },
      { key: 'generic:view', label: 'View generics' },
      { key: 'unit:view', label: 'View units' }
    ]
  },
  {
    label: 'Medicine & Batch',
    icon: Pill,
    permissions: [
      { key: 'medicine:view', label: 'View medicines' },
      { key: 'medicine:create', label: 'Create medicine' },
      { key: 'medicine:update', label: 'Update medicine' },
      { key: 'medicine:delete', label: 'Delete medicine' },
      { key: 'batch:view', label: 'View batches' },
      { key: 'batch:create', label: 'Create batch' }
    ]
  },
  {
    label: 'Inventory',
    icon: BarChart3,
    permissions: [
      { key: 'inventory:view', label: 'View inventory' },
      { key: 'inventory:adjust', label: 'Adjust stock' },
      { key: 'stock:view', label: 'View stock movements' }
    ]
  },
  {
    label: 'Sales',
    icon: Wallet,
    permissions: [
      { key: 'sale:view', label: 'View sales' },
      { key: 'sale:create', label: 'Create sale' },
      { key: 'sale:approve', label: 'Approve sale' },
      { key: 'sales-return:view', label: 'View sales returns' },
      { key: 'sales-return:create', label: 'Create sales return' }
    ]
  },
  {
    label: 'Purchase',
    icon: Wallet,
    permissions: [
      { key: 'purchase:view', label: 'View purchases' },
      { key: 'purchase:create', label: 'Create purchase' },
      { key: 'purchase:approve', label: 'Approve purchase' },
      { key: 'purchase-return:view', label: 'View purchase returns' }
    ]
  },
  {
    label: 'Customer',
    icon: Users,
    permissions: [
      { key: 'customer:view', label: 'View customers' },
      { key: 'customer:create', label: 'Create customer' },
      { key: 'customer:update', label: 'Update customer' },
      { key: 'customer:delete', label: 'Delete customer' }
    ]
  },
  {
    label: 'Supplier',
    icon: Users,
    permissions: [
      { key: 'supplier:view', label: 'View suppliers' },
      { key: 'supplier:create', label: 'Create supplier' },
      { key: 'supplier:update', label: 'Update supplier' },
      { key: 'supplier:delete', label: 'Delete supplier' }
    ]
  },
  {
    label: 'Payment',
    icon: Wallet,
    permissions: [
      { key: 'payment:view', label: 'View payments' },
      { key: 'payment:create', label: 'Create payment' },
      { key: 'payment:delete', label: 'Delete payment' }
    ]
  },
  {
    label: 'Expense',
    icon: Wallet,
    permissions: [
      { key: 'expense:view', label: 'View expenses' },
      { key: 'expense:create', label: 'Create expense' },
      { key: 'expense:update', label: 'Update expense' },
      { key: 'expense:delete', label: 'Delete expense' }
    ]
  },
  {
    label: 'Reports',
    icon: BarChart3,
    permissions: [
      { key: 'report:view', label: 'View reports' },
      { key: 'report:export', label: 'Export reports' }
    ]
  },
  {
    label: 'Administration',
    icon: Shield,
    permissions: [
      { key: 'notification:view', label: 'View notifications' },
      { key: 'audit:view', label: 'View audit logs' },
      { key: 'setting:view', label: 'View settings' },
      { key: 'setting:update', label: 'Update settings' }
    ]
  }
];

// ===== Role Default Permissions (for comparison) =====
// Kono role er default permission list — fallback
export const ROLE_DEFAULTS = {
  admin: ['*'],
  manager: [
    'user:view', 'role:view',
    'category:view', 'category:create', 'category:update', 'category:delete',
    'brand:view', 'brand:create', 'brand:update', 'brand:delete',
    'generic:view', 'generic:create', 'generic:update', 'generic:delete',
    'unit:view', 'unit:create', 'unit:update', 'unit:delete',
    'organization:view', 'branch:view', 'branch:create', 'branch:update',
    'medicine:view', 'medicine:create', 'medicine:update', 'medicine:delete',
    'batch:view', 'batch:create', 'batch:update', 'batch:delete',
    'inventory:view', 'inventory:adjust', 'stock:view',
    'supplier:view', 'supplier:create', 'supplier:update', 'supplier:delete',
    'purchase:view', 'purchase:create', 'purchase:update', 'purchase:approve',
    'purchase-return:view', 'purchase-return:create', 'purchase-return:approve',
    'customer:view', 'customer:create', 'customer:update', 'customer:delete',
    'sale:view', 'sale:create', 'sale:approve',
    'sales-return:view', 'sales-return:create', 'sales-return:approve',
    'payment:view', 'payment:create', 'payment:delete',
    'expense:view', 'expense:create', 'expense:update',
    'report:view', 'report:export',
    'notification:view', 'audit:view', 'setting:view'
  ],
  pharmacist: [
    'category:view', 'brand:view', 'generic:view', 'unit:view',
    'organization:view', 'branch:view',
    'medicine:view', 'medicine:create', 'medicine:update',
    'batch:view', 'batch:create', 'batch:update',
    'inventory:view', 'inventory:adjust', 'stock:view',
    'supplier:view', 'purchase:view', 'purchase-return:view',
    'customer:view', 'sale:view', 'sales-return:view',
    'notification:view'
  ],
  cashier: [
    'medicine:view', 'batch:view', 'inventory:view',
    'customer:view', 'customer:create',
    'sale:view', 'sale:create',
    'sales-return:view', 'sales-return:create',
    'payment:view', 'payment:create',
    'notification:view'
  ],
  accountant: [
    'category:view', 'brand:view', 'generic:view', 'unit:view',
    'medicine:view', 'batch:view',
    'inventory:view', 'stock:view',
    'supplier:view', 'purchase:view', 'purchase-return:view',
    'customer:view', 'sale:view', 'sales-return:view',
    'payment:view', 'payment:create',
    'expense:view', 'expense:create', 'expense:update', 'expense:delete',
    'report:view', 'report:export',
    'notification:view', 'audit:view'
  ]
};