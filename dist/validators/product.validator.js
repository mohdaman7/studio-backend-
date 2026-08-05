"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stockAdjustmentSchema = exports.updateProductSchema = exports.createProductSchema = void 0;
const zod_1 = require("zod");
const objectIdRegex = /^[a-fA-F0-9]{24}$/;
const variantSchema = zod_1.z.object({
    sku: zod_1.z.string().min(1),
    size: zod_1.z.string().optional(),
    color: zod_1.z.string().optional(),
    material: zod_1.z.string().optional(),
    price: zod_1.z.number().nonnegative(),
    salePrice: zod_1.z.number().nonnegative().optional(),
    costPrice: zod_1.z.number().nonnegative().default(0),
    stock: zod_1.z.number().int().nonnegative().default(0),
    lowStockAlert: zod_1.z.number().int().nonnegative().default(5),
    barcode: zod_1.z.string().optional(),
});
exports.createProductSchema = zod_1.z.object({
    companyId: zod_1.z.string().regex(objectIdRegex).optional(),
    name: zod_1.z.string().min(1, 'Product name is required'),
    description: zod_1.z.string().optional(),
    sku: zod_1.z.string().min(1, 'SKU is required'),
    barcode: zod_1.z.string().optional(),
    categoryId: zod_1.z.string().regex(objectIdRegex).optional(),
    brandId: zod_1.z.string().regex(objectIdRegex).optional(),
    supplierId: zod_1.z.string().regex(objectIdRegex).optional(),
    hasVariants: zod_1.z.boolean().default(false),
    variants: zod_1.z.array(variantSchema).default([]),
    price: zod_1.z.number().nonnegative('Price must be non-negative'),
    salePrice: zod_1.z.number().nonnegative().optional(),
    costPrice: zod_1.z.number().nonnegative().default(0),
    stock: zod_1.z.number().int().nonnegative().default(0),
    lowStockAlert: zod_1.z.number().int().nonnegative().default(5),
    unit: zod_1.z.string().default('pcs'),
    taxRate: zod_1.z.number().nonnegative().default(0),
    tags: zod_1.z.array(zod_1.z.string()).default([]),
    isActive: zod_1.z.boolean().default(true),
    isFeatured: zod_1.z.boolean().default(false),
});
exports.updateProductSchema = exports.createProductSchema.partial();
exports.stockAdjustmentSchema = zod_1.z.object({
    productId: zod_1.z.string().regex(objectIdRegex, 'Invalid product ID'),
    action: zod_1.z.enum(['adjustment_in', 'adjustment_out']),
    quantity: zod_1.z.number().int().positive('Quantity must be a positive integer'),
    companyId: zod_1.z.string().regex(objectIdRegex).optional(),
    branchId: zod_1.z.string().regex(objectIdRegex).optional(),
    notes: zod_1.z.string().optional(),
});
