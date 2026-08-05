"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const variantSchema = new mongoose_1.Schema({
    sku: { type: String, required: true },
    size: { type: String },
    color: { type: String },
    material: { type: String },
    attributes: { type: Map, of: String },
    price: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, min: 0 },
    costPrice: { type: Number, required: true, default: 0, min: 0 },
    stock: { type: Number, required: true, default: 0, min: 0 },
    lowStockAlert: { type: Number, default: 5 },
    barcode: { type: String },
    imageUrl: { type: String },
});
const productSchema = new mongoose_1.Schema({
    companyId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Company', required: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, lowercase: true, trim: true },
    description: { type: String },
    sku: { type: String, required: true, uppercase: true, trim: true },
    barcode: { type: String },
    categoryId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Category' },
    brandId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Brand' },
    supplierId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Supplier' },
    hasVariants: { type: Boolean, default: false },
    variants: [variantSchema],
    price: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, min: 0 },
    costPrice: { type: Number, required: true, default: 0, min: 0 },
    stock: { type: Number, required: true, default: 0, min: 0 },
    lowStockAlert: { type: Number, default: 5 },
    unit: { type: String, default: 'pcs' },
    taxRate: { type: Number, default: 0, min: 0 },
    imageUrls: [{ type: String }],
    tags: [{ type: String }],
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
}, { timestamps: true });
productSchema.index({ companyId: 1 });
productSchema.index({ sku: 1, companyId: 1 }, { unique: true });
productSchema.index({ barcode: 1 });
productSchema.index({ name: 'text', tags: 'text' });
productSchema.index({ categoryId: 1 });
productSchema.index({ brandId: 1 });
productSchema.index({ stock: 1 });
exports.Product = mongoose_1.default.model('Product', productSchema);
exports.default = exports.Product;
