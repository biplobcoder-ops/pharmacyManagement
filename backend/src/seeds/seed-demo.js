// src/seeds/seed-demo.js
// Demo data seed — API call kore purchase/sale/payment create
// Run: node src/seeds/seed-demo.js
// IMPORTANT: Server running thakte hobe (npm run dev)

const API_BASE = 'http://localhost:5000/api';

// Admin credentials
const ADMIN = {
  email: 'admin@pharmacy.com',
  password: 'Admin@123'
};

// ===== Helper: API call =====
async function apiCall(method, endpoint, body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const response = await fetch(`${API_BASE}${endpoint}`, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(`${method} ${endpoint} failed: ${data.message || response.statusText}`);
  }

  return data;
}

// ===== Helper: Random =====
function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(daysBack = 30) {
  const date = new Date();
  date.setDate(date.getDate() - randomBetween(0, daysBack));
  date.setHours(randomBetween(9, 21), randomBetween(0, 59), 0, 0);
  return date.toISOString();
}

// ===== Main =====
const seedDemo = async () => {
  try {
    console.log('🚀 Starting demo data seed...\n');

    // ===== 1. Login =====
    console.log('🔑 Logging in...');
    const loginRes = await apiCall('POST', '/auth/login', ADMIN);
    const token = loginRes.data.accessToken;
    console.log(`   ✓ Logged in as: ${loginRes.data.user.name}\n`);

    // ===== 2. Get IDs =====
    console.log('📋 Fetching master data IDs...');

    const branchesRes = await apiCall('GET', '/branches', null, token);
    const branchId = branchesRes.data.branches[0]._id;
    console.log(`   ✓ Branch: ${branchesRes.data.branches[0].name}`);

    const medicinesRes = await apiCall('GET', '/medicines?limit=50', null, token);
    const medicines = medicinesRes.data.medicines;
    console.log(`   ✓ Medicines: ${medicines.length}`);

    const suppliersRes = await apiCall('GET', '/suppliers', null, token);
    const suppliers = suppliersRes.data.suppliers;
    console.log(`   ✓ Suppliers: ${suppliers.length}`);

    const customersRes = await apiCall('GET', '/customers?limit=50', null, token);
    const customers = customersRes.data.customers.filter((c) => !c.isWalkIn);
    console.log(`   ✓ Customers: ${customers.length}`);
    console.log('');

    // ===== 3. Purchases (3 ta) =====
    console.log('🛒 Creating demo purchases...');
    const createdPurchases = [];

    for (let i = 0; i < 3; i++) {
      const supplier = randomFrom(suppliers);
      const itemsCount = randomBetween(2, 3);
      const items = [];

      // Random medicines select (no duplicate)
      const usedMedicineIds = new Set();
      for (let j = 0; j < itemsCount; j++) {
        let medicine;
        do {
          medicine = randomFrom(medicines);
        } while (usedMedicineIds.has(medicine._id));
        usedMedicineIds.add(medicine._id);

        const quantity = randomBetween(20, 100);
        const batchNumber = `DEMO-PU-${Date.now()}-${j}`;
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + randomBetween(1, 3));
        expiryDate.setMonth(expiryDate.getMonth() + randomBetween(1, 11));

        items.push({
          medicine: medicine._id,
          batchNumber,
          manufacturingDate: new Date().toISOString(),
          expiryDate: expiryDate.toISOString(),
          quantity,
          freeQuantity: 0,
          purchasePrice: 1.5 + j * 0.5,
          sellingPrice: 2.5 + j * 0.8,
          discount: 0
        });
      }

      // Calculate totals roughly
      const estimatedTotal = items.reduce(
        (sum, it) => sum + it.quantity * it.purchasePrice,
        0
      );

      try {
        const purchaseRes = await apiCall(
          'POST',
          '/purchases',
          {
            supplier: supplier._id,
            branch: branchId,
            purchaseDate: randomDate(30),
            items,
            paidAmount: Math.floor(estimatedTotal * 0.6),
            paymentMethod: 'cash',
            notes: `Demo purchase #${i + 1}`
          },
          token
        );

        createdPurchases.push(purchaseRes.data);
        console.log(
          `   ✓ Purchase ${purchaseRes.data.invoiceNumber} — ${supplier.name} — ৳${purchaseRes.data.total}`
        );
      } catch (error) {
        console.log(`   ⚠️  Purchase ${i + 1} failed: ${error.message}`);
      }
    }
    console.log('');

    // ===== 4. Sales (12 ta) =====
    console.log('💰 Creating demo sales...');
    const createdSales = [];

    for (let i = 0; i < 12; i++) {
      // 70% customer sale, 30% walk-in
      const useCustomer = Math.random() < 0.7;
      const customer = useCustomer ? randomFrom(customers) : null;

      const itemsCount = randomBetween(1, 3);
      const items = [];

      // Random medicines (with available stock)
      const usedMedicineIds = new Set();
      for (let j = 0; j < itemsCount; j++) {
        let medicine;
        do {
          medicine = randomFrom(medicines);
        } while (usedMedicineIds.has(medicine._id));
        usedMedicineIds.add(medicine._id);

        items.push({
          medicine: medicine._id,
          quantity: randomBetween(1, 5),
          discount: 0
        });
      }

      // Payment status random (walk-in e full paid)
      let paidRatio = 1;
      if (useCustomer) {
        const rand = Math.random();
        if (rand < 0.6) paidRatio = 1; // 60% paid
        else if (rand < 0.9) paidRatio = 0.5; // 30% partial
        else paidRatio = 0; // 10% due
      }

      try {
        // Estimated total (for paidAmount calc — actual backend e hobe)
        const saleRes = await apiCall(
          'POST',
          '/sales',
          {
            customer: customer ? customer._id : null,
            branch: branchId,
            saleDate: randomDate(15),
            items,
            discount: 0,
            tax: 0,
            paidAmount: Math.floor(50 * paidRatio), // approx
            paymentMethod: 'cash',
            notes: `Demo sale #${i + 1}`
          },
          token
        );

        createdSales.push(saleRes.data);
        console.log(
          `   ✓ Sale ${saleRes.data.invoiceNumber} — ${saleRes.data.customerName} — ৳${saleRes.data.total} (${saleRes.data.paymentStatus})`
        );
      } catch (error) {
        console.log(`   ⚠️  Sale ${i + 1} failed: ${error.message}`);
      }
    }
    console.log('');

    // ===== 5. Customer Payments (3 ta) =====
    console.log('💳 Creating customer payments...');

    // Find customers with due
    const customersWithDue = await apiCall('GET', '/customers?hasDue=true', null, token);

    let paymentCount = 0;
    for (const customer of customersWithDue.data.customers.slice(0, 3)) {
      if (customer.dueBalance <= 0) continue;

      const payAmount = Math.floor(customer.dueBalance * 0.5);

      try {
        const paymentRes = await apiCall(
          'POST',
          '/payments/customer',
          {
            customer: customer._id,
            amount: payAmount,
            method: 'cash',
            branch: branchId,
            notes: `Demo customer payment for ${customer.name}`
          },
          token
        );

        paymentCount++;
        console.log(
          `   ✓ Payment ${paymentRes.data.paymentNumber} — ${customer.name} — ৳${payAmount}`
        );
      } catch (error) {
        console.log(`   ⚠️  Payment for ${customer.name} failed: ${error.message}`);
      }
    }
    console.log('');

    // ===== 6. Supplier Payments (2 ta) =====
    console.log('💳 Creating supplier payments...');

    const suppliersWithDue = await apiCall('GET', '/suppliers?hasDue=true', null, token);

    let supplierPayCount = 0;
    for (const supplier of suppliersWithDue.data.suppliers.slice(0, 2)) {
      if (supplier.dueBalance <= 0) continue;

      const payAmount = Math.floor(supplier.dueBalance * 0.5);

      try {
        const paymentRes = await apiCall(
          'POST',
          '/payments/supplier',
          {
            supplier: supplier._id,
            amount: payAmount,
            method: 'bank',
            reference: `DEMO-TXN-${Date.now()}`,
            branch: branchId,
            notes: `Demo supplier payment for ${supplier.name}`
          },
          token
        );

        supplierPayCount++;
        console.log(
          `   ✓ Payment ${paymentRes.data.paymentNumber} — ${supplier.name} — ৳${payAmount}`
        );
      } catch (error) {
        console.log(`   ⚠️  Payment for ${supplier.name} failed: ${error.message}`);
      }
    }
    console.log('');

    // ===== 7. Summary =====
    console.log('========================================');
    console.log('✅ Demo data seed completed!');
    console.log('========================================');
    console.log('\n📊 Created:');
    console.log(`   Purchases:           ${createdPurchases.length}`);
    console.log(`   Sales:               ${createdSales.length}`);
    console.log(`   Customer Payments:   ${paymentCount}`);
    console.log(`   Supplier Payments:   ${supplierPayCount}`);
    console.log(`   Stock Movements:     ${createdPurchases.length + createdSales.length} (auto)`);
    console.log('\n🌐 Test APIs:');
    console.log(`   GET ${API_BASE}/reports/dashboard`);
    console.log(`   GET ${API_BASE}/sales`);
    console.log(`   GET ${API_BASE}/purchases`);
    console.log(`   GET ${API_BASE}/payments`);
    console.log(`   GET ${API_BASE}/stock-movements`);
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error(`\n❌ Demo seed error: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
};

seedDemo();