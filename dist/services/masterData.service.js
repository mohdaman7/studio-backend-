"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.masterDataService = exports.customerService = exports.supplierService = exports.brandService = exports.categoryService = void 0;
const Category_model_1 = require("../models/Category.model");
const Brand_model_1 = require("../models/Brand.model");
const Supplier_model_1 = require("../models/Supplier.model");
const Customer_model_1 = require("../models/Customer.model");
const error_middleware_1 = require("../middlewares/error.middleware");
const mongoose_1 = __importDefault(require("mongoose"));
// ─── Generic paginator ──────────────────────────────────────────────────────
function paginate(req) {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '20', 10);
    const skip = (page - 1) * limit;
    return { page, limit, skip };
}
// ─── Category Service ────────────────────────────────────────────────────────
class CategoryService {
    async getAll(req) {
        const { page, limit, skip } = paginate(req);
        const companyId = req.user?.companyId;
        const filter = {};
        if (companyId)
            filter.companyId = new mongoose_1.default.Types.ObjectId(companyId);
        if (req.query.isActive !== undefined)
            filter.isActive = req.query.isActive === 'true';
        const [data, total] = await Promise.all([
            Category_model_1.Category.find(filter).sort({ name: 1 }).skip(skip).limit(limit).lean().exec(),
            Category_model_1.Category.countDocuments(filter).exec(),
        ]);
        return { data, total, page, limit };
    }
    async create(body) {
        const slug = body.name.toLowerCase().replace(/\s+/g, '-');
        return Category_model_1.Category.create({ ...body, slug });
    }
    async update(id, data) {
        if (data.name)
            data.slug = data.name.toLowerCase().replace(/\s+/g, '-');
        const item = await Category_model_1.Category.findByIdAndUpdate(id, data, { new: true, runValidators: true }).exec();
        if (!item)
            throw new error_middleware_1.AppError('Category not found', 404);
        return item;
    }
    async delete(id) {
        const item = await Category_model_1.Category.findByIdAndDelete(id).exec();
        if (!item)
            throw new error_middleware_1.AppError('Category not found', 404);
        return item;
    }
}
// ─── Brand Service ────────────────────────────────────────────────────────────
class BrandService {
    async getAll(req) {
        const { page, limit, skip } = paginate(req);
        const companyId = req.user?.companyId;
        const filter = {};
        if (companyId)
            filter.companyId = new mongoose_1.default.Types.ObjectId(companyId);
        const [data, total] = await Promise.all([
            Brand_model_1.Brand.find(filter).sort({ name: 1 }).skip(skip).limit(limit).lean().exec(),
            Brand_model_1.Brand.countDocuments(filter).exec(),
        ]);
        return { data, total, page, limit };
    }
    async create(body) {
        const slug = body.name.toLowerCase().replace(/\s+/g, '-');
        return Brand_model_1.Brand.create({ ...body, slug });
    }
    async update(id, data) {
        if (data.name)
            data.slug = data.name.toLowerCase().replace(/\s+/g, '-');
        const item = await Brand_model_1.Brand.findByIdAndUpdate(id, data, { new: true, runValidators: true }).exec();
        if (!item)
            throw new error_middleware_1.AppError('Brand not found', 404);
        return item;
    }
    async delete(id) {
        const item = await Brand_model_1.Brand.findByIdAndDelete(id).exec();
        if (!item)
            throw new error_middleware_1.AppError('Brand not found', 404);
        return item;
    }
}
// ─── Supplier Service ─────────────────────────────────────────────────────────
class SupplierService {
    async getAll(req) {
        const { page, limit, skip } = paginate(req);
        const companyId = req.user?.companyId;
        const filter = {};
        if (companyId)
            filter.companyId = new mongoose_1.default.Types.ObjectId(companyId);
        if (req.query.isActive !== undefined)
            filter.isActive = req.query.isActive === 'true';
        const [data, total] = await Promise.all([
            Supplier_model_1.Supplier.find(filter).sort({ name: 1 }).skip(skip).limit(limit).lean().exec(),
            Supplier_model_1.Supplier.countDocuments(filter).exec(),
        ]);
        return { data, total, page, limit };
    }
    async create(body) {
        return Supplier_model_1.Supplier.create(body);
    }
    async getById(id) {
        const item = await Supplier_model_1.Supplier.findById(id).exec();
        if (!item)
            throw new error_middleware_1.AppError('Supplier not found', 404);
        return item;
    }
    async update(id, data) {
        const item = await Supplier_model_1.Supplier.findByIdAndUpdate(id, data, { new: true, runValidators: true }).exec();
        if (!item)
            throw new error_middleware_1.AppError('Supplier not found', 404);
        return item;
    }
    async delete(id) {
        const item = await Supplier_model_1.Supplier.findByIdAndDelete(id).exec();
        if (!item)
            throw new error_middleware_1.AppError('Supplier not found', 404);
        return item;
    }
}
// ─── Customer Service ─────────────────────────────────────────────────────────
class CustomerService {
    async getAll(req) {
        const { page, limit, skip } = paginate(req);
        const companyId = req.user?.companyId;
        const filter = {};
        if (companyId)
            filter.companyId = new mongoose_1.default.Types.ObjectId(companyId);
        if (req.query.isActive !== undefined)
            filter.isActive = req.query.isActive === 'true';
        if (req.query.search) {
            const search = req.query.search;
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
            ];
        }
        const [data, total] = await Promise.all([
            Customer_model_1.Customer.find(filter).sort({ name: 1 }).skip(skip).limit(limit).lean().exec(),
            Customer_model_1.Customer.countDocuments(filter).exec(),
        ]);
        return { data, total, page, limit };
    }
    async getById(id) {
        const item = await Customer_model_1.Customer.findById(id).exec();
        if (!item)
            throw new error_middleware_1.AppError('Customer not found', 404);
        return item;
    }
    async create(body) {
        return Customer_model_1.Customer.create(body);
    }
    async update(id, data) {
        const item = await Customer_model_1.Customer.findByIdAndUpdate(id, data, { new: true, runValidators: true }).exec();
        if (!item)
            throw new error_middleware_1.AppError('Customer not found', 404);
        return item;
    }
    async delete(id) {
        const item = await Customer_model_1.Customer.findByIdAndDelete(id).exec();
        if (!item)
            throw new error_middleware_1.AppError('Customer not found', 404);
        return item;
    }
}
// ─── Singleton Exports ────────────────────────────────────────────────────────
exports.categoryService = new CategoryService();
exports.brandService = new BrandService();
exports.supplierService = new SupplierService();
exports.customerService = new CustomerService();
// Legacy default export for backward compat
exports.masterDataService = {
    categoryService: exports.categoryService,
    brandService: exports.brandService,
    supplierService: exports.supplierService,
    customerService: exports.customerService,
};
exports.default = exports.masterDataService;
