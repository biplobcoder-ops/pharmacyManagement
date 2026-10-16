// src/seeds/debug-purchase.js
// Debug purchase validation error
// Run: node src/seeds/debug-purchase.js

const API_BASE = 'http://localhost:5000/api';

const apiCall = async (method, endpoint, body = null, token = null) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const response = await fetch(`${API_BASE}${endpoint}`, options);
  const data = await response.json();
  return { status: response.status, ok: response.ok, data };
};

const debug = async () => {
  try {
    console.log('🔍 Debug purchase validation\n');

    // 1. Login
    const login = await apiCall('POST', '/auth/login', {
      email: 'admin@pharmacy.com',
      password: 'Admin@123'
    });
    const token = login.data.data.accessToken;
    console.log('✅ Logged in\n');

    // 2. Get IDs
    const branches = await apiCall('GET', '/branches', null, token);
    const branchId = branches.data.data.branches[0]._id;

    const medicines = await apiCall('GET', '/medicines?limit=50', null, token);
    const medicineId = medicines.data.data.medicines[0]._id;
    console.log(`Branch: ${branchId}`);
    console.log(`Medicine: ${medicineId}\n`);

    const suppliers = await apiCall('GET', '/suppliers', null, token);
    const supplierId = suppliers.data.data.suppliers[0]._id;
    console.log(`Supplier: ${supplierId}\n`);

    // 3. Build payload
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 2);

    const payload = {
      supplier: supplierId,
      branch: branchId,
      purchaseDate: new Date().toISOString(),
      items: [
        {
          medicine: medicineId,
          batchNumber: `DEBUG-${Date.now()}`,
          manufacturingDate: new Date().toISOString(),
          expiryDate: expiryDate.toISOString(),
          quantity: 50,
          freeQuantity: 0,
          purchasePrice: 2.0,
          sellingPrice: 3.0,
          discount: 0
        }
      ],
      discount: 0,
      tax: 0,
      paidAmount: 50,
      paymentMethod: 'cash',
      notes: 'Debug purchase'
    };

    console.log('📤 Payload:');
    console.log(JSON.stringify(payload, null, 2));
    console.log('');

    // 4. Send
    const result = await apiCall('POST', '/purchases', payload, token);

    console.log(`Status: ${result.status}`);
    console.log('Response:');
    console.log(JSON.stringify(result.data, null, 2));

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

debug();