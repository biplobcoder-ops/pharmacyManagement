// backend/scripts/check-db.js
const mongoose = require('mongoose');
const env = require('../src/config/env');

async function checkDB() {
  try {
    console.log('🔄 Connecting to MongoDB Atlas...');
    await mongoose.connect(env.MONGODB_URI);
    console.log('✅ Connected\n');

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    console.log('=== All Collections ===');
    for (const c of collections) {
      const count = await db.collection(c.name).countDocuments();
      console.log(`  ${c.name}: ${count} docs`);
    }

    console.log('\n=== Specific Data ===');
    const generics = await db.collection('generics').find({}, { projection: { name: 1 } }).toArray();
    const brands = await db.collection('brands').find({}, { projection: { name: 1 } }).toArray();
    const categories = await db.collection('categories').find({}, { projection: { name: 1 } }).toArray();
    const units = await db.collection('units').find({}, { projection: { name: 1 } }).toArray();

    console.log('Generics:', generics.map(g => g.name).join(', '));
    console.log('Brands:', brands.map(b => b.name).join(', '));
    console.log('Categories:', categories.map(c => c.name).join(', '));
    console.log('Units:', units.map(u => u.name).join(', '));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkDB();