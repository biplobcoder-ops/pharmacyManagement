// src/models/index.js
// Model barrel export — sob model ek jaygay

// Phase 1
const User = require('./User');
const Role = require('./Role');
const RefreshToken = require('./RefreshToken');
const AuditLog = require('./AuditLog');

// Phase 2 — Master Data
const Category = require('./Category');
const Brand = require('./Brand');
const Generic = require('./Generic');
const Unit = require('./Unit');
const Organization = require('./Organization');
const Branch = require('./Branch');

// Phase 3 — Medicine + Batch
const Medicine = require('./Medicine');
const Batch = require('./Batch');

// Phase 4 — Supplier + Purchase + Stock Movement
const Supplier = require('./Supplier');
const StockMovement = require('./StockMovement');
const Purchase = require('./Purchase');
const PurchaseItem = require('./PurchaseItem');

// Phase 6 — Customer + Sales + Sales Return
const Customer = require('./Customer');
const Sale = require('./Sale');
const SaleItem = require('./SaleItem');
const { SalesReturn, SalesReturnItem } = require('./SalesReturn');

// Phase 8 — Payment + Expense
const Payment = require('./Payment');
const Expense = require('./Expense');

// Phase 10 — Notification + Setting
const Notification = require('./Notification');
const Setting = require('./Setting');

module.exports = {
  // Phase 1
  User,
  Role,
  RefreshToken,
  AuditLog,

  // Phase 2
  Category,
  Brand,
  Generic,
  Unit,
  Organization,
  Branch,

  // Phase 3
  Medicine,
  Batch,

  // Phase 4
  Supplier,
  StockMovement,
  Purchase,
  PurchaseItem,

  // Phase 6
  Customer,
  Sale,
  SaleItem,
  SalesReturn,
  SalesReturnItem,

  // Phase 8
  Payment,
  Expense,

  // Phase 10
  Notification,
  Setting
};