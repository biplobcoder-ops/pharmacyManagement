// src/constants/permissions.js
// Permission strings — "module:action" format

const PERMISSIONS = {
  // ===== Phase 1 =====
  // User
  USER_VIEW: 'user:view',
  USER_CREATE: 'user:create',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  USER_MANAGE: 'user:manage',

  // Role
  ROLE_VIEW: 'role:view',
  ROLE_CREATE: 'role:create',
  ROLE_UPDATE: 'role:update',
  ROLE_DELETE: 'role:delete',
  ROLE_MANAGE: 'role:manage',

  // ===== Phase 2 — Master Data =====
  // Category
  CATEGORY_VIEW: 'category:view',
  CATEGORY_CREATE: 'category:create',
  CATEGORY_UPDATE: 'category:update',
  CATEGORY_DELETE: 'category:delete',

  // Brand
  BRAND_VIEW: 'brand:view',
  BRAND_CREATE: 'brand:create',
  BRAND_UPDATE: 'brand:update',
  BRAND_DELETE: 'brand:delete',

  // Generic
  GENERIC_VIEW: 'generic:view',
  GENERIC_CREATE: 'generic:create',
  GENERIC_UPDATE: 'generic:update',
  GENERIC_DELETE: 'generic:delete',

  // Unit
  UNIT_VIEW: 'unit:view',
  UNIT_CREATE: 'unit:create',
  UNIT_UPDATE: 'unit:update',
  UNIT_DELETE: 'unit:delete',

  // Organization
  ORGANIZATION_VIEW: 'organization:view',
  ORGANIZATION_CREATE: 'organization:create',
  ORGANIZATION_UPDATE: 'organization:update',
  ORGANIZATION_DELETE: 'organization:delete',

  // Branch
  BRANCH_VIEW: 'branch:view',
  BRANCH_CREATE: 'branch:create',
  BRANCH_UPDATE: 'branch:update',
  BRANCH_DELETE: 'branch:delete',

  // ===== Phase 3 — Medicine + Batch =====
  // Medicine
  MEDICINE_VIEW: 'medicine:view',
  MEDICINE_CREATE: 'medicine:create',
  MEDICINE_UPDATE: 'medicine:update',
  MEDICINE_DELETE: 'medicine:delete',

  // Batch
  BATCH_VIEW: 'batch:view',
  BATCH_CREATE: 'batch:create',
  BATCH_UPDATE: 'batch:update',
  BATCH_DELETE: 'batch:delete',

  // ===== Phase 4 — Supplier + Purchase + Inventory =====
  // Inventory
  INVENTORY_VIEW: 'inventory:view',
  INVENTORY_ADJUST: 'inventory:adjust',

  // Stock
  STOCK_VIEW: 'stock:view',

  // Supplier
  SUPPLIER_VIEW: 'supplier:view',
  SUPPLIER_CREATE: 'supplier:create',
  SUPPLIER_UPDATE: 'supplier:update',
  SUPPLIER_DELETE: 'supplier:delete',

  // Purchase
  PURCHASE_VIEW: 'purchase:view',
  PURCHASE_CREATE: 'purchase:create',
  PURCHASE_UPDATE: 'purchase:update',
  PURCHASE_DELETE: 'purchase:delete',
  PURCHASE_APPROVE: 'purchase:approve',

  // Purchase Return
  PURCHASE_RETURN_VIEW: 'purchase-return:view',
  PURCHASE_RETURN_CREATE: 'purchase-return:create',
  PURCHASE_RETURN_APPROVE: 'purchase-return:approve',

  // ===== Phase 6 — Customer + Sales =====
  // Customer
  CUSTOMER_VIEW: 'customer:view',
  CUSTOMER_CREATE: 'customer:create',
  CUSTOMER_UPDATE: 'customer:update',
  CUSTOMER_DELETE: 'customer:delete',

  // Sale
  SALE_VIEW: 'sale:view',
  SALE_CREATE: 'sale:create',
  SALE_APPROVE: 'sale:approve',

  // Sales Return
  SALES_RETURN_VIEW: 'sales-return:view',
  SALES_RETURN_CREATE: 'sales-return:create',
  SALES_RETURN_APPROVE: 'sales-return:approve',

  // ===== Phase 8 — Payment + Expense =====
  // Payment
  PAYMENT_VIEW: 'payment:view',
  PAYMENT_CREATE: 'payment:create',
  PAYMENT_DELETE: 'payment:delete',

  // Expense
  EXPENSE_VIEW: 'expense:view',
  EXPENSE_CREATE: 'expense:create',
  EXPENSE_UPDATE: 'expense:update',
  EXPENSE_DELETE: 'expense:delete',

  // ===== Phase 9-10 (Future) =====
  // Report
  REPORT_VIEW: 'report:view',
  REPORT_EXPORT: 'report:export',

  // Notification
  NOTIFICATION_VIEW: 'notification:view',

  // Audit
  AUDIT_VIEW: 'audit:view',

  // Setting
  SETTING_VIEW: 'setting:view',
  SETTING_UPDATE: 'setting:update'
};

module.exports = PERMISSIONS;