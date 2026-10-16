// src/services/report.service.js
// ⭐ REPORT SERVICE — Dashboard + Reports

const mongoose = require('mongoose');
const {
  Sale,
  SaleItem,
  Purchase,
  PurchaseItem,
  Batch,
  Medicine,
  Customer,
  Supplier,
  Expense,
  Category,
  Payment
} = require('../models');

class ReportService {
  async getDashboard(query) {
    const { branch, date } = query;
    const targetDate = date ? new Date(date) : new Date();

    const todayStart = new Date(targetDate);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(targetDate);
    todayEnd.setHours(23, 59, 59, 999);

    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const yesterdayEnd = new Date(todayEnd);
    yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);

    const baseFilter = { status: { $ne: 'cancelled' } };
    if (branch) baseFilter.branch = new mongoose.Types.ObjectId(branch);

    const todaySales = await Sale.aggregate([
      { $match: { ...baseFilter, saleDate: { $gte: todayStart, $lte: todayEnd } } },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' },
          profit: { $sum: '$totalProfit' },
          cost: { $sum: '$totalCost' },
          count: { $sum: 1 }
        }
      }
    ]);

    const yesterdaySales = await Sale.aggregate([
      { $match: { ...baseFilter, saleDate: { $gte: yesterdayStart, $lte: yesterdayEnd } } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    const todayPurchases = await Purchase.aggregate([
      {
        $match: {
          ...baseFilter,
          purchaseDate: { $gte: todayStart, $lte: todayEnd }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' },
          count: { $sum: 1 }
        }
      }
    ]);

    const inventoryValue = await Batch.aggregate([
      { $match: { ...baseFilter, status: 'active', quantity: { $gt: 0 } } },
      {
        $group: {
          _id: null,
          costValue: { $sum: { $multiply: ['$quantity', '$purchasePrice'] } },
          sellingValue: { $sum: { $multiply: ['$quantity', '$sellingPrice'] } },
          totalUnits: { $sum: '$quantity' },
          batchCount: { $sum: 1 }
        }
      }
    ]);

    const sevenDaysAgo = new Date(todayStart);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const salesChart = await Sale.aggregate([
      {
        $match: {
          ...baseFilter,
          saleDate: { $gte: sevenDaysAgo, $lte: todayEnd }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$saleDate' } },
          total: { $sum: '$total' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const purchaseChart = await Purchase.aggregate([
      {
        $match: {
          ...baseFilter,
          purchaseDate: { $gte: sevenDaysAgo, $lte: todayEnd }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$purchaseDate' } },
          total: { $sum: '$total' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const salesByCategory = await SaleItem.aggregate([
      {
        $lookup: {
          from: 'sales',
          localField: 'sale',
          foreignField: '_id',
          as: 'saleDoc'
        }
      },
      { $unwind: '$saleDoc' },
      {
        $match: {
          'saleDoc.saleDate': { $gte: todayStart, $lte: todayEnd },
          'saleDoc.status': { $ne: 'cancelled' },
          ...(branch ? { 'saleDoc.branch': new mongoose.Types.ObjectId(branch) } : {})
        }
      },
      {
        $lookup: {
          from: 'medicines',
          localField: 'medicine',
          foreignField: '_id',
          as: 'medicineDoc'
        }
      },
      { $unwind: '$medicineDoc' },
      {
        $lookup: {
          from: 'categories',
          localField: 'medicineDoc.category',
          foreignField: '_id',
          as: 'categoryDoc'
        }
      },
      { $unwind: '$categoryDoc' },
      {
        $group: {
          _id: '$categoryDoc.name',
          total: { $sum: '$total' },
          quantity: { $sum: '$quantity' }
        }
      },
      { $sort: { total: -1 } }
    ]);

    const recentTransactions = await Sale.find({
      ...baseFilter,
      saleDate: { $gte: todayStart, $lte: todayEnd }
    })
      .select('invoiceNumber customerName total paymentStatus saleDate')
      .sort('-createdAt')
      .limit(5)
      .lean();

    const topSellingMedicines = await SaleItem.aggregate([
      {
        $lookup: {
          from: 'sales',
          localField: 'sale',
          foreignField: '_id',
          as: 'saleDoc'
        }
      },
      { $unwind: '$saleDoc' },
      {
        $match: {
          'saleDoc.saleDate': { $gte: todayStart, $lte: todayEnd },
          'saleDoc.status': { $ne: 'cancelled' },
          ...(branch ? { 'saleDoc.branch': new mongoose.Types.ObjectId(branch) } : {})
        }
      },
      {
        $group: {
          _id: '$medicine',
          medicineName: { $first: '$medicineName' },
          strength: { $first: '$strength' },
          quantity: { $sum: '$quantity' },
          total: { $sum: '$total' }
        }
      },
      { $sort: { quantity: -1 } },
      { $limit: 10 }
    ]);

    const todayExpenses = await Expense.aggregate([
      {
        $match: {
          ...baseFilter,
          date: { $gte: todayStart, $lte: todayEnd }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const todaySalesData = todaySales[0] || { total: 0, profit: 0, cost: 0, count: 0 };
    const yesterdaySalesData = yesterdaySales[0] || { total: 0 };
    const todayPurchasesData = todayPurchases[0] || { total: 0, count: 0 };
    const inventoryData = inventoryValue[0] || { costValue: 0, sellingValue: 0, totalUnits: 0, batchCount: 0 };
    const todayExpensesData = todayExpenses[0] || { total: 0 };

    const salesChange =
      yesterdaySalesData.total > 0
        ? (((todaySalesData.total - yesterdaySalesData.total) / yesterdaySalesData.total) * 100).toFixed(1)
        : 0;

    const netProfit = todaySalesData.profit - todayExpensesData.total;
    const netMargin =
      todaySalesData.total > 0 ? ((netProfit / todaySalesData.total) * 100).toFixed(1) : 0;

    return {
      todaySales: {
        total: todaySalesData.total,
        count: todaySalesData.count,
        changePercent: parseFloat(salesChange)
      },
      todayPurchases: {
        total: todayPurchasesData.total,
        count: todayPurchasesData.count
      },
      todayProfit: {
        grossProfit: todaySalesData.profit,
        expenses: todayExpensesData.total,
        netProfit: netProfit,
        netMargin: parseFloat(netMargin)
      },
      inventoryValue: {
        costValue: inventoryData.costValue,
        sellingValue: inventoryData.sellingValue,
        potentialProfit: inventoryData.sellingValue - inventoryData.costValue,
        totalUnits: inventoryData.totalUnits,
        batchCount: inventoryData.batchCount
      },
      salesVsPurchases: {
        sales: salesChart,
        purchases: purchaseChart
      },
      salesByCategory,
      recentTransactions,
      topSellingMedicines
    };
  }

  async getSalesReport(query) {
    const { branch, startDate, endDate, groupBy = 'day' } = query;
    const match = { status: { $ne: 'cancelled' } };
    if (branch) match.branch = new mongoose.Types.ObjectId(branch);

    if (startDate || endDate) {
      match.saleDate = {};
      if (startDate) match.saleDate.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        match.saleDate.$lte = end;
      }
    } else {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 30);
      match.saleDate = { $gte: start, $lte: end };
    }

    let dateFormat = '%Y-%m-%d';
    if (groupBy === 'month') dateFormat = '%Y-%m';
    else if (groupBy === 'week') dateFormat = '%Y-W%V';
    else if (groupBy === 'year') dateFormat = '%Y';

    const data = await Sale.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: '$saleDate' } },
          sales: { $sum: '$total' },
          cost: { $sum: '$totalCost' },
          profit: { $sum: '$totalProfit' },
          discount: { $sum: '$discount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const summary = data.reduce(
      (acc, d) => ({
        totalSales: acc.totalSales + d.sales,
        totalCost: acc.totalCost + d.cost,
        totalProfit: acc.totalProfit + d.profit,
        totalDiscount: acc.totalDiscount + d.discount,
        totalOrders: acc.totalOrders + d.count
      }),
      { totalSales: 0, totalCost: 0, totalProfit: 0, totalDiscount: 0, totalOrders: 0 }
    );

    return { data, summary };
  }

  async getSalesByProduct(query) {
    const { branch, startDate, endDate, limit = 20 } = query;
    const match = { 'saleDoc.status': { $ne: 'cancelled' } };
    if (branch) match['saleDoc.branch'] = new mongoose.Types.ObjectId(branch);

    if (startDate || endDate) {
      match['saleDoc.saleDate'] = {};
      if (startDate) match['saleDoc.saleDate'].$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        match['saleDoc.saleDate'].$lte = end;
      }
    }

    const data = await SaleItem.aggregate([
      { $lookup: { from: 'sales', localField: 'sale', foreignField: '_id', as: 'saleDoc' } },
      { $unwind: '$saleDoc' },
      { $match: match },
      {
        $group: {
          _id: '$medicine',
          medicineName: { $first: '$medicineName' },
          strength: { $first: '$strength' },
          medicineImage: { $first: '$medicineImage' },
          totalQuantity: { $sum: '$quantity' },
          totalSales: { $sum: '$total' },
          totalCost: { $sum: { $multiply: ['$quantity', '$costPrice'] } },
          totalProfit: { $sum: '$profit' }
        }
      },
      { $sort: { totalSales: -1 } },
      { $limit: parseInt(limit) }
    ]);

    return { data };
  }

  async getSalesByCategory(query) {
    const { branch, startDate, endDate } = query;
    const match = { 'saleDoc.status': { $ne: 'cancelled' } };
    if (branch) match['saleDoc.branch'] = new mongoose.Types.ObjectId(branch);

    if (startDate || endDate) {
      match['saleDoc.saleDate'] = {};
      if (startDate) match['saleDoc.saleDate'].$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        match['saleDoc.saleDate'].$lte = end;
      }
    }

    const data = await SaleItem.aggregate([
      { $lookup: { from: 'sales', localField: 'sale', foreignField: '_id', as: 'saleDoc' } },
      { $unwind: '$saleDoc' },
      { $match: match },
      { $lookup: { from: 'medicines', localField: 'medicine', foreignField: '_id', as: 'medicineDoc' } },
      { $unwind: '$medicineDoc' },
      { $lookup: { from: 'categories', localField: 'medicineDoc.category', foreignField: '_id', as: 'categoryDoc' } },
      { $unwind: '$categoryDoc' },
      {
        $group: {
          _id: '$categoryDoc._id',
          categoryName: { $first: '$categoryDoc.name' },
          totalQuantity: { $sum: '$quantity' },
          totalSales: { $sum: '$total' },
          totalProfit: { $sum: '$profit' }
        }
      },
      { $sort: { totalSales: -1 } }
    ]);

    const totalSales = data.reduce((sum, d) => sum + d.totalSales, 0);
    const withPercent = data.map((d) => ({
      ...d,
      percentage: totalSales > 0 ? ((d.totalSales / totalSales) * 100).toFixed(1) : 0
    }));

    return { data: withPercent, totalSales };
  }

  async getSalesByUser(query) {
    const { branch, startDate, endDate } = query;
    const match = { status: { $ne: 'cancelled' } };
    if (branch) match.branch = new mongoose.Types.ObjectId(branch);

    if (startDate || endDate) {
      match.saleDate = {};
      if (startDate) match.saleDate.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        match.saleDate.$lte = end;
      }
    }

    const data = await Sale.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$createdBy',
          totalSales: { $sum: '$total' },
          totalProfit: { $sum: '$totalProfit' },
          count: { $sum: 1 }
        }
      },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      {
        $project: {
          userName: '$user.name',
          userEmail: '$user.email',
          totalSales: 1,
          totalProfit: 1,
          count: 1
        }
      },
      { $sort: { totalSales: -1 } }
    ]);

    return { data };
  }

  async getPurchaseReport(query) {
    const { branch, supplier, startDate, endDate, groupBy = 'day' } = query;
    const match = { status: { $ne: 'cancelled' } };
    if (branch) match.branch = new mongoose.Types.ObjectId(branch);
    if (supplier) match.supplier = new mongoose.Types.ObjectId(supplier);

    if (startDate || endDate) {
      match.purchaseDate = {};
      if (startDate) match.purchaseDate.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        match.purchaseDate.$lte = end;
      }
    } else {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 30);
      match.purchaseDate = { $gte: start, $lte: end };
    }

    let dateFormat = '%Y-%m-%d';
    if (groupBy === 'month') dateFormat = '%Y-%m';

    const data = await Purchase.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: '$purchaseDate' } },
          purchases: { $sum: '$total' },
          paid: { $sum: '$paidAmount' },
          due: { $sum: '$dueAmount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const summary = data.reduce(
      (acc, d) => ({
        totalPurchases: acc.totalPurchases + d.purchases,
        totalPaid: acc.totalPaid + d.paid,
        totalDue: acc.totalDue + d.due,
        totalOrders: acc.totalOrders + d.count
      }),
      { totalPurchases: 0, totalPaid: 0, totalDue: 0, totalOrders: 0 }
    );

    return { data, summary };
  }

  async getInventoryReport(query) {
    const { branch } = query;
    const match = { status: 'active' };
    if (branch) match.branch = new mongoose.Types.ObjectId(branch);

    const stockValue = await Batch.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          costValue: { $sum: { $multiply: ['$quantity', '$purchasePrice'] } },
          sellingValue: { $sum: { $multiply: ['$quantity', '$sellingPrice'] } },
          totalUnits: { $sum: '$quantity' },
          batchCount: { $sum: 1 }
        }
      }
    ]);

    const lowStock = await Batch.aggregate([
      { $match: match },
      { $group: { _id: '$medicine', totalQty: { $sum: '$quantity' } } },
      { $lookup: { from: 'medicines', localField: '_id', foreignField: '_id', as: 'medicine' } },
      { $unwind: '$medicine' },
      { $match: { $expr: { $lt: ['$totalQty', '$medicine.minStockLevel'] } } },
      { $sort: { totalQty: 1 } },
      { $limit: 50 }
    ]);

    const today = new Date();
    const in30Days = new Date();
    in30Days.setDate(today.getDate() + 30);

    const expiringSoon = await Batch.find({
      ...match,
      expiryDate: { $gte: today, $lte: in30Days },
      quantity: { $gt: 0 }
    })
      .populate('medicine', 'name strength image')
      .sort('expiryDate')
      .limit(50)
      .lean();

    const expired = await Batch.find({
      ...match,
      expiryDate: { $lt: today },
      quantity: { $gt: 0 }
    })
      .populate('medicine', 'name strength image')
      .sort('expiryDate')
      .limit(50)
      .lean();

    return {
      stockValue: stockValue[0] || { costValue: 0, sellingValue: 0, totalUnits: 0, batchCount: 0 },
      lowStock,
      expiringSoon,
      expired
    };
  }

  /**
   * ✅ Finance report — Net Income & Expenses ALWAYS last month (closed)
   * ✅ Customer Due & Supplier Due = current (all-time)
   * ✅ Ignores startDate/endDate from query
   */
  async getFinanceReport(query) {
    const { branch } = query;

    // ✅ FIXED RANGE: Last full month (closed books)
    const now = new Date();
    const firstDayLastMonth = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1,
      0, 0, 0, 0
    );
    const lastDayLastMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23, 59, 59, 999
    );

    // ✅ Last month er month name (dynamic label er jonno)
    const lastMonthLabel = firstDayLastMonth.toLocaleString('en-US', {
      month: 'long',
      year: 'numeric'
    });

    // ===== SALES (last month) =====
    const salesMatch = {
      status: { $ne: 'cancelled' },
      saleDate: { $gte: firstDayLastMonth, $lte: lastDayLastMonth }
    };
    if (branch) salesMatch.branch = new mongoose.Types.ObjectId(branch);

    const salesData = await Sale.aggregate([
      { $match: salesMatch },
      {
        $group: {
          _id: null,
          revenue: { $sum: '$total' },
          cogs: { $sum: '$totalCost' },
          grossProfit: { $sum: '$totalProfit' },
          discount: { $sum: '$discount' },
          orderCount: { $sum: 1 }
        }
      }
    ]);

    // ===== EXPENSES (last month) =====
    const expenseMatch = {
      date: { $gte: firstDayLastMonth, $lte: lastDayLastMonth }
    };
    if (branch) expenseMatch.branch = new mongoose.Types.ObjectId(branch);

    const expenseData = await Expense.aggregate([
      { $match: expenseMatch },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // ===== PAYMENTS (last month) =====
    const paymentMatch = {
      date: { $gte: firstDayLastMonth, $lte: lastDayLastMonth }
    };
    if (branch) paymentMatch.branch = new mongoose.Types.ObjectId(branch);

    const paymentData = await Payment.aggregate([
      { $match: paymentMatch },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // ✅ Customer due: current (all-time), only POSITIVE balances
    const customerDue = await Customer.aggregate([
      { $match: { status: 'active', dueBalance: { $gt: 0 } } },
      { $group: { _id: null, total: { $sum: '$dueBalance' }, count: { $sum: 1 } } }
    ]);

    // ✅ Supplier due: current (all-time), only POSITIVE balances
    const supplierDue = await Supplier.aggregate([
      { $match: { status: 'active', dueBalance: { $gt: 0 } } },
      { $group: { _id: null, total: { $sum: '$dueBalance' }, count: { $sum: 1 } } }
    ]);

    // ✅ Supplier advance (negative) separately
    const supplierAdvance = await Supplier.aggregate([
      { $match: { status: 'active', dueBalance: { $lt: 0 } } },
      {
        $group: {
          _id: null,
          total: { $sum: { $abs: '$dueBalance' } },
          count: { $sum: 1 }
        }
      }
    ]);

    const sales = salesData[0] || { revenue: 0, cogs: 0, grossProfit: 0, discount: 0, orderCount: 0 };
    const expenses = expenseData[0]?.total || 0;
    const expenseCount = expenseData[0]?.count || 0;
    const netProfit = sales.grossProfit - expenses;
    const netMargin = sales.revenue > 0 ? ((netProfit / sales.revenue) * 100).toFixed(1) : 0;

    const customerPayments = paymentData.find((p) => p._id === 'customer') || { total: 0, count: 0 };
    const supplierPayments = paymentData.find((p) => p._id === 'supplier') || { total: 0, count: 0 };

    return {
      // ✅ Period info — frontend label er jonno
      period: {
        type: 'lastMonth',
        startDate: firstDayLastMonth.toISOString(),
        endDate: lastDayLastMonth.toISOString(),
        label: lastMonthLabel
      },

      revenue: sales.revenue,
      cogs: sales.cogs,
      grossProfit: sales.grossProfit,
      expenses,
      expenseCount,
      netProfit,
      netMargin: parseFloat(netMargin),
      discount: sales.discount,
      orderCount: sales.orderCount,

      payments: {
        customer: customerPayments,
        supplier: supplierPayments
      },

      receivables: {
        customerDue: customerDue[0]?.total || 0,
        customerCount: customerDue[0]?.count || 0
      },

      payables: {
        supplierDue: supplierDue[0]?.total || 0,
        supplierCount: supplierDue[0]?.count || 0
      },

      advances: {
        supplierAdvance: supplierAdvance[0]?.total || 0,
        supplierAdvanceCount: supplierAdvance[0]?.count || 0
      }
    };
  }
}

module.exports = new ReportService();