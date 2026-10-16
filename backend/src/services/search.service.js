// src/services/search.service.js
// Global search — multi-collection

const { Medicine, Customer, Sale, Purchase, Supplier } = require('../models');

class SearchService {
  /**
   * Global search across multiple collections
   */
  async globalSearch(query, user) {
    const { q, limit = 5 } = query;

    if (!q || !q.trim()) {
      return {
        medicines: [],
        customers: [],
        sales: [],
        purchases: [],
        suppliers: []
      };
    }

    const searchRegex = { $regex: q.trim(), $options: 'i' };

    // ✅ Parallel search
    const [medicines, customers, sales, purchases, suppliers] = await Promise.all([
      // Medicines — name, generic, brand
      Medicine.find({
        status: 'active',
        $or: [
          { name: searchRegex },
          { barcode: searchRegex },
          { sku: searchRegex }
        ]
      })
        .select('name strength dosageForm barcode image totalStock minStockLevel')
        .populate('generic', 'name')
        .populate('brand', 'name')
        .limit(parseInt(limit))
        .lean(),

      // Customers — name, phone, email
      Customer.find({
        status: 'active',
        isWalkIn: { $ne: true },
        $or: [
          { name: searchRegex },
          { phone: searchRegex },
          { email: searchRegex }
        ]
      })
        .select('name phone email dueBalance')
        .limit(parseInt(limit))
        .lean(),

      // Sales — invoiceNumber, customerName
      Sale.find({
        status: { $ne: 'cancelled' },
        $or: [
          { invoiceNumber: searchRegex },
          { customerName: searchRegex }
        ]
      })
        .select('invoiceNumber customerName total paymentStatus saleDate')
        .limit(parseInt(limit))
        .sort('-createdAt')
        .lean(),

      // Purchases — invoiceNumber
      Purchase.find({
        status: { $ne: 'cancelled' },
        $or: [{ invoiceNumber: searchRegex }]
      })
        .select('invoiceNumber total paymentStatus purchaseDate')
        .populate('supplier', 'name')
        .limit(parseInt(limit))
        .sort('-createdAt')
        .lean(),

      // Suppliers — name, company, phone
      Supplier.find({
        status: 'active',
        $or: [
          { name: searchRegex },
          { company: searchRegex },
          { phone: searchRegex }
        ]
      })
        .select('name company phone dueBalance')
        .limit(parseInt(limit))
        .lean()
    ]);

    return {
      query: q.trim(),
      medicines,
      customers,
      sales,
      purchases,
      suppliers,
      totalCount:
        medicines.length +
        customers.length +
        sales.length +
        purchases.length +
        suppliers.length
    };
  }
}

module.exports = new SearchService();