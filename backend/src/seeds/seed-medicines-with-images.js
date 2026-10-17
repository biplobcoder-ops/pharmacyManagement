// backend/src/seeds/seed-medicines-with-images.js
// Run: npm run seed:medicines

require('dotenv').config();
const mongoose = require('mongoose');

const Medicine = require('../models/Medicine');
const Category = require('../models/Category');
const Generic = require('../models/Generic');
const Brand = require('../models/Brand');
const Unit = require('../models/Unit');

// 🔥 100 Medicines — real data + free image URLs
const medicineData = [
  { name: 'Napa', generic: 'Paracetamol', brand: 'Beximco', category: 'Painkiller', unit: 'Tablet', strength: '500mg', dosageForm: 'tablet', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400' },
  { name: 'Ace', generic: 'Paracetamol', brand: 'Square', category: 'Painkiller', unit: 'Tablet', strength: '500mg', dosageForm: 'tablet', image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400' },
  { name: 'Seclo', generic: 'Omeprazole', brand: 'Square', category: 'Gastric', unit: 'Capsule', strength: '20mg', dosageForm: 'capsule', image: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=400' },
  { name: 'Sergel', generic: 'Esomeprazole', brand: 'Healthcare', category: 'Gastric', unit: 'Capsule', strength: '20mg', dosageForm: 'capsule', image: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400' },
  { name: 'Monas', generic: 'Montelukast', brand: 'Square', category: 'Respiratory', unit: 'Tablet', strength: '10mg', dosageForm: 'tablet', image: 'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?w=400' },
  { name: 'Ceevit', generic: 'Vitamin C', brand: 'Square', category: 'Vitamin', unit: 'Tablet', strength: '250mg', dosageForm: 'tablet', image: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400' },
  { name: 'Zincovit', generic: 'Multivitamin', brand: 'Apex', category: 'Vitamin', unit: 'Tablet', strength: '500mg', dosageForm: 'tablet', image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400' },
  { name: 'Folic Acid', generic: 'Folic Acid', brand: 'Beximco', category: 'Vitamin', unit: 'Tablet', strength: '5mg', dosageForm: 'tablet', image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400' },
  { name: 'Amoxil', generic: 'Amoxicillin', brand: 'GSK', category: 'Antibiotic', unit: 'Capsule', strength: '500mg', dosageForm: 'capsule', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400' },
  { name: 'Azithral', generic: 'Azithromycin', brand: 'Apex', category: 'Antibiotic', unit: 'Tablet', strength: '500mg', dosageForm: 'tablet', image: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=400' },
  { name: 'Ciprocin', generic: 'Ciprofloxacin', brand: 'Square', category: 'Antibiotic', unit: 'Tablet', strength: '500mg', dosageForm: 'tablet', image: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400' },
  { name: 'Flagyl', generic: 'Metronidazole', brand: 'Sanofi', category: 'Antibiotic', unit: 'Tablet', strength: '400mg', dosageForm: 'tablet', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400' },
  { name: 'Cef-3', generic: 'Cefixime', brand: 'Square', category: 'Antibiotic', unit: 'Capsule', strength: '200mg', dosageForm: 'capsule', image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400' },
  { name: 'Losartan', generic: 'Losartan Potassium', brand: 'Beximco', category: 'Cardiovascular', unit: 'Tablet', strength: '50mg', dosageForm: 'tablet', image: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=400' },
  { name: 'Amlopin', generic: 'Amlodipine', brand: 'Square', category: 'Cardiovascular', unit: 'Tablet', strength: '5mg', dosageForm: 'tablet', image: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400' },
  { name: 'Bisocor', generic: 'Bisoprolol', brand: 'Merck', category: 'Cardiovascular', unit: 'Tablet', strength: '5mg', dosageForm: 'tablet', image: 'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?w=400' },
  { name: 'Atorin', generic: 'Atorvastatin', brand: 'Healthcare', category: 'Cardiovascular', unit: 'Tablet', strength: '10mg', dosageForm: 'tablet', image: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400' },
  { name: 'Metfo', generic: 'Metformin', brand: 'Square', category: 'Diabetes', unit: 'Tablet', strength: '500mg', dosageForm: 'tablet', image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400' },
  { name: 'Diamicron', generic: 'Gliclazide', brand: 'Servier', category: 'Diabetes', unit: 'Tablet', strength: '80mg', dosageForm: 'tablet', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400' },
  { name: 'Insulin', generic: 'Insulin Glargine', brand: 'Sanofi', category: 'Diabetes', unit: 'Injection', strength: '100IU', dosageForm: 'injection', image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400' },
  { name: 'Salbutamol', generic: 'Salbutamol', brand: 'GSK', category: 'Respiratory', unit: 'Inhaler', strength: '100mcg', dosageForm: 'inhaler', image: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=400' },
  { name: 'Montair', generic: 'Montelukast', brand: 'Square', category: 'Respiratory', unit: 'Tablet', strength: '10mg', dosageForm: 'tablet', image: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400' },
  { name: 'Fexo', generic: 'Fexofenadine', brand: 'Apex', category: 'Antihistamine', unit: 'Tablet', strength: '120mg', dosageForm: 'tablet', image: 'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?w=400' },
  { name: 'Alatrol', generic: 'Cetirizine', brand: 'Square', category: 'Antihistamine', unit: 'Tablet', strength: '10mg', dosageForm: 'tablet', image: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400' },
  { name: 'Rupatrol', generic: 'Rupatadine', brand: 'Healthcare', category: 'Antihistamine', unit: 'Tablet', strength: '10mg', dosageForm: 'tablet', image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400' },
  { name: 'Omeprazole', generic: 'Omeprazole', brand: 'Beximco', category: 'Gastric', unit: 'Capsule', strength: '20mg', dosageForm: 'capsule', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400' },
  { name: 'Pantoprazole', generic: 'Pantoprazole', brand: 'Square', category: 'Gastric', unit: 'Tablet', strength: '40mg', dosageForm: 'tablet', image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400' },
  { name: 'Ranitidine', generic: 'Ranitidine', brand: 'Square', category: 'Gastric', unit: 'Tablet', strength: '150mg', dosageForm: 'tablet', image: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=400' },
  { name: 'Domperidone', generic: 'Domperidone', brand: 'Apex', category: 'Gastric', unit: 'Tablet', strength: '10mg', dosageForm: 'tablet', image: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400' },
  { name: 'Ondansetron', generic: 'Ondansetron', brand: 'Square', category: 'Gastric', unit: 'Tablet', strength: '4mg', dosageForm: 'tablet', image: 'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?w=400' },
  { name: 'Ibuprofen', generic: 'Ibuprofen', brand: 'Beximco', category: 'Painkiller', unit: 'Tablet', strength: '400mg', dosageForm: 'tablet', image: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400' },
  { name: 'Diclofenac', generic: 'Diclofenac Sodium', brand: 'Square', category: 'Painkiller', unit: 'Tablet', strength: '50mg', dosageForm: 'tablet', image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400' },
  { name: 'Tramadol', generic: 'Tramadol', brand: 'Apex', category: 'Painkiller', unit: 'Capsule', strength: '50mg', dosageForm: 'capsule', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400' },
  { name: 'Naproxen', generic: 'Naproxen', brand: 'Square', category: 'Painkiller', unit: 'Tablet', strength: '250mg', dosageForm: 'tablet', image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400' },
  { name: 'Aspirin', generic: 'Aspirin', brand: 'Bayer', category: 'Painkiller', unit: 'Tablet', strength: '75mg', dosageForm: 'tablet', image: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=400' },
  { name: 'Cough Syrup', generic: 'Dextromethorphan', brand: 'Square', category: 'Respiratory', unit: 'Syrup', strength: '100ml', dosageForm: 'syrup', image: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400' },
  { name: 'Antacid Syrup', generic: 'Aluminium Hydroxide', brand: 'Apex', category: 'Gastric', unit: 'Syrup', strength: '200ml', dosageForm: 'syrup', image: 'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?w=400' },
  { name: 'Iron Syrup', generic: 'Ferrous Sulphate', brand: 'Beximco', category: 'Vitamin', unit: 'Syrup', strength: '200ml', dosageForm: 'syrup', image: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400' },
  { name: 'Paracetamol Syrup', generic: 'Paracetamol', brand: 'Square', category: 'Painkiller', unit: 'Syrup', strength: '60ml', dosageForm: 'syrup', image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400' },
  { name: 'Amoxicillin Syrup', generic: 'Amoxicillin', brand: 'GSK', category: 'Antibiotic', unit: 'Syrup', strength: '100ml', dosageForm: 'syrup', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400' },
  { name: 'Eye Drop', generic: 'Chloramphenicol', brand: 'Apex', category: 'Ophthalmic', unit: 'Drop', strength: '10ml', dosageForm: 'drops', image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400' },
  { name: 'Ear Drop', generic: 'Ofloxacin', brand: 'Square', category: 'Otic', unit: 'Drop', strength: '10ml', dosageForm: 'drops', image: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=400' },
  { name: 'Skin Cream', generic: 'Clotrimazole', brand: 'Healthcare', category: 'Dermatology', unit: 'Cream', strength: '1%', dosageForm: 'cream', image: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400' },
  { name: 'Betnovate', generic: 'Betamethasone', brand: 'GSK', category: 'Dermatology', unit: 'Cream', strength: '0.1%', dosageForm: 'cream', image: 'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?w=400' },
  { name: 'Fungal Cream', generic: 'Terbinafine', brand: 'Apex', category: 'Dermatology', unit: 'Cream', strength: '1%', dosageForm: 'cream', image: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400' },
  { name: 'Sunscreen', generic: 'Zinc Oxide', brand: 'Neutrogena', category: 'Dermatology', unit: 'Lotion', strength: 'SPF50', dosageForm: 'ointment', image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400' },
  { name: 'Calcium', generic: 'Calcium Carbonate', brand: 'Square', category: 'Vitamin', unit: 'Tablet', strength: '500mg', dosageForm: 'tablet', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400' },
  { name: 'Vitamin D3', generic: 'Cholecalciferol', brand: 'Apex', category: 'Vitamin', unit: 'Capsule', strength: '1000IU', dosageForm: 'capsule', image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400' },
  { name: 'Vitamin B12', generic: 'Cyanocobalamin', brand: 'Beximco', category: 'Vitamin', unit: 'Injection', strength: '1000mcg', dosageForm: 'injection', image: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=400' },
  { name: 'Multivitamin', generic: 'Multivitamin Complex', brand: 'Square', category: 'Vitamin', unit: 'Tablet', strength: '500mg', dosageForm: 'tablet', image: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400' },
  { name: 'Metronidazole Syrup', generic: 'Metronidazole', brand: 'Square', category: 'Antibiotic', unit: 'Syrup', strength: '60ml', dosageForm: 'syrup', image: 'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?w=400' },
];

// 🔁 50 → 100 banano (duplicate suffix diye)
function generate100Medicines() {
  const final = [];
  const baseLen = medicineData.length;
  for (let i = 0; i < 100; i++) {
    const base = medicineData[i % baseLen];
    const round = Math.floor(i / baseLen) + 1;
    final.push({
      ...base,
      name: round === 1 ? base.name : `${base.name} ${round}`,
    });
  }
  return final;
}

const seedMedicines = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    const allMedicines = generate100Medicines();
    let inserted = 0;
    let skipped = 0;

    for (const m of allMedicines) {
      try {
        // Find or create Category
        let category = await Category.findOne({ name: m.category });
        if (!category) category = await Category.create({ name: m.category });

        // Find or create Generic
        let generic = await Generic.findOne({ name: m.generic });
        if (!generic) generic = await Generic.create({ name: m.generic });

        // Find or create Brand
        let brand = await Brand.findOne({ name: m.brand });
        if (!brand) brand = await Brand.create({ name: m.brand });

        // Find or create Unit
        let unit = await Unit.findOne({ name: m.unit });
        if (!unit) {
          unit = await Unit.create({
            name: m.unit,
            shortName: m.unit.toLowerCase().slice(0, 6),
          });
        }

        // Duplicate check
        const exists = await Medicine.findOne({ name: m.name });
        if (exists) {
          skipped++;
          continue;
        }

        await Medicine.create({
          name: m.name,
          generic: generic._id,
          brand: brand._id,
          category: category._id,
          unit: unit._id,
          strength: m.strength,
          dosageForm: m.dosageForm,
          image: { url: m.image, publicId: null },
          description: `${m.name} - ${m.generic} (${m.category})`,
          manufacturer: m.brand,
          status: 'active',
        });

        inserted++;
        if (inserted % 10 === 0) console.log(`✅ ${inserted} medicines inserted...`);
      } catch (err) {
        console.log(`⚠️ Skipped ${m.name}: ${err.message}`);
        skipped++;
      }
    }

    console.log(`\n🎉 DONE! Inserted: ${inserted} | Skipped: ${skipped}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Fatal Error:', err);
    process.exit(1);
  }
};

seedMedicines();