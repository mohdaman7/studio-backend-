"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inventoryAdjustSchema = exports.creditPaymentSchema = exports.createExpenseSchema = exports.createPurchaseSchema = exports.createSaleSchema = void 0;
const zod_1 = require("zod");
const objectIdRegex = /^[a-fA-F0-9]{24}$/;
const saleItemSchema = zod_1.z.object({
    productId: zod_1.z.string().regex(objectIdRegex, 'Invalid product ID'),
    variantId: zod_1.z.string().regex(objectIdRegex).optional(),
    quantity: zod_1.z.number().int().positive('Quantity must be a positive integer'),
    unitPrice: zod_1.z.number().nonnegative('Unit price must be non-negative'),
    discount: zod_1.z.number().nonnegative().default(0),
    taxRate: zod_1.z.number().nonnegative().default(0),
    taxAmount: zod_1.z.number().nonnegative().default(0),
    totalAmount: zod_1.z.number().nonnegative(),
});
const purchaseItemSchema = zod_1.z.object({
    productId: zod_1.z.string().regex(objectIdRegex, 'Invalid product ID'),
    variantId: zod_1.z.string().regex(objectIdRegex).optional(),
    productName: zod_1.z.string().min(1),
    sku: zod_1.z.string().min(1),
    quantity: zod_1.z.number().int().positive(),
    unitCost: zod_1.z.number().nonnegative(),
    taxRate: zod_1.z.number().nonnegative().default(0),
    taxAmount: zod_1.z.number().nonnegative().default(0),
    totalAmount: zod_1.z.number().nonnegative(),
});
exports.createSaleSchema = zod_1.z.object({
    companyId: zod_1.z.string().regex(objectIdRegex).optional(),
    branchId: zod_1.z.string().regex(objectIdRegex).optional(),
    customerId: zod_1.z.string().regex(objectIdRegex).optional(),
    items: zod_1.z.array(saleItemSchema).min(1, 'At least one item is required'),
    subtotal: zod_1.z.number().nonnegative(),
    taxTotal: zod_1.z.number().nonnegative().default(0),
    discount: zod_1.z.number().nonnegative().default(0),
    couponDiscount: zod_1.z.number().nonnegative().default(0),
    grandTotal: zod_1.z.number().nonnegative(),
    paidAmount: zod_1.z.number().nonnegative(),
    paymentMethod: zod_1.z.enum(['cash', 'card', 'upi', 'credit', 'mixed']),
    notes: zod_1.z.string().optional(),
    saleDate: zod_1.z.string().optional(),
    dueDate: zod_1.z.string().optional(),
});
exports.createPurchaseSchema = zod_1.z.object({
    companyId: zod_1.z.string().regex(objectIdRegex).optional(),
    branchId: zod_1.z.string().regex(objectIdRegex).optional(),
    supplierId: zod_1.z.string().regex(objectIdRegex).optional(),
    items: zod_1.z.array(purchaseItemSchema).min(1, 'At least one item is required'),
    subtotal: zod_1.z.number().nonnegative(),
    taxTotal: zod_1.z.number().nonnegative().default(0),
    shippingCost: zod_1.z.number().nonnegative().default(0),
    discount: zod_1.z.number().nonnegative().default(0),
    grandTotal: zod_1.z.number().nonnegative(),
    paidAmount: zod_1.z.number().nonnegative().optional(),
    paymentMethod: zod_1.z.string().default('cash'),
    notes: zod_1.z.string().optional(),
    purchaseDate: zod_1.z.string().optional(),
});
exports.createExpenseSchema = zod_1.z.object({
    companyId: zod_1.z.string().regex(objectIdRegex).optional(),
    branchId: zod_1.z.string().regex(objectIdRegex).optional(),
    title: zod_1.z.string().min(1, 'Title is required'),
    amount: zod_1.z.number().positive('Amount must be positive'),
    category: zod_1.z.string().min(1, 'Category is required'),
    date: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
    paymentMethod: zod_1.z.string().default('cash'),
});
exports.creditPaymentSchema = zod_1.z.object({
    amount: zod_1.z.number().positive('Payment amount must be positive'),
    paymentMethod: zod_1.z.string().default('cash'),
    notes: zod_1.z.string().optional(),
});
exports.inventoryAdjustSchema = zod_1.z.object({
    productId: zod_1.z.string().regex(objectIdRegex, 'Invalid product ID'),
    action: zod_1.z.enum(['adjustment_in', 'adjustment_out']),
    quantity: zod_1.z.number().int().positive(),
    companyId: zod_1.z.string().regex(objectIdRegex).optional(),
    branchId: zod_1.z.string().regex(objectIdRegex).optional(),
    notes: zod_1.z.string().optional(),
});
