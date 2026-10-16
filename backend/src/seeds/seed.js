// src/seeds/seed.js — FULL INDUSTRY STANDARD VERSION
// ✅ UPDATED: 23 Generics, 7 Categories, 6 Units

const mongoose = require('mongoose');
const env = require('../config/env');
const {
  User, Role, Organization, Branch,
  Category, Brand, Generic, Unit,
  Medicine, Batch, Supplier, Customer, Expense, Setting
} = require('../models');
const { ROLES, PERMISSIONS } = require('../constants');

// ===== Industry Standard Role Permissions =====
const rolePermissions = {
  [ROLES.ADMIN]: ['*'],

  [ROLES.MANAGER]: [
    PERMISSIONS.USER_VIEW, PERMISSIONS.ROLE_VIEW,
    PERMISSIONS.CATEGORY_VIEW, PERMISSIONS.CATEGORY_CREATE, PERMISSIONS.CATEGORY_UPDATE, PERMISSIONS.CATEGORY_DELETE,
    PERMISSIONS.BRAND_VIEW, PERMISSIONS.BRAND_CREATE, PERMISSIONS.BRAND_UPDATE, PERMISSIONS.BRAND_DELETE,
    PERMISSIONS.GENERIC_VIEW, PERMISSIONS.GENERIC_CREATE, PERMISSIONS.GENERIC_UPDATE, PERMISSIONS.GENERIC_DELETE,
    PERMISSIONS.UNIT_VIEW, PERMISSIONS.UNIT_CREATE, PERMISSIONS.UNIT_UPDATE, PERMISSIONS.UNIT_DELETE,
    PERMISSIONS.ORGANIZATION_VIEW,
    PERMISSIONS.BRANCH_VIEW, PERMISSIONS.BRANCH_CREATE, PERMISSIONS.BRANCH_UPDATE,
    PERMISSIONS.MEDICINE_VIEW, PERMISSIONS.MEDICINE_CREATE, PERMISSIONS.MEDICINE_UPDATE, PERMISSIONS.MEDICINE_DELETE,
    PERMISSIONS.BATCH_VIEW, PERMISSIONS.BATCH_CREATE, PERMISSIONS.BATCH_UPDATE, PERMISSIONS.BATCH_DELETE,
    PERMISSIONS.INVENTORY_VIEW, PERMISSIONS.INVENTORY_ADJUST,
    PERMISSIONS.STOCK_VIEW,
    PERMISSIONS.SUPPLIER_VIEW, PERMISSIONS.SUPPLIER_CREATE, PERMISSIONS.SUPPLIER_UPDATE, PERMISSIONS.SUPPLIER_DELETE,
    PERMISSIONS.PURCHASE_VIEW, PERMISSIONS.PURCHASE_CREATE, PERMISSIONS.PURCHASE_UPDATE, PERMISSIONS.PURCHASE_APPROVE,
    PERMISSIONS.PURCHASE_RETURN_VIEW, PERMISSIONS.PURCHASE_RETURN_CREATE, PERMISSIONS.PURCHASE_RETURN_APPROVE,
    PERMISSIONS.CUSTOMER_VIEW, PERMISSIONS.CUSTOMER_CREATE, PERMISSIONS.CUSTOMER_UPDATE, PERMISSIONS.CUSTOMER_DELETE,
    PERMISSIONS.SALE_VIEW, PERMISSIONS.SALE_CREATE, PERMISSIONS.SALE_APPROVE,
    PERMISSIONS.SALES_RETURN_VIEW, PERMISSIONS.SALES_RETURN_CREATE, PERMISSIONS.SALES_RETURN_APPROVE,
    PERMISSIONS.PAYMENT_VIEW, PERMISSIONS.PAYMENT_CREATE, PERMISSIONS.PAYMENT_DELETE,
    PERMISSIONS.EXPENSE_VIEW, PERMISSIONS.EXPENSE_CREATE, PERMISSIONS.EXPENSE_UPDATE,
    PERMISSIONS.REPORT_VIEW, PERMISSIONS.REPORT_EXPORT,
    PERMISSIONS.NOTIFICATION_VIEW,
    PERMISSIONS.AUDIT_VIEW,
    PERMISSIONS.SETTING_VIEW
  ],

  [ROLES.PHARMACIST]: [
    PERMISSIONS.CATEGORY_VIEW, PERMISSIONS.BRAND_VIEW, PERMISSIONS.GENERIC_VIEW, PERMISSIONS.UNIT_VIEW,
    PERMISSIONS.ORGANIZATION_VIEW, PERMISSIONS.BRANCH_VIEW,
    PERMISSIONS.MEDICINE_VIEW, PERMISSIONS.MEDICINE_CREATE, PERMISSIONS.MEDICINE_UPDATE,
    PERMISSIONS.BATCH_VIEW, PERMISSIONS.BATCH_CREATE, PERMISSIONS.BATCH_UPDATE,
    PERMISSIONS.INVENTORY_VIEW, PERMISSIONS.INVENTORY_ADJUST,
    PERMISSIONS.STOCK_VIEW,
    PERMISSIONS.SUPPLIER_VIEW,
    PERMISSIONS.PURCHASE_VIEW, PERMISSIONS.PURCHASE_RETURN_VIEW,
    PERMISSIONS.CUSTOMER_VIEW,
    PERMISSIONS.SALE_VIEW, PERMISSIONS.SALES_RETURN_VIEW,
    PERMISSIONS.NOTIFICATION_VIEW
  ],

  [ROLES.CASHIER]: [
    PERMISSIONS.MEDICINE_VIEW, PERMISSIONS.BATCH_VIEW, PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.CUSTOMER_VIEW, PERMISSIONS.CUSTOMER_CREATE,
    PERMISSIONS.SALE_VIEW, PERMISSIONS.SALE_CREATE,
    PERMISSIONS.SALES_RETURN_VIEW, PERMISSIONS.SALES_RETURN_CREATE,
    PERMISSIONS.PAYMENT_VIEW, PERMISSIONS.PAYMENT_CREATE,
    PERMISSIONS.NOTIFICATION_VIEW
  ],

  [ROLES.ACCOUNTANT]: [
    PERMISSIONS.CATEGORY_VIEW, PERMISSIONS.BRAND_VIEW, PERMISSIONS.GENERIC_VIEW, PERMISSIONS.UNIT_VIEW,
    PERMISSIONS.MEDICINE_VIEW, PERMISSIONS.BATCH_VIEW,
    PERMISSIONS.INVENTORY_VIEW, PERMISSIONS.STOCK_VIEW,
    PERMISSIONS.SUPPLIER_VIEW,
    PERMISSIONS.PURCHASE_VIEW, PERMISSIONS.PURCHASE_RETURN_VIEW,
    PERMISSIONS.CUSTOMER_VIEW,
    PERMISSIONS.SALE_VIEW, PERMISSIONS.SALES_RETURN_VIEW,
    PERMISSIONS.PAYMENT_VIEW, PERMISSIONS.PAYMENT_CREATE,
    PERMISSIONS.EXPENSE_VIEW, PERMISSIONS.EXPENSE_CREATE, PERMISSIONS.EXPENSE_UPDATE, PERMISSIONS.EXPENSE_DELETE,
    PERMISSIONS.REPORT_VIEW, PERMISSIONS.REPORT_EXPORT,
    PERMISSIONS.NOTIFICATION_VIEW,
    PERMISSIONS.AUDIT_VIEW
  ]
};

const seed = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log('✅ MongoDB connected');

    // ===== 1. Roles =====
    console.log('\n📝 Seeding roles...');
    const roles = {};
    for (const [roleName, permissions] of Object.entries(rolePermissions)) {
      let role = await Role.findOne({ name: roleName });
      if (role) {
        role.permissions = permissions;
        await role.save();
        console.log(`   ↻ Updated: ${roleName}`);
      } else {
        role = await Role.create({
          name: roleName,
          description: `${roleName.charAt(0).toUpperCase() + roleName.slice(1)} role`,
          permissions,
          isSystem: true,
          status: 'active'
        });
        console.log(`   ✓ Created: ${roleName}`);
      }
      roles[roleName] = role;
    }

    // ===== 2. Settings =====
    console.log('\n⚙️  Seeding default settings...');
    const defaultSettings = [
      { key: 'invoice_prefix', value: 'SL', category: 'invoice', dataType: 'string', isSystem: true, label: 'Sale Invoice Prefix' },
      { key: 'purchase_prefix', value: 'PU', category: 'invoice', dataType: 'string', isSystem: true, label: 'Purchase Invoice Prefix' },
      { key: 'sales_return_prefix', value: 'SR', category: 'invoice', dataType: 'string', isSystem: true, label: 'Sales Return Prefix' },
      { key: 'purchase_return_prefix', value: 'PR', category: 'invoice', dataType: 'string', isSystem: true, label: 'Purchase Return Prefix' },
      { key: 'expiry_threshold_days', value: 30, category: 'expiry', dataType: 'number', isSystem: true, label: 'Expiry Alert Threshold' },
      { key: 'currency', value: 'BDT', category: 'general', dataType: 'string', isSystem: true, label: 'Currency' },
      { key: 'currency_symbol', value: '৳', category: 'general', dataType: 'string', isSystem: true, label: 'Currency Symbol' },
      { key: 'low_stock_alert', value: true, category: 'notification', dataType: 'boolean', isSystem: true, label: 'Low Stock Alert' },
      { key: 'expiry_alert', value: true, category: 'notification', dataType: 'boolean', isSystem: true, label: 'Expiry Alert' },
      { key: 'company_name', value: 'My Pharmacy', category: 'business', dataType: 'string', isSystem: true, label: 'Company Name' },
      { key: 'company_address', value: 'Dhanmondi, Dhaka', category: 'business', dataType: 'string', isSystem: true, label: 'Company Address' },
      { key: 'company_phone', value: '+8801700000000', category: 'business', dataType: 'string', isSystem: true, label: 'Company Phone' }
    ];

    for (const s of defaultSettings) {
      const exists = await Setting.findOne({ key: s.key });
      if (!exists) {
        await Setting.create(s);
        console.log(`   ✓ Setting: ${s.key}`);
      }
    }

    // ===== 3. Organization =====
    let organization = await Organization.findOne({ name: 'My Pharmacy' });
    if (!organization) {
      organization = await Organization.create({
        name: 'My Pharmacy',
        owner: 'Pharmacy Owner',
        phone: '+8801700000000',
        email: 'info@mypharmacy.com',
        address: 'Dhaka, Bangladesh',
        status: 'active'
      });
      console.log(`\n🏢 Organization: ${organization.name}`);
    }

    // ===== 4. Branch =====
    let branch = await Branch.findOne({ code: 'DHM-001' });
    if (!branch) {
      branch = await Branch.create({
        organization: organization._id,
        name: 'Dhanmondi Main',
        code: 'DHM-001',
        phone: '+8801700000000',
        email: 'dhanmondi@mypharmacy.com',
        address: 'Dhanmondi, Dhaka',
        isMainBranch: true,
        openingHours: { open: '09:00', close: '21:00' },
        status: 'active'
      });
      console.log(`🏬 Branch: ${branch.name}`);
    }

    // ===== 5. Users (5 roles) =====
    console.log('\n👥 Seeding 5 users (1 per role)...');
    const usersData = [
      { name: 'Admin User', email: 'admin@pharmacy.com', password: 'Admin@123', roleName: 'admin' },
      { name: 'Manager User', email: 'manager@pharmacy.com', password: 'Manager@123', roleName: 'manager' },
      { name: 'Pharmacist User', email: 'pharmacist@pharmacy.com', password: 'Pharmacist@123', roleName: 'pharmacist' },
      { name: 'Cashier User', email: 'cashier@pharmacy.com', password: 'Cashier@123', roleName: 'cashier' },
      { name: 'Accountant User', email: 'accountant@pharmacy.com', password: 'Accountant@123', roleName: 'accountant' }
    ];

    const createdUsers = {};
    for (const u of usersData) {
      let user = await User.findOne({ email: u.email });
      if (!user) {
        user = await User.create({
          name: u.name,
          email: u.email,
          phone: '+8801700000000',
          password: u.password,
          role: roles[u.roleName]._id,
          branch: branch._id,
          status: 'active',
          preferences: { theme: 'light' }
        });
        console.log(`   ✓ ${u.roleName}: ${u.email}`);
      } else {
        if (!user.branch) {
          user.branch = branch._id;
          await user.save({ validateBeforeSave: false });
        }
        console.log(`   ↻ ${u.roleName} exists: ${u.email}`);
      }
      createdUsers[u.roleName] = user;
    }

    const admin = createdUsers.admin;
    if (!branch.manager) {
      branch.manager = admin._id;
      await branch.save();
    }

    // ===== 6. Categories (7 ta) =====
    console.log('\n📚 Seeding categories (7)...');
    const categoryNames = [
      'Prescription',
      'OTC Medicine',
      'Personal Care',
      'Baby Care',
      'Vitamins',
      'Diabetes',
      'Cardiovascular'
    ];
    const categories = {};
    for (const name of categoryNames) {
      let cat = await Category.findOne({ name });
      if (!cat) {
        cat = await Category.create({ name, sortOrder: 0 });
        console.log(`   ✓ Category: ${name}`);
      } else {
        console.log(`   ↻ Category exists: ${name}`);
      }
      categories[name] = cat;
    }

    // ===== 7. Brands (4 ta) =====
    console.log('\n🏷️  Seeding brands (4)...');
    const brandNames = [
      { name: 'Square', company: 'Square Pharmaceuticals' },
      { name: 'Beximco', company: 'Beximco Pharmaceuticals' },
      { name: 'Incepta', company: 'Incepta Pharmaceuticals' },
      { name: 'ACI', company: 'ACI Limited' }
    ];
    const brands = {};
    for (const b of brandNames) {
      let brand = await Brand.findOne({ name: b.name });
      if (!brand) {
        brand = await Brand.create(b);
        console.log(`   ✓ Brand: ${b.name}`);
      } else {
        console.log(`   ↻ Brand exists: ${b.name}`);
      }
      brands[b.name] = brand;
    }

    // ===== 8. Generics (23 ta) =====
    console.log('\n💊 Seeding generics (23)...');
    const genericNames = [
      'Paracetamol',
      'Omeprazole',
      'Esomeprazole',
      'Cetirizine',
      'Amoxicillin',
      'Azithromycin',
      'Metronidazole',
      'Cefixime',
      'Montelukast',
      'Fexofenadine',
      'Vitamin C',
      'Zinc',
      'Calcium',
      'Iron',
      'Multivitamin',
      'Amlodipine',
      'Losartan',
      'Bisoprolol',
      'Metoprolol',
      'Atenolol',
      'Metformin',
      'Gliclazide',
      'Sitagliptin'
    ];
    const generics = {};
    for (const name of genericNames) {
      let gen = await Generic.findOne({ name });
      if (!gen) {
        gen = await Generic.create({
          name,
          description: `${name} generic`,
          dosageForm: ['tablet']
        });
        console.log(`   ✓ Generic: ${name}`);
      } else {
        console.log(`   ↻ Generic exists: ${name}`);
      }
      generics[name] = gen;
    }

    // ===== 9. Units (6 ta) =====
    console.log('\n📏 Seeding units (6)...');
    const unitData = [
      { name: 'Piece', shortName: 'pc', conversionFactor: 1 },
      { name: 'Strip', shortName: 'st', conversionFactor: 10 },
      { name: 'Box', shortName: 'bx', conversionFactor: 100 },
      { name: 'Capsule', shortName: 'cap', conversionFactor: 1 },
      { name: 'Bottle', shortName: 'btl', conversionFactor: 1 },
      { name: 'Tube', shortName: 'tb', conversionFactor: 1 }
    ];
    const units = {};
    for (const u of unitData) {
      let unit = await Unit.findOne({ name: u.name });
      if (!unit) {
        unit = await Unit.create({
          name: u.name,
          shortName: u.shortName,
          conversionFactor: u.conversionFactor
        });
        console.log(`   ✓ Unit: ${u.name}`);
      } else {
        console.log(`   ↻ Unit exists: ${u.name}`);
      }
      units[u.name] = unit;
    }

    // ===== 10. Medicines (4 sample) =====
    console.log('\n💊 Seeding sample medicines...');
    const medicineData = [
      { name: 'Napa 500', generic: generics['Paracetamol']._id, brand: brands['Beximco']._id, category: categories['OTC Medicine']._id, unit: units['Strip']._id, strength: '500 mg', dosageForm: 'tablet', minStockLevel: 50 },
      { name: 'Seclo 20', generic: generics['Omeprazole']._id, brand: brands['Square']._id, category: categories['Prescription']._id, unit: units['Strip']._id, strength: '20 mg', dosageForm: 'capsule', minStockLevel: 30 },
      { name: 'Maxpro 20', generic: generics['Esomeprazole']._id, brand: brands['Incepta']._id, category: categories['Prescription']._id, unit: units['Strip']._id, strength: '20 mg', dosageForm: 'tablet', minStockLevel: 30 },
      { name: 'Ace 500', generic: generics['Paracetamol']._id, brand: brands['Square']._id, category: categories['OTC Medicine']._id, unit: units['Strip']._id, strength: '500 mg', dosageForm: 'tablet', minStockLevel: 50 }
    ];

    const medicines = {};
    for (const m of medicineData) {
      let med = await Medicine.findOne({ name: m.name });
      if (!med) {
        med = await Medicine.create({ ...m, status: 'active', createdBy: admin._id });
        console.log(`   ✓ Medicine: ${m.name}`);
      } else {
        console.log(`   ↻ Medicine exists: ${m.name}`);
      }
      medicines[m.name] = med;
    }

    // ===== 11. Suppliers =====
    console.log('\n🚚 Seeding suppliers...');
    const supplierData = [
      { name: 'Square Distributor', company: 'Square Pharmaceuticals Ltd', phone: '+8801711111111', contactPerson: 'Mr. Rahman' },
      { name: 'Beximco Supplier', company: 'Beximco Pharmaceuticals', phone: '+8801722222222', contactPerson: 'Mr. Karim' },
      { name: 'Incepta Wholesale', company: 'Incepta Pharmaceuticals Ltd', phone: '+8801733333333', contactPerson: 'Mr. Hasan' }
    ];
    const suppliers = {};
    for (const s of supplierData) {
      let supplier = await Supplier.findOne({ name: s.name, phone: s.phone });
      if (!supplier) {
        supplier = await Supplier.create({ ...s, status: 'active', createdBy: admin._id });
        console.log(`   ✓ Supplier: ${s.name}`);
      } else {
        console.log(`   ↻ Supplier exists: ${s.name}`);
      }
      suppliers[s.name] = supplier;
    }

    // ===== 12. Batches =====
    console.log('\n📦 Seeding batches...');
    const batchData = [
      { medicine: 'Napa 500', batchNumber: 'NP-24001', expiryDate: new Date('2027-01-31'), purchasePrice: 0.8, sellingPrice: 1.2, quantity: 100, supplierName: 'Beximco Supplier' },
      { medicine: 'Seclo 20', batchNumber: 'SC-24001', expiryDate: new Date('2027-06-30'), purchasePrice: 5, sellingPrice: 7, quantity: 80, supplierName: 'Square Distributor' },
      { medicine: 'Ace 500', batchNumber: 'AC-24001', expiryDate: new Date('2027-03-31'), purchasePrice: 0.7, sellingPrice: 1.1, quantity: 60, supplierName: 'Square Distributor' },
      { medicine: 'Maxpro 20', batchNumber: 'MX-24001', expiryDate: new Date('2027-09-30'), purchasePrice: 4.5, sellingPrice: 6.5, quantity: 50, supplierName: 'Incepta Wholesale' }
    ];

    for (const b of batchData) {
      const med = medicines[b.medicine];
      if (!med) continue;
      const exists = await Batch.findOne({ medicine: med._id, batchNumber: b.batchNumber, branch: branch._id });
      if (!exists) {
        await Batch.create({
          medicine: med._id,
          batchNumber: b.batchNumber,
          expiryDate: b.expiryDate,
          purchasePrice: b.purchasePrice,
          sellingPrice: b.sellingPrice,
          quantity: b.quantity,
          initialQuantity: b.quantity,
          supplier: suppliers[b.supplierName]?._id || null,
          branch: branch._id,
          status: 'active'
        });
        console.log(`   ✓ Batch: ${b.batchNumber} (${b.medicine})`);
      }
    }

    // ===== 13. Customers =====
    let walkIn = await Customer.findOne({ isWalkIn: true });
    if (!walkIn) {
      walkIn = await Customer.create({ name: 'Walk-in Customer', isWalkIn: true, status: 'active', createdBy: admin._id });
      console.log('\n🚶 Walk-in customer created');
    }

    // ===== 14. Expenses =====
    const expenseData = [
      { category: 'rent', title: 'Office Rent - Monthly', amount: 25000, paymentMethod: 'bank' },
      { category: 'electricity', title: 'Electricity Bill', amount: 4500, paymentMethod: 'mobile' },
      { category: 'internet', title: 'Internet Bill', amount: 1500, paymentMethod: 'mobile' },
      { category: 'transport', title: 'Delivery Transport', amount: 2000, paymentMethod: 'cash' }
    ];

    for (const e of expenseData) {
      const exists = await Expense.findOne({ title: e.title, branch: branch._id });
      if (!exists) {
        const setting = await Setting.findOneAndUpdate(
          { key: 'expense_counter' },
          { $inc: { value: 1 } },
          { returnDocument: 'after', upsert: true }
        );
        const expenseNumber = `EX-${String(setting.value).padStart(5, '0')}`;
        await Expense.create({ ...e, expenseNumber, date: new Date(), branch: branch._id, createdBy: admin._id });
      }
    }

    // ===== Done =====
    console.log('\n========================================');
    console.log('✅ Seed completed successfully!');
    console.log('========================================');
    console.log('\n📊 Seeded Data Summary:');
    console.log(`   Roles:       5`);
    console.log(`   Settings:    12`);
    console.log(`   Categories:  7`);
    console.log(`   Brands:      4`);
    console.log(`   Generics:   23`);
    console.log(`   Units:       6`);
    console.log(`   Medicines:   4 (sample)`);
    console.log(`   Suppliers:   3`);
    console.log(`   Batches:     4`);
    console.log(`   Users:       5`);
    console.log('\n🔑 Login credentials (5 roles):');
    console.log('   ┌─────────────────────────────────────────────────────────┐');
    console.log('   │ Role         Email                      Password        │');
    console.log('   ├─────────────────────────────────────────────────────────┤');
    console.log('   │ Admin        admin@pharmacy.com         Admin@123       │');
    console.log('   │ Manager      manager@pharmacy.com       Manager@123     │');
    console.log('   │ Pharmacist   pharmacist@pharmacy.com    Pharmacist@123  │');
    console.log('   │ Cashier      cashier@pharmacy.com       Cashier@123     │');
    console.log('   │ Accountant   accountant@pharmacy.com    Accountant@123  │');
    console.log('   └─────────────────────────────────────────────────────────┘');
    console.log('\n========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    console.error(error);
    process.exit(1);
  }
};

seed();