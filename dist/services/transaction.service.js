"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionService = exports.TransactionService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Sale_model_1 = require("../models/Sale.model");
const Purchase_model_1 = require("../models/Purchase.model");
const CreditSale_model_1 = require("../models/CreditSale.model");
const Expense_model_1 = require("../models/Expense.model");
const Product_model_1 = require("../models/Product.model");
const StockLedger_model_1 = require("../models/StockLedger.model");
const error_middleware_1 = require("../middlewares/error.middleware");
class TransactionService {
    // ─── Sales ─────────────────────────────────────────────────────────────────
    async getAllSales(req) {
        const page = parseInt(req.query.page || '1', 10);
        const limit = parseInt(req.query.limit || '20', 10);
        const skip = (page - 1) * limit;
        const branchId = req.user?.branchId;
        const companyId = req.user?.companyId;
        const filter = {};
        if (companyId)
            filter.companyId = new mongoose_1.default.Types.ObjectId(companyId);
        if (branchId)
            filter.branchId = new mongoose_1.default.Types.ObjectId(branchId);
        if (req.query.status)
            filter.status = req.query.status;
        if (req.query.startDate || req.query.endDate) {
            filter.saleDate = {};
            if (req.query.startDate)
                filter.saleDate.$gte = new Date(req.query.startDate);
            if (req.query.endDate)
                filter.saleDate.$lte = new Date(req.query.endDate);
        }
        const [data, total] = await Promise.all([
            Sale_model_1.Sale.find(filter)
                .sort({ saleDate: -1 })
                .skip(skip)
                .limit(limit)
                .populate('customerId', 'name phone')
                .populate('cashierId', 'name')
                .lean()
                .exec(),
            Sale_model_1.Sale.countDocuments(filter).exec(),
        ]);
        return { data, total, page, limit };
    }
    async getSaleById(id) {
        const sale = await Sale_model_1.Sale.findById(id)
            .populate('customerId', 'name phone email')
            .populate('cashierId', 'name email')
            .populate('items.productId', 'name sku')
            .exec();
        if (!sale)
            throw new error_middleware_1.AppError('Sale not found', 404);
        return sale;
    }
    async createSale(input, cashierId) {
        const session = await mongoose_1.default.startSession();
        session.startTransaction();
        try {
            const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            const grandTotal = input.grandTotal || 0;
            const paidAmount = input.paidAmount || 0;
            const dueAmount = Math.max(0, grandTotal - paidAmount);
            const companyId = input.companyId;
            const branchId = input.branchId;
            // Deduct stock for each sold item
            for (const item of input.items) {
                const product = await Product_model_1.Product.findById(item.productId).session(session);
                if (!product)
                    continue;
                if (product.hasVariants && product.variants?.length) {
                    const matchedVariant = product.variants.find((v) => v.sku === item.variantSku || (v.size === item.selectedSize && v.color === item.selectedColor));
                    if (matchedVariant) {
                        matchedVariant.stock = Math.max(0, matchedVariant.stock - item.quantity);
                    }
                    product.stock = product.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
                    await product.save({ session });
                }
                else {
                    product.stock = Math.max(0, product.stock - item.quantity);
                    await product.save({ session });
                }
            }
            const [sale] = await Sale_model_1.Sale.create([{
                    companyId,
                    branchId,
                    invoiceNumber,
                    customerId: input.customerId || undefined,
                    items: input.items,
                    subtotal: input.subtotal,
                    taxTotal: input.taxTotal || 0,
                    discount: input.discount || 0,
                    couponDiscount: input.couponDiscount || 0,
                    grandTotal,
                    paidAmount,
                    dueAmount,
                    paymentMethod: input.paymentMethod,
                    notes: input.notes,
                    cashierId,
                    saleDate: input.saleDate ? new Date(input.saleDate) : new Date(),
                }], { session });
            if (input.paymentMethod === 'credit' && input.customerId) {
                await CreditSale_model_1.CreditSale.create([{
                        companyId,
                        branchId,
                        customerId: input.customerId,
                        saleId: sale._id,
                        totalCreditAmount: grandTotal,
                        paidAmount: paidAmount,
                        dueAmount: grandTotal - paidAmount,
                        dueDate: input.dueDate ? new Date(input.dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                    }], { session });
            }
            await session.commitTransaction();
            return sale;
        }
        catch (err) {
            await session.abortTransaction();
            throw err;
        }
        finally {
            session.endSession();
        }
    }
    async cancelSale(id, userId) {
        const sale = await Sale_model_1.Sale.findById(id);
        if (!sale)
            throw new error_middleware_1.AppError('Sale not found', 404);
        if (sale.status !== 'completed')
            throw new error_middleware_1.AppError('Only completed sales can be cancelled', 400);
        sale.status = 'cancelled';
        return sale.save();
    }
    // ─── Purchases ──────────────────────────────────────────────────────────────
    async getAllPurchases(req) {
        const page = parseInt(req.query.page || '1', 10);
        const limit = parseInt(req.query.limit || '20', 10);
        const skip = (page - 1) * limit;
        const companyId = req.user?.companyId;
        const filter = {};
        if (companyId)
            filter.companyId = new mongoose_1.default.Types.ObjectId(companyId);
        if (req.query.status)
            filter.status = req.query.status;
        if (req.query.supplierId)
            filter.supplierId = new mongoose_1.default.Types.ObjectId(req.query.supplierId);
        const [data, total] = await Promise.all([
            Purchase_model_1.Purchase.find(filter)
                .sort({ purchaseDate: -1 })
                .skip(skip)
                .limit(limit)
                .populate('supplierId', 'name phone')
                .populate('receivedBy', 'name')
                .lean()
                .exec(),
            Purchase_model_1.Purchase.countDocuments(filter).exec(),
        ]);
        return { data, total, page, limit };
    }
    async createPurchase(input, userId) {
        const session = await mongoose_1.default.startSession();
        session.startTransaction();
        try {
            const purchaseNumber = `PO-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            const companyId = input.companyId;
            const branchId = input.branchId;
            // Add stock for each received item
            for (const item of input.items) {
                const product = await Product_model_1.Product.findById(item.productId).session(session);
                if (!product)
                    throw new error_middleware_1.AppError(`Product ${item.productId} not found`, 404);
                const prevStock = product.stock;
                product.stock += item.quantity;
                await product.save({ session });
                await StockLedger_model_1.StockLedger.create([{
                        companyId,
                        branchId,
                        productId: product._id,
                        action: 'purchase_in',
                        quantity: item.quantity,
                        previousStock: prevStock,
                        currentStock: product.stock,
                        referenceType: 'Purchase',
                        performedBy: userId,
                    }], { session });
            }
            const [purchase] = await Purchase_model_1.Purchase.create([{
                    companyId,
                    branchId,
                    purchaseNumber,
                    supplierId: input.supplierId || undefined,
                    items: input.items,
                    subtotal: input.subtotal,
                    taxTotal: input.taxTotal || 0,
                    shippingCost: input.shippingCost || 0,
                    discount: input.discount || 0,
                    grandTotal: input.grandTotal,
                    paidAmount: input.paidAmount || input.grandTotal,
                    dueAmount: Math.max(0, input.grandTotal - (input.paidAmount || input.grandTotal)),
                    paymentMethod: input.paymentMethod || 'cash',
                    status: 'received',
                    notes: input.notes,
                    receivedBy: userId,
                    purchaseDate: input.purchaseDate ? new Date(input.purchaseDate) : new Date(),
                }], { session });
            await session.commitTransaction();
            return purchase;
        }
        catch (err) {
            await session.abortTransaction();
            throw err;
        }
        finally {
            session.endSession();
        }
    }
    // ─── Credit Sales ───────────────────────────────────────────────────────────
    async getCreditSales(req) {
        const page = parseInt(req.query.page || '1', 10);
        const limit = parseInt(req.query.limit || '20', 10);
        const skip = (page - 1) * limit;
        const companyId = req.user?.companyId;
        const filter = {};
        if (companyId)
            filter.companyId = new mongoose_1.default.Types.ObjectId(companyId);
        if (req.query.status)
            filter.status = req.query.status;
        if (req.query.customerId)
            filter.customerId = new mongoose_1.default.Types.ObjectId(req.query.customerId);
        const [data, total] = await Promise.all([
            CreditSale_model_1.CreditSale.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('customerId', 'name phone')
                .populate('saleId')
                .lean()
                .exec(),
            CreditSale_model_1.CreditSale.countDocuments(filter).exec(),
        ]);
        return { data, total, page, limit };
    }
    async recordCreditPayment(creditId, input, userId) {
        const credit = await CreditSale_model_1.CreditSale.findById(creditId);
        if (!credit)
            throw new error_middleware_1.AppError('Credit sale record not found', 404);
        const amount = input.amount;
        credit.paidAmount += amount;
        credit.dueAmount = Math.max(0, credit.dueAmount - amount);
        if (credit.dueAmount === 0) {
            credit.status = 'settled';
        }
        credit.paymentLogs.push({
            amount,
            paymentMethod: input.paymentMethod || 'cash',
            paidAt: new Date(),
            receivedBy: new mongoose_1.default.Types.ObjectId(userId),
        });
        return credit.save();
    }
    // ─── Expenses ───────────────────────────────────────────────────────────────
    async getAllExpenses(req) {
        const page = parseInt(req.query.page || '1', 10);
        const limit = parseInt(req.query.limit || '20', 10);
        const skip = (page - 1) * limit;
        const companyId = req.user?.companyId;
        const filter = {};
        if (companyId)
            filter.companyId = new mongoose_1.default.Types.ObjectId(companyId);
        if (req.query.category)
            filter.category = req.query.category;
        const [data, total] = await Promise.all([
            Expense_model_1.Expense.find(filter).sort({ date: -1 }).skip(skip).limit(limit).populate('createdBy', 'name').lean().exec(),
            Expense_model_1.Expense.countDocuments(filter).exec(),
        ]);
        return { data, total, page, limit };
    }
    async createExpense(input, userId) {
        return Expense_model_1.Expense.create({
            companyId: input.companyId,
            branchId: input.branchId,
            title: input.title,
            amount: input.amount,
            category: input.category,
            date: input.date ? new Date(input.date) : new Date(),
            notes: input.notes,
            paymentMethod: input.paymentMethod || 'cash',
            createdBy: userId,
        });
    }
    // ─── Inventory Adjustments ──────────────────────────────────────────────────
    async adjustInventory(input, userId) {
        const product = await Product_model_1.Product.findById(input.productId);
        if (!product)
            throw new error_middleware_1.AppError('Product not found', 404);
        const prevStock = product.stock;
        const isAddition = input.action === 'adjustment_in';
        product.stock = isAddition ? prevStock + input.quantity : Math.max(0, prevStock - input.quantity);
        await product.save();
        await StockLedger_model_1.StockLedger.create({
            companyId: input.companyId || product.companyId,
            branchId: input.branchId,
            productId: product._id,
            action: input.action || 'adjustment_in',
            quantity: input.quantity,
            previousStock: prevStock,
            currentStock: product.stock,
            referenceType: 'Adjustment',
            notes: input.notes,
            performedBy: userId,
        });
        return { product, previousStock: prevStock, currentStock: product.stock };
    }
    async getStockLedger(req) {
        const page = parseInt(req.query.page || '1', 10);
        const limit = parseInt(req.query.limit || '20', 10);
        const skip = (page - 1) * limit;
        const filter = {};
        if (req.query.productId)
            filter.productId = new mongoose_1.default.Types.ObjectId(req.query.productId);
        const [data, total] = await Promise.all([
            StockLedger_model_1.StockLedger.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('productId', 'name sku')
                .populate('performedBy', 'name')
                .lean()
                .exec(),
            StockLedger_model_1.StockLedger.countDocuments(filter).exec(),
        ]);
        return { data, total, page, limit };
    }
}
exports.TransactionService = TransactionService;
exports.transactionService = new TransactionService();
exports.default = exports.transactionService;
