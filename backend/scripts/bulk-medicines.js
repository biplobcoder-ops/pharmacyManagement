// backend/scripts/bulk-medicines.js
// ✅ UPDATED: Tomar actual Cloudinary URLs

const mongoose = require('mongoose');
const env = require('../src/config/env');
const { Medicine, Generic, Brand, Category, Unit } = require('../src/models');

// ✅ TOMAR ACTUAL CLOUDINARY URLs
const MEDICINE_IMAGES = {
  tablet:    'https://res.cloudinary.com/dthvcivy4/image/upload/v1791950452/image1_buoagp.png',
  capsule:   'https://res.cloudinary.com/dthvcivy4/image/upload/v1791950452/image2_oxaqyj.png',
  syrup:     'https://res.cloudinary.com/dthvcivy4/image/upload/v1791950452/image3_t3dj5p.png',
  injection: 'https://res.cloudinary.com/dthvcivy4/image/upload/v1791950452/image4_w0ryj5.png',
  default:   'https://res.cloudinary.com/dthvcivy4/image/upload/v1791950451/image5_zjrukw.png'
};

// ✅ Helper: dosageForm → image URL
function getImageUrl(dosageForm) {
  const form = (dosageForm || '').toLowerCase();
  if (form.includes('capsule')) return MEDICINE_IMAGES.capsule;
  if (form.includes('syrup') || form.includes('suspension')) return MEDICINE_IMAGES.syrup;
  if (form.includes('injection')) return MEDICINE_IMAGES.injection;
  if (form.includes('tablet')) return MEDICINE_IMAGES.tablet;
  return MEDICINE_IMAGES.default;
}

// ✅ Helper: publicId extract
function getPublicId(dosageForm) {
  const form = (dosageForm || '').toLowerCase();
  if (form.includes('capsule')) return 'image2_oxaqyj';
  if (form.includes('syrup') || form.includes('suspension')) return 'image3_t3dj5p';
  if (form.includes('injection')) return 'image4_w0ryj5';
  if (form.includes('tablet')) return 'image1_buoagp';
  return 'image5_zjrukw';
}

// ✅ 106 medicine data (tomar full list)
const medicinesData = [
  // ═══════════════════════════════════════════════════════════════
  // PARACETAMOL (Pain/Fever) — 15 items
  // ═══════════════════════════════════════════════════════════════
  { name: 'Napa 500', generic: 'Paracetamol', brand: 'Beximco', category: 'OTC Medicine', unit: 'Strip', strength: '500 mg', dosageForm: 'tablet', minStockLevel: 50 },
  { name: 'Napa Extra', generic: 'Paracetamol', brand: 'Beximco', category: 'OTC Medicine', unit: 'Strip', strength: '500 mg', dosageForm: 'tablet', minStockLevel: 50 },
  { name: 'Ace 500', generic: 'Paracetamol', brand: 'Square', category: 'OTC Medicine', unit: 'Strip', strength: '500 mg', dosageForm: 'tablet', minStockLevel: 50 },
  { name: 'Ace Plus', generic: 'Paracetamol', brand: 'Square', category: 'OTC Medicine', unit: 'Strip', strength: '500 mg', dosageForm: 'tablet', minStockLevel: 50 },
  { name: 'Ace Extend', generic: 'Paracetamol', brand: 'Square', category: 'OTC Medicine', unit: 'Strip', strength: '665 mg', dosageForm: 'tablet', minStockLevel: 40 },
  { name: 'Paracetamol 500', generic: 'Paracetamol', brand: 'Incepta', category: 'OTC Medicine', unit: 'Strip', strength: '500 mg', dosageForm: 'tablet', minStockLevel: 50 },
  { name: 'Fast 500', generic: 'Paracetamol', brand: 'Incepta', category: 'OTC Medicine', unit: 'Strip', strength: '500 mg', dosageForm: 'tablet', minStockLevel: 50 },
  { name: 'Renap 500', generic: 'Paracetamol', brand: 'Incepta', category: 'OTC Medicine', unit: 'Strip', strength: '500 mg', dosageForm: 'tablet', minStockLevel: 50 },
  { name: 'Xcel 500', generic: 'Paracetamol', brand: 'Square', category: 'OTC Medicine', unit: 'Strip', strength: '500 mg', dosageForm: 'tablet', minStockLevel: 50 },
  { name: 'Reset 500', generic: 'Paracetamol', brand: 'ACI', category: 'OTC Medicine', unit: 'Strip', strength: '500 mg', dosageForm: 'tablet', minStockLevel: 50 },
  { name: 'Cetamol 500', generic: 'Paracetamol', brand: 'ACI', category: 'OTC Medicine', unit: 'Strip', strength: '500 mg', dosageForm: 'tablet', minStockLevel: 50 },
  { name: 'Pyrin 500', generic: 'Paracetamol', brand: 'Beximco', category: 'OTC Medicine', unit: 'Strip', strength: '500 mg', dosageForm: 'tablet', minStockLevel: 50 },
  { name: 'Parasitamol 500', generic: 'Paracetamol', brand: 'ACI', category: 'OTC Medicine', unit: 'Strip', strength: '500 mg', dosageForm: 'tablet', minStockLevel: 50 },
  { name: 'Tylenol 500', generic: 'Paracetamol', brand: 'Incepta', category: 'OTC Medicine', unit: 'Strip', strength: '500 mg', dosageForm: 'tablet', minStockLevel: 50 },
  { name: 'Fevernil 500', generic: 'Paracetamol', brand: 'Square', category: 'OTC Medicine', unit: 'Strip', strength: '500 mg', dosageForm: 'tablet', minStockLevel: 50 },

  // OMEPRAZOLE — 10 items
  { name: 'Seclo 20', generic: 'Omeprazole', brand: 'Square', category: 'Prescription', unit: 'Strip', strength: '20 mg', dosageForm: 'capsule', minStockLevel: 30 },
  { name: 'Seclo 40', generic: 'Omeprazole', brand: 'Square', category: 'Prescription', unit: 'Strip', strength: '40 mg', dosageForm: 'capsule', minStockLevel: 20 },
  { name: 'Losec 20', generic: 'Omeprazole', brand: 'Beximco', category: 'Prescription', unit: 'Strip', strength: '20 mg', dosageForm: 'capsule', minStockLevel: 30 },
  { name: 'Omez 20', generic: 'Omeprazole', brand: 'Incepta', category: 'Prescription', unit: 'Strip', strength: '20 mg', dosageForm: 'capsule', minStockLevel: 30 },
  { name: 'Ometop 20', generic: 'Omeprazole', brand: 'ACI', category: 'Prescription', unit: 'Strip', strength: '20 mg', dosageForm: 'capsule', minStockLevel: 30 },
  { name: 'Gastro 20', generic: 'Omeprazole', brand: 'Square', category: 'Prescription', unit: 'Strip', strength: '20 mg', dosageForm: 'capsule', minStockLevel: 30 },
  { name: 'Opal 20', generic: 'Omeprazole', brand: 'Incepta', category: 'Prescription', unit: 'Strip', strength: '20 mg', dosageForm: 'capsule', minStockLevel: 30 },
  { name: 'Prazole 20', generic: 'Omeprazole', brand: 'ACI', category: 'Prescription', unit: 'Strip', strength: '20 mg', dosageForm: 'capsule', minStockLevel: 30 },
  { name: 'Omap 20', generic: 'Omeprazole', brand: 'Beximco', category: 'Prescription', unit: 'Strip', strength: '20 mg', dosageForm: 'capsule', minStockLevel: 30 },
  { name: 'Gastrocon 20', generic: 'Omeprazole', brand: 'Square', category: 'Prescription', unit: 'Strip', strength: '20 mg', dosageForm: 'capsule', minStockLevel: 30 },

  // ESOMEPRAZOLE — 8 items
  { name: 'Maxpro 20', generic: 'Esomeprazole', brand: 'Incepta', category: 'Prescription', unit: 'Strip', strength: '20 mg', dosageForm: 'tablet', minStockLevel: 30 },
  { name: 'Maxpro 40', generic: 'Esomeprazole', brand: 'Incepta', category: 'Prescription', unit: 'Strip', strength: '40 mg', dosageForm: 'tablet', minStockLevel: 20 },
  { name: 'Nexum 20', generic: 'Esomeprazole', brand: 'Square', category: 'Prescription', unit: 'Strip', strength: '20 mg', dosageForm: 'tablet', minStockLevel: 30 },
  { name: 'Nexum 40', generic: 'Esomeprazole', brand: 'Square', category: 'Prescription', unit: 'Strip', strength: '40 mg', dosageForm: 'tablet', minStockLevel: 20 },
  { name: 'Sompraz 20', generic: 'Esomeprazole', brand: 'ACI', category: 'Prescription', unit: 'Strip', strength: '20 mg', dosageForm: 'tablet', minStockLevel: 30 },
  { name: 'Eso 20', generic: 'Esomeprazole', brand: 'Beximco', category: 'Prescription', unit: 'Strip', strength: '20 mg', dosageForm: 'tablet', minStockLevel: 30 },
  { name: 'Esotid 20', generic: 'Esomeprazole', brand: 'Incepta', category: 'Prescription', unit: 'Strip', strength: '20 mg', dosageForm: 'tablet', minStockLevel: 30 },
  { name: 'Esogaster 20', generic: 'Esomeprazole', brand: 'Square', category: 'Prescription', unit: 'Strip', strength: '20 mg', dosageForm: 'tablet', minStockLevel: 30 },

  // CETIRIZINE — 8 items
  { name: 'Cetirizine 10', generic: 'Cetirizine', brand: 'Square', category: 'OTC Medicine', unit: 'Strip', strength: '10 mg', dosageForm: 'tablet', minStockLevel: 40 },
  { name: 'Alatrol 10', generic: 'Cetirizine', brand: 'Square', category: 'OTC Medicine', unit: 'Strip', strength: '10 mg', dosageForm: 'tablet', minStockLevel: 40 },
  { name: 'Zyrtec 10', generic: 'Cetirizine', brand: 'Beximco', category: 'OTC Medicine', unit: 'Strip', strength: '10 mg', dosageForm: 'tablet', minStockLevel: 40 },
  { name: 'Rhinil 10', generic: 'Cetirizine', brand: 'Incepta', category: 'OTC Medicine', unit: 'Strip', strength: '10 mg', dosageForm: 'tablet', minStockLevel: 40 },
  { name: 'Histacin 10', generic: 'Cetirizine', brand: 'ACI', category: 'OTC Medicine', unit: 'Strip', strength: '10 mg', dosageForm: 'tablet', minStockLevel: 40 },
  { name: 'Cetrin 10', generic: 'Cetirizine', brand: 'Square', category: 'OTC Medicine', unit: 'Strip', strength: '10 mg', dosageForm: 'tablet', minStockLevel: 40 },
  { name: 'Allerfree 10', generic: 'Cetirizine', brand: 'Incepta', category: 'OTC Medicine', unit: 'Strip', strength: '10 mg', dosageForm: 'tablet', minStockLevel: 40 },
  { name: 'Alerza 10', generic: 'Cetirizine', brand: 'Beximco', category: 'OTC Medicine', unit: 'Strip', strength: '10 mg', dosageForm: 'tablet', minStockLevel: 40 },

  // AMOXICILLIN — 8 items
  { name: 'Amoxil 500', generic: 'Amoxicillin', brand: 'Beximco', category: 'Prescription', unit: 'Capsule', strength: '500 mg', dosageForm: 'capsule', minStockLevel: 30 },
  { name: 'Amoxil 250', generic: 'Amoxicillin', brand: 'Beximco', category: 'Prescription', unit: 'Capsule', strength: '250 mg', dosageForm: 'capsule', minStockLevel: 30 },
  { name: 'Moxacil 500', generic: 'Amoxicillin', brand: 'Square', category: 'Prescription', unit: 'Capsule', strength: '500 mg', dosageForm: 'capsule', minStockLevel: 30 },
  { name: 'Amoxy 500', generic: 'Amoxicillin', brand: 'Incepta', category: 'Prescription', unit: 'Capsule', strength: '500 mg', dosageForm: 'capsule', minStockLevel: 30 },
  { name: 'Amoxin 500', generic: 'Amoxicillin', brand: 'ACI', category: 'Prescription', unit: 'Capsule', strength: '500 mg', dosageForm: 'capsule', minStockLevel: 30 },
  { name: 'Bactocil 500', generic: 'Amoxicillin', brand: 'Square', category: 'Prescription', unit: 'Capsule', strength: '500 mg', dosageForm: 'capsule', minStockLevel: 30 },
  { name: 'Amocil 500', generic: 'Amoxicillin', brand: 'Beximco', category: 'Prescription', unit: 'Capsule', strength: '500 mg', dosageForm: 'capsule', minStockLevel: 30 },
  { name: 'Moxilin 500', generic: 'Amoxicillin', brand: 'Incepta', category: 'Prescription', unit: 'Capsule', strength: '500 mg', dosageForm: 'capsule', minStockLevel: 30 },

  // AZITHROMYCIN — 8 items
  { name: 'Zimax 500', generic: 'Azithromycin', brand: 'Square', category: 'Prescription', unit: 'Strip', strength: '500 mg', dosageForm: 'tablet', minStockLevel: 20 },
  { name: 'Zimax 250', generic: 'Azithromycin', brand: 'Square', category: 'Prescription', unit: 'Strip', strength: '250 mg', dosageForm: 'tablet', minStockLevel: 20 },
  { name: 'Azithral 500', generic: 'Azithromycin', brand: 'Beximco', category: 'Prescription', unit: 'Strip', strength: '500 mg', dosageForm: 'tablet', minStockLevel: 20 },
  { name: 'Azomax 500', generic: 'Azithromycin', brand: 'Incepta', category: 'Prescription', unit: 'Strip', strength: '500 mg', dosageForm: 'tablet', minStockLevel: 20 },
  { name: 'Zithrocin 500', generic: 'Azithromycin', brand: 'ACI', category: 'Prescription', unit: 'Strip', strength: '500 mg', dosageForm: 'tablet', minStockLevel: 20 },
  { name: 'Azee 500', generic: 'Azithromycin', brand: 'Square', category: 'Prescription', unit: 'Strip', strength: '500 mg', dosageForm: 'tablet', minStockLevel: 20 },
  { name: 'Zomycin 500', generic: 'Azithromycin', brand: 'Beximco', category: 'Prescription', unit: 'Strip', strength: '500 mg', dosageForm: 'tablet', minStockLevel: 20 },
  { name: 'Azithro 500', generic: 'Azithromycin', brand: 'Incepta', category: 'Prescription', unit: 'Strip', strength: '500 mg', dosageForm: 'tablet', minStockLevel: 20 },

  // METRONIDAZOLE — 6 items
  { name: 'Flagyl 400', generic: 'Metronidazole', brand: 'Square', category: 'Prescription', unit: 'Strip', strength: '400 mg', dosageForm: 'tablet', minStockLevel: 30 },
  { name: 'Metro 400', generic: 'Metronidazole', brand: 'Beximco', category: 'Prescription', unit: 'Strip', strength: '400 mg', dosageForm: 'tablet', minStockLevel: 30 },
  { name: 'Metronid 400', generic: 'Metronidazole', brand: 'Incepta', category: 'Prescription', unit: 'Strip', strength: '400 mg', dosageForm: 'tablet', minStockLevel: 30 },
  { name: 'Metrocin 400', generic: 'Metronidazole', brand: 'ACI', category: 'Prescription', unit: 'Strip', strength: '400 mg', dosageForm: 'tablet', minStockLevel: 30 },
  { name: 'Flagyl 200', generic: 'Metronidazole', brand: 'Square', category: 'Prescription', unit: 'Strip', strength: '200 mg', dosageForm: 'tablet', minStockLevel: 30 },
  { name: 'Metronidazole 400', generic: 'Metronidazole', brand: 'Beximco', category: 'Prescription', unit: 'Strip', strength: '400 mg', dosageForm: 'tablet', minStockLevel: 30 },

  // CEFIXIME — 6 items
  { name: 'Cef-3 200', generic: 'Cefixime', brand: 'Square', category: 'Prescription', unit: 'Capsule', strength: '200 mg', dosageForm: 'capsule', minStockLevel: 20 },
  { name: 'Cef-3 400', generic: 'Cefixime', brand: 'Square', category: 'Prescription', unit: 'Capsule', strength: '400 mg', dosageForm: 'capsule', minStockLevel: 20 },
  { name: 'Cefix 200', generic: 'Cefixime', brand: 'Beximco', category: 'Prescription', unit: 'Capsule', strength: '200 mg', dosageForm: 'capsule', minStockLevel: 20 },
  { name: 'Cefim 200', generic: 'Cefixime', brand: 'Incepta', category: 'Prescription', unit: 'Capsule', strength: '200 mg', dosageForm: 'capsule', minStockLevel: 20 },
  { name: 'Cefixime 200', generic: 'Cefixime', brand: 'ACI', category: 'Prescription', unit: 'Capsule', strength: '200 mg', dosageForm: 'capsule', minStockLevel: 20 },
  { name: 'Xime 200', generic: 'Cefixime', brand: 'Square', category: 'Prescription', unit: 'Capsule', strength: '200 mg', dosageForm: 'capsule', minStockLevel: 20 },

  // MONTELUKAST — 6 items
  { name: 'Monas 10', generic: 'Montelukast', brand: 'Square', category: 'Prescription', unit: 'Strip', strength: '10 mg', dosageForm: 'tablet', minStockLevel: 25 },
  { name: 'Monas 5', generic: 'Montelukast', brand: 'Square', category: 'Prescription', unit: 'Strip', strength: '5 mg', dosageForm: 'tablet', minStockLevel: 25 },
  { name: 'Montair 10', generic: 'Montelukast', brand: 'Beximco', category: 'Prescription', unit: 'Strip', strength: '10 mg', dosageForm: 'tablet', minStockLevel: 25 },
  { name: 'Montel 10', generic: 'Montelukast', brand: 'Incepta', category: 'Prescription', unit: 'Strip', strength: '10 mg', dosageForm: 'tablet', minStockLevel: 25 },
  { name: 'Montek 10', generic: 'Montelukast', brand: 'ACI', category: 'Prescription', unit: 'Strip', strength: '10 mg', dosageForm: 'tablet', minStockLevel: 25 },
  { name: 'Airmont 10', generic: 'Montelukast', brand: 'Square', category: 'Prescription', unit: 'Strip', strength: '10 mg', dosageForm: 'tablet', minStockLevel: 25 },

  // FEXOFENADINE — 5 items
  { name: 'Fexo 120', generic: 'Fexofenadine', brand: 'Square', category: 'OTC Medicine', unit: 'Strip', strength: '120 mg', dosageForm: 'tablet', minStockLevel: 30 },
  { name: 'Fexo 180', generic: 'Fexofenadine', brand: 'Square', category: 'OTC Medicine', unit: 'Strip', strength: '180 mg', dosageForm: 'tablet', minStockLevel: 30 },
  { name: 'Allegra 120', generic: 'Fexofenadine', brand: 'Beximco', category: 'OTC Medicine', unit: 'Strip', strength: '120 mg', dosageForm: 'tablet', minStockLevel: 30 },
  { name: 'Fexofast 120', generic: 'Fexofenadine', brand: 'Incepta', category: 'OTC Medicine', unit: 'Strip', strength: '120 mg', dosageForm: 'tablet', minStockLevel: 30 },
  { name: 'Fexoral 120', generic: 'Fexofenadine', brand: 'ACI', category: 'OTC Medicine', unit: 'Strip', strength: '120 mg', dosageForm: 'tablet', minStockLevel: 30 },

  // VITAMINS — 10 items
  { name: 'Ceevit 250', generic: 'Vitamin C', brand: 'Square', category: 'Vitamins', unit: 'Strip', strength: '250 mg', dosageForm: 'tablet', minStockLevel: 50 },
  { name: 'Ceevit 500', generic: 'Vitamin C', brand: 'Square', category: 'Vitamins', unit: 'Strip', strength: '500 mg', dosageForm: 'tablet', minStockLevel: 50 },
  { name: 'C-Vit 500', generic: 'Vitamin C', brand: 'Beximco', category: 'Vitamins', unit: 'Strip', strength: '500 mg', dosageForm: 'tablet', minStockLevel: 50 },
  { name: 'Vitamin C 500', generic: 'Vitamin C', brand: 'Incepta', category: 'Vitamins', unit: 'Strip', strength: '500 mg', dosageForm: 'tablet', minStockLevel: 50 },
  { name: 'Zinc-B', generic: 'Zinc', brand: 'Square', category: 'Vitamins', unit: 'Strip', strength: '20 mg', dosageForm: 'tablet', minStockLevel: 40 },
  { name: 'Zincat 20', generic: 'Zinc', brand: 'Incepta', category: 'Vitamins', unit: 'Strip', strength: '20 mg', dosageForm: 'tablet', minStockLevel: 40 },
  { name: 'Calcium-D', generic: 'Calcium', brand: 'Square', category: 'Vitamins', unit: 'Strip', strength: '500 mg', dosageForm: 'tablet', minStockLevel: 40 },
  { name: 'Calbo-D', generic: 'Calcium', brand: 'Beximco', category: 'Vitamins', unit: 'Strip', strength: '500 mg', dosageForm: 'tablet', minStockLevel: 40 },
  { name: 'Iron Plus', generic: 'Iron', brand: 'Incepta', category: 'Vitamins', unit: 'Strip', strength: '200 mg', dosageForm: 'tablet', minStockLevel: 40 },
  { name: 'Multivitamin', generic: 'Multivitamin', brand: 'ACI', category: 'Vitamins', unit: 'Strip', strength: 'Standard', dosageForm: 'tablet', minStockLevel: 40 },

  // ANTIHYPERTENSIVE — 8 items
  { name: 'Amlopin 5', generic: 'Amlodipine', brand: 'Square', category: 'Cardiovascular', unit: 'Strip', strength: '5 mg', dosageForm: 'tablet', minStockLevel: 30 },
  { name: 'Amlopin 10', generic: 'Amlodipine', brand: 'Square', category: 'Cardiovascular', unit: 'Strip', strength: '10 mg', dosageForm: 'tablet', minStockLevel: 30 },
  { name: 'Amlodac 5', generic: 'Amlodipine', brand: 'Beximco', category: 'Cardiovascular', unit: 'Strip', strength: '5 mg', dosageForm: 'tablet', minStockLevel: 30 },
  { name: 'Losartan 50', generic: 'Losartan', brand: 'Incepta', category: 'Cardiovascular', unit: 'Strip', strength: '50 mg', dosageForm: 'tablet', minStockLevel: 30 },
  { name: 'Osartil 50', generic: 'Losartan', brand: 'Square', category: 'Cardiovascular', unit: 'Strip', strength: '50 mg', dosageForm: 'tablet', minStockLevel: 30 },
  { name: 'Bisocor 5', generic: 'Bisoprolol', brand: 'Square', category: 'Cardiovascular', unit: 'Strip', strength: '5 mg', dosageForm: 'tablet', minStockLevel: 30 },
  { name: 'Metocard 50', generic: 'Metoprolol', brand: 'Beximco', category: 'Cardiovascular', unit: 'Strip', strength: '50 mg', dosageForm: 'tablet', minStockLevel: 30 },
  { name: 'Atenolol 50', generic: 'Atenolol', brand: 'Incepta', category: 'Cardiovascular', unit: 'Strip', strength: '50 mg', dosageForm: 'tablet', minStockLevel: 30 },

  // DIABETES — 8 items
  { name: 'Metformin 500', generic: 'Metformin', brand: 'Square', category: 'Diabetes', unit: 'Strip', strength: '500 mg', dosageForm: 'tablet', minStockLevel: 40 },
  { name: 'Metformin 850', generic: 'Metformin', brand: 'Square', category: 'Diabetes', unit: 'Strip', strength: '850 mg', dosageForm: 'tablet', minStockLevel: 40 },
  { name: 'Glucomet 500', generic: 'Metformin', brand: 'Beximco', category: 'Diabetes', unit: 'Strip', strength: '500 mg', dosageForm: 'tablet', minStockLevel: 40 },
  { name: 'Glucophage 500', generic: 'Metformin', brand: 'Incepta', category: 'Diabetes', unit: 'Strip', strength: '500 mg', dosageForm: 'tablet', minStockLevel: 40 },
  { name: 'Gliclazide 80', generic: 'Gliclazide', brand: 'Square', category: 'Diabetes', unit: 'Strip', strength: '80 mg', dosageForm: 'tablet', minStockLevel: 30 },
  { name: 'Diamicron 80', generic: 'Gliclazide', brand: 'Beximco', category: 'Diabetes', unit: 'Strip', strength: '80 mg', dosageForm: 'tablet', minStockLevel: 30 },
  { name: 'Sitagliptin 100', generic: 'Sitagliptin', brand: 'Incepta', category: 'Diabetes', unit: 'Strip', strength: '100 mg', dosageForm: 'tablet', minStockLevel: 20 },
  { name: 'Januvia 100', generic: 'Sitagliptin', brand: 'Square', category: 'Diabetes', unit: 'Strip', strength: '100 mg', dosageForm: 'tablet', minStockLevel: 20 }
];

async function bulkImport() {
  try {
    console.log('🔄 Connecting to MongoDB Atlas...');
    await mongoose.connect(env.MONGODB_URI);
    console.log('✅ Connected\n');

    // Load relations
    const generics = {};
    (await Generic.find()).forEach(g => { generics[g.name] = g._id; });

    const brands = {};
    (await Brand.find()).forEach(b => { brands[b.name] = b._id; });

    const categories = {};
    (await Category.find()).forEach(c => { categories[c.name] = c._id; });

    const units = {};
    (await Unit.find()).forEach(u => { units[u.name] = u._id; });

    console.log('📚 Relations loaded:');
    console.log(`   Generics:   ${Object.keys(generics).length}`);
    console.log(`   Brands:     ${Object.keys(brands).length}`);
    console.log(`   Categories: ${Object.keys(categories).length}`);
    console.log(`   Units:      ${Object.keys(units).length}\n`);

    console.log(`📦 Processing ${medicinesData.length} medicines...\n`);

    let created = 0;
    let skipped = 0;
    let failed = 0;

    for (const m of medicinesData) {
      const exists = await Medicine.findOne({ name: m.name });
      if (exists) {
        skipped++;
        continue;
      }

      const genericId = generics[m.generic];
      const brandId = brands[m.brand];
      const categoryId = categories[m.category];
      const unitId = units[m.unit];

      if (!genericId || !categoryId || !unitId) {
        console.log(`   ❌ Missing relations: ${m.name}`);
        failed++;
        continue;
      }

      // ✅ Get image URL and publicId
      const imageUrl = getImageUrl(m.dosageForm);
      const publicId = getPublicId(m.dosageForm);

      try {
        await Medicine.create({
          name: m.name,
          generic: genericId,
          brand: brandId || null,
          category: categoryId,
          unit: unitId,
          strength: m.strength,
          dosageForm: m.dosageForm,
          minStockLevel: m.minStockLevel,
          barcode: null,
          sku: null,
          // ✅ Cloudinary image
          image: {
            url: imageUrl,
            publicId: publicId
          },
          prescriptionRequired: m.category === 'Prescription',
          description: `${m.name} - ${m.generic} (${m.strength})`,
          manufacturer: '',
          storageCondition: '',
          status: 'active',
          createdBy: null
        });
        console.log(`   ✓ ${m.name} (${m.dosageForm})`);
        created++;
      } catch (e) {
        console.log(`   ❌ Failed: ${m.name} — ${e.message}`);
        failed++;
      }
    }

    const total = await Medicine.countDocuments();

    console.log('\n========================================');
    console.log(`✅ Bulk import complete!`);
    console.log(`   Created:  ${created}`);
    console.log(`   Skipped:  ${skipped}`);
    console.log(`   Failed:   ${failed}`);
    console.log(`   Total:    ${total}`);
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

bulkImport();