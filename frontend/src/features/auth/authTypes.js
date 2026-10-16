// src/features/auth/authTypes.js
// Role configuration — icon, color, description, redirect

import { Crown, BarChart3, Pill, Wallet, TrendingUp } from 'lucide-react';

export const ROLES_CONFIG = {
  admin: {
    value: 'admin',
    label: 'Admin',
    title: 'Administrator',
    description: 'Full system access',
    icon: Crown,
    // Colors
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    hoverBorder: 'hover:border-purple-500',
    gradient: 'from-purple-500 to-purple-600',
    buttonBg: 'bg-purple-600 hover:bg-purple-700',
    // Features
    features: [
      'User & role management',
      'All reports access',
      'System settings',
      'Audit logs'
    ],
    // Redirect after login
    redirect: '/',
    // Demo credentials
    demo: {
      email: 'admin@pharmacy.com',
      password: 'Admin@123'
    }
  },

  manager: {
    value: 'manager',
    label: 'Manager',
    title: 'Branch Manager',
    description: 'Branch management',
    icon: BarChart3,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    hoverBorder: 'hover:border-blue-500',
    gradient: 'from-blue-500 to-blue-600',
    buttonBg: 'bg-blue-600 hover:bg-blue-700',
    features: [
      'Branch operations',
      'Purchases & suppliers',
      'Inventory management',
      'Reports access'
    ],
    redirect: '/',
    demo: {
      email: 'manager@pharmacy.com',
      password: 'Manager@123'
    }
  },

  pharmacist: {
    value: 'pharmacist',
    label: 'Pharmacist',
    title: 'Pharmacist',
    description: 'Medicine & prescription',
    icon: Pill,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    hoverBorder: 'hover:border-emerald-500',
    gradient: 'from-emerald-500 to-emerald-600',
    buttonBg: 'bg-emerald-600 hover:bg-emerald-700',
    features: [
      'Medicine management',
      'Batch & inventory',
      'Prescription handling',
      'Stock adjustments'
    ],
    redirect: '/medicines',
    demo: {
      email: 'pharmacist@pharmacy.com',
      password: 'Pharmacist@123'
    }
  },

  cashier: {
    value: 'cashier',
    label: 'Cashier',
    title: 'Cashier',
    description: 'Sales & customer',
    icon: Wallet,
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    hoverBorder: 'hover:border-orange-500',
    gradient: 'from-orange-500 to-orange-600',
    buttonBg: 'bg-orange-600 hover:bg-orange-700',
    features: [
      'Point of Sale (POS)',
      'Customer management',
      'Payment collection',
      'Sales returns'
    ],
    redirect: '/pos',
    demo: {
      email: 'cashier@pharmacy.com',
      password: 'Cashier@123'
    }
  },

  accountant: {
    value: 'accountant',
    label: 'Accountant',
    title: 'Accountant',
    description: 'Finance & reports',
    icon: TrendingUp,
    color: 'text-teal-500',
    bg: 'bg-teal-500/10',
    border: 'border-teal-500/30',
    hoverBorder: 'hover:border-teal-500',
    gradient: 'from-teal-500 to-teal-600',
    buttonBg: 'bg-teal-600 hover:bg-teal-700',
    features: [
      'Finance tracking',
      'Expense management',
      'Financial reports',
      'Payment tracking'
    ],
    redirect: '/finance',
    demo: {
      email: 'accountant@pharmacy.com',
      password: 'Accountant@123'
    }
  }
};

// Ordered array for grid display
export const ROLES_LIST = [
  ROLES_CONFIG.admin,
  ROLES_CONFIG.manager,
  ROLES_CONFIG.pharmacist,
  ROLES_CONFIG.cashier,
  ROLES_CONFIG.accountant
];

// Get role config by value
export const getRoleConfig = (roleValue) =>
  ROLES_CONFIG[roleValue] || ROLES_CONFIG.admin;