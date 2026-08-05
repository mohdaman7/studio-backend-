"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRepository = exports.auditLogRepository = exports.brandRepository = exports.categoryRepository = exports.stockLedgerRepository = exports.expenseRepository = exports.supplierRepository = exports.customerRepository = exports.productRepository = exports.purchaseRepository = exports.saleRepository = void 0;
const base_repository_1 = require("./base.repository");
const Sale_model_1 = require("../models/Sale.model");
const Purchase_model_1 = require("../models/Purchase.model");
const Product_model_1 = require("../models/Product.model");
const Customer_model_1 = require("../models/Customer.model");
const Supplier_model_1 = require("../models/Supplier.model");
const Expense_model_1 = require("../models/Expense.model");
const StockLedger_model_1 = require("../models/StockLedger.model");
const Category_model_1 = require("../models/Category.model");
const Brand_model_1 = require("../models/Brand.model");
const AuditLog_model_1 = require("../models/AuditLog.model");
const User_model_1 = require("../models/User.model");
const mongoose_1 = __importDefault(require("mongoose"));
const date_fns_1 = require("date-fns");
// ─── Extended Sale Repository ───────────────────────────────────────────────
class SaleRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(Sale_model_1.Sale);
    }
    async getDailySales(days = 7, branchId) {
        const since = (0, date_fns_1.subDays)(new Date(), days - 1);
        const matchStage = {
            saleDate: { $gte: (0, date_fns_1.startOfDay)(since) },
            status: 'completed',
        };
        if (branchId)
            matchStage.branchId = new mongoose_1.default.Types.ObjectId(branchId);
        return this.model.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$saleDate' } },
                    totalAmount: { $sum: '$grandTotal' },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);
    }
    async getSalesSummary(startDate, endDate) {
        return this.model.aggregate([
            {
                $match: {
                    saleDate: { $gte: startDate, $lte: endDate },
                    status: 'completed',
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$saleDate' } },
                    totalAmount: { $sum: '$grandTotal' },
                    totalTax: { $sum: '$taxTotal' },
                    totalDiscount: { $sum: '$discount' },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);
    }
    async getTopProducts(startDate, endDate, limit = 10) {
        return this.model.aggregate([
            {
                $match: {
                    saleDate: { $gte: startDate, $lte: endDate },
                    status: 'completed',
                },
            },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.productId',
                    totalQty: { $sum: '$items.quantity' },
                    totalRevenue: { $sum: '$items.totalAmount' },
                },
            },
            { $sort: { totalRevenue: -1 } },
            { $limit: limit },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'product',
                },
            },
            { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 1,
                    productName: '$product.name',
                    sku: '$product.sku',
                    totalQty: 1,
                    totalRevenue: 1,
                },
            },
        ]);
    }
    async getPaymentMethodBreakdown(startDate, endDate) {
        return this.model.aggregate([
            {
                $match: {
                    saleDate: { $gte: startDate, $lte: endDate },
                    status: 'completed',
                },
            },
            {
                $group: {
                    _id: '$paymentMethod',
                    total: { $sum: '$grandTotal' },
                    count: { $sum: 1 },
                },
            },
        ]);
    }
}
// ─── Extended Purchase Repository ────────────────────────────────────────────
class PurchaseRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(Purchase_model_1.Purchase);
    }
}
// ─── Extended Product Repository ─────────────────────────────────────────────
class ProductRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(Product_model_1.Product);
    }
    async findByBarcode(barcode) {
        return this.model.findOne({ barcode }).exec();
    }
    async findBySku(sku, companyId) {
        return this.model.findOne({ sku, companyId }).exec();
    }
    async getLowStockProducts(companyId, branchId) {
        const filter = {
            companyId,
            isActive: true,
            hasVariants: false,
            $expr: { $lte: ['$stock', '$lowStockAlert'] },
        };
        return this.model.find(filter).populate('categoryId brandId').exec();
    }
    async adjustStock(productId, qty) {
        return this.model.findByIdAndUpdate(productId, { $inc: { stock: qty } }, { new: true }).exec();
    }
}
// ─── Extended Customer Repository ────────────────────────────────────────────
class CustomerRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(Customer_model_1.Customer);
    }
}
// ─── Extended Supplier Repository ────────────────────────────────────────────
class SupplierRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(Supplier_model_1.Supplier);
    }
}
// ─── Extended Expense Repository ─────────────────────────────────────────────
class ExpenseRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(Expense_model_1.Expense);
    }
    async getExpenseSummary(startDate, endDate) {
        return this.model.aggregate([
            {
                $match: {
                    date: { $gte: startDate, $lte: endDate },
                },
            },
            {
                $group: {
                    _id: '$category',
                    totalAmount: { $sum: '$amount' },
                    count: { $sum: 1 },
                },
            },
            { $sort: { totalAmount: -1 } },
        ]);
    }
}
// ─── Extended StockLedger Repository ─────────────────────────────────────────
class StockLedgerRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(StockLedger_model_1.StockLedger);
    }
    async createEntry(data) {
        return this.create(data);
    }
}
// ─── Extended Category Repository ────────────────────────────────────────────
class CategoryRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(Category_model_1.Category);
    }
}
// ─── Extended Brand Repository ────────────────────────────────────────────────
class BrandRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(Brand_model_1.Brand);
    }
}
// ─── Extended AuditLog Repository ────────────────────────────────────────────
class AuditLogRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(AuditLog_model_1.AuditLog);
    }
}
// ─── Extended User Repository ─────────────────────────────────────────────────
class UserRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(User_model_1.User);
    }
    async findByEmail(email) {
        return this.model.findOne({ email }).exec();
    }
}
// ─── Singleton Exports ────────────────────────────────────────────────────────
exports.saleRepository = new SaleRepository();
exports.purchaseRepository = new PurchaseRepository();
exports.productRepository = new ProductRepository();
exports.customerRepository = new CustomerRepository();
exports.supplierRepository = new SupplierRepository();
exports.expenseRepository = new ExpenseRepository();
exports.stockLedgerRepository = new StockLedgerRepository();
exports.categoryRepository = new CategoryRepository();
exports.brandRepository = new BrandRepository();
exports.auditLogRepository = new AuditLogRepository();
exports.userRepository = new UserRepository();
