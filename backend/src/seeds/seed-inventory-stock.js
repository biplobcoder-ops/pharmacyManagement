// backend/src/seeds/seed-inventory-stock.js
require('dotenv').config();
const mongoose = require('mongoose');

const Medicine = require('../models/Medicine');
const Batch = require('../models/Batch');
const Branch = require('../models/Branch');
const Supplier = require('../models/Supplier');

const seedStock = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    // 1. Branch lagbe (Batch e branch required)
    let branch = await Branch.findOne();
    if (!branch) {
      console.log('⚠️ No Branch found. Creating a default branch...');
      branch = await Branch.create({
        name: 'Main Branch',
        code: 'MAIN-01',
        address: 'Default Address',
        isMainBranch: true,
      });
    }

    // 2. Supplier der niye asho (Tomar screenshot er moto 3 ta supplier thakbe)
    const suppliers = await Supplier.find({});
    if (suppliers.length === 0) {
      console.log('⚠️ No Suppliers found. Please add suppliers first.');
      process.exit(1);
    }
    console.log(`Found ${suppliers.length} suppliers:`, suppliers.map(s => s.name).join(', '));

    // 3. Sob Medicine niye asho
    const medicines = await Medicine.find({});
    console.log(`Found ${medicines.length} medicines. Adding stock...\n`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const medicine of medicines) {
      try {
        // Random stock: 50 theke 500
        const randomStock = Math.floor(Math.random() * 450) + 50;
        
        // Manufacturing Date: 1 bochor age
        const mfgDate = new Date();
        mfgDate.setFullYear(mfgDate.getFullYear() - 1);

        // Expiry Date: 1 theke 3 bochor por
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + (Math.floor(Math.random() * 2) + 1));

        // ✅ Randomly ekta supplier select koro (Incepta, Beximco, Square)
        const randomSupplier = suppliers[Math.floor(Math.random() * suppliers.length)];

        // 4. Batch create koro (Tomar model er exact field onujayi)
        await Batch.create({
          medicine: medicine._id,
          branch: branch._id, 
          supplier: randomSupplier._id, 
          batchNumber: `BATCH-${Math.floor(Math.random() * 100000)}`,
          manufacturingDate: mfgDate,
          expiryDate: expiryDate,
          quantity: randomStock,
          initialQuantity: randomStock,
          purchasePrice: Math.round(Math.random() * 100) + 10,
          sellingPrice: Math.round(Math.random() * 150) + 20,
          status: 'active'
        });

        updatedCount++;
        if (updatedCount % 10 === 0) {
          console.log(`✅ Stock added for ${updatedCount} medicines...`);
        }
      } catch (err) {
        // Jodi unique batch number duplicate hoy, skip korbe
        skippedCount++;
      }
    }

    console.log(`\n🎉 DONE!`);
    console.log(`Inserted Batches: ${updatedCount}`);
    console.log(`Skipped: ${skippedCount}`);
    
    process.exit(0);

  } catch (err) {
    console.error('❌ Fatal Error:', err);
    process.exit(1);
  }
};

seedStock();