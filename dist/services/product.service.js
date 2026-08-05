"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productService = exports.ProductService = void 0;
const Product_model_1 = require("../models/Product.model");
const StockLedger_model_1 = require("../models/StockLedger.model");
const error_middleware_1 = require("../middlewares/error.middleware");
const mongoose_1 = __importDefault(require("mongoose"));
class ProductService {
    async getAll(req) {
        const page = parseInt(req.query.page || '1', 10);
        const limit = parseInt(req.query.limit || '20', 10);
        const skip = (page - 1) * limit;
        const companyId = req.user?.companyId;
        const filter = {};
        if (companyId)
            filter.companyId = new mongoose_1.default.Types.ObjectId(companyId);
        if (req.query.isActive !== undefined)
            filter.isActive = req.query.isActive === 'true';
        if (req.query.categoryId)
            filter.categoryId = new mongoose_1.default.Types.ObjectId(req.query.categoryId);
        if (req.query.brandId)
            filter.brandId = new mongoose_1.default.Types.ObjectId(req.query.brandId);
        if (req.query.search) {
            filter.$text = { $search: req.query.search };
        }
        if (req.query.lowStock === 'true') {
            filter.$expr = { $lte: ['$stock', '$lowStockAlert'] };
            filter.hasVariants = false;
        }
        const [data, total] = await Promise.all([
            Product_model_1.Product.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('categoryId', 'name')
                .populate('brandId', 'name')
                .lean()
                .exec(),
            Product_model_1.Product.countDocuments(filter).exec(),
        ]);
        return { data, total, page, limit };
    }
    async getById(id) {
        const product = await Product_model_1.Product.findById(id)
            .populate('categoryId', 'name')
            .populate('brandId', 'name')
            .populate('supplierId', 'name phone')
            .exec();
        if (!product)
            throw new error_middleware_1.AppError('Product not found', 404);
        return product;
    }
    async getByBarcode(barcode) {
        const product = await Product_model_1.Product.findOne({ barcode }).exec();
        if (!product)
            throw new error_middleware_1.AppError('Product not found', 404);
        return product;
    }
    async create(data, userId) {
        // Auto-generate slug
        const slug = data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
        return Product_model_1.Product.create({ ...data, slug });
    }
    async update(id, data) {
        if (data.name) {
            data.slug = data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
        }
        const product = await Product_model_1.Product.findByIdAndUpdate(id, data, { new: true, runValidators: true }).exec();
        if (!product)
            throw new error_middleware_1.AppError('Product not found', 404);
        return product;
    }
    async delete(id) {
        const product = await Product_model_1.Product.findByIdAndDelete(id).exec();
        if (!product)
            throw new error_middleware_1.AppError('Product not found', 404);
        return product;
    }
    async adjustStock(data, userId) {
        const product = await Product_model_1.Product.findById(data.productId);
        if (!product)
            throw new error_middleware_1.AppError('Product not found', 404);
        const prevStock = product.stock;
        const isIn = data.action === 'adjustment_in';
        product.stock = isIn ? prevStock + data.quantity : Math.max(0, prevStock - data.quantity);
        await product.save();
        await StockLedger_model_1.StockLedger.create({
            companyId: data.companyId || product.companyId,
            branchId: data.branchId,
            productId: product._id,
            action: data.action || 'adjustment_in',
            quantity: data.quantity,
            previousStock: prevStock,
            currentStock: product.stock,
            referenceType: 'Adjustment',
            notes: data.notes,
            performedBy: userId,
        });
        return { product, previousStock: prevStock, currentStock: product.stock };
    }
    async getStockHistory(productId) {
        return StockLedger_model_1.StockLedger.find({ productId: new mongoose_1.default.Types.ObjectId(productId) })
            .sort({ createdAt: -1 })
            .populate('performedBy', 'name')
            .lean()
            .exec();
    }
    async getLowStockProducts(companyId) {
        return Product_model_1.Product.find({
            companyId: new mongoose_1.default.Types.ObjectId(companyId),
            isActive: true,
            hasVariants: false,
            $expr: { $lte: ['$stock', '$lowStockAlert'] },
        })
            .populate('categoryId', 'name')
            .lean()
            .exec();
    }
}
exports.ProductService = ProductService;
exports.productService = new ProductService();
exports.default = exports.productService;
