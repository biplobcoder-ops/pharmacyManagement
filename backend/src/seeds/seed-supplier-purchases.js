// backend/src/seeds/seed-supplier-purchases.js
require('dotenv').config();
const mongoose = require('mongoose');

const Medicine = require('../models/Medicine');
const Batch = require('../models/Batch');
const Branch = require('../models/Branch');
const Supplier = require('../models/Supplier');
const User = require('../models/User');
const Purchase = require('../models/Purchase');
const PurchaseItem = require('../models/PurchaseItem');

const seedPurchases = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    let branch = await Branch.findOne();
    let suppliers = await Supplier.find({});
    let user = await User.findOne(); // Purchase e user required
    let medicines = await Medicine.find({});

    if (!branch || suppliers.length === 0 || !user || medicines.length === 0) {
      console.log('⚠️ Branch, Supplier, User ba Medicine missing. Age segulo create koro.');
      process.exit(1);
    }

    let inserted = 0;
    let skipped = 0;

    for (const medicine of medicines) {
      try {
        const randomSupplier = suppliers[Math.floor(Math.random() * suppliers.length)];
        const randomStock = Math.floor(Math.random() * 450) + 50;
        const purchasePrice = Math.round(Math.random() * 100) + 10;
        const sellingPrice = Math.round(purchasePrice * 1.3);
        const totalAmount = randomStock * purchasePrice;
        
        // Expiry Date: 2 bochor por
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 2);
        const batchNumber = `BATCH-${Math.floor(Math.random() * 1000000)}`;

        // 1. Purchase create koro (Age Purchase banate hobe, jate ID paoa jay)
        const newPurchase = await Purchase.create({
          invoiceNumber: `PUR-${Math.floor(Math.random() * 1000000)}`,
          supplier: randomSupplier._id,
          branch: branch._id,
          items: [], // Pore update korbo
          subtotal: totalAmount,
          total: totalAmount,
          paidAmount: totalAmount,
          dueAmount: 0,
          paymentStatus: 'paid',
          status: 'completed',
          purchaseDate: new Date(),
          createdBy: user._id
        });

        // 2. PurchaseItem create koro (Ekhon purchase ID peye gechi)
        const purchaseItem = await PurchaseItem.create({
          purchase: newPurchase._id, // ✅ Ekhon ID set kora jabe
          medicine: medicine._id,
          medicineName: medicine.name,
          batchNumber: batchNumber,
          expiryDate: expiryDate,
          quantity: randomStock,
          purchasePrice: purchasePrice,
          sellingPrice: sellingPrice,
          total: totalAmount
        });

        // 3. Purchase er items array update koro
        newPurchase.items.push(purchaseItem._id);
        await newPurchase.save();

        // 4. Batch create koro (Stock add korar jonno)
        await Batch.create({
          medicine: medicine._id,
          branch: branch._id,
          supplier: randomSupplier._id,
          batchNumber: batchNumber,
          expiryDate: expiryDate,
          quantity: randomStock,
          initialQuantity: randomStock,
          purchasePrice: purchasePrice,
          sellingPrice: sellingPrice,
          status: 'active'
        });

        inserted++;
        if (inserted % 10 === 0) console.log(`✅ Purchase record added for ${inserted} medicines...`);
      } catch (err) {
        console.log(`⚠️ Skipped ${medicine.name}: ${err.message}`);
        skipped++;
      }
    }

    console.log(`\n🎉 DONE! Total ${inserted} purchase records created.`);
    console.log(`Skipped: ${skipped}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
};

seedPurchases();