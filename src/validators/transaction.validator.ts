import { z } from 'zod';

const objectIdRegex = /^[a-fA-F0-9]{24}$/;

const saleItemSchema = z.object({
  productId: z.string().regex(objectIdRegex, 'Invalid product ID'),
  variantId: z.string().regex(objectIdRegex).optional(),
  name: z.string().optional(),
  sku: z.string().optional(),
  variantSku: z.string().optional(),
  selectedSize: z.string().optional(),
  selectedColor: z.string().optional(),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
  unitPrice: z.number().nonnegative('Unit price must be non-negative'),
  discount: z.number().nonnegative().default(0),
  taxRate: z.number().nonnegative().default(0),
  taxAmount: z.number().nonnegative().default(0),
  totalAmount: z.number().nonnegative().optional(),
  totalPrice: z.number().nonnegative().optional(),
}).transform((data) => ({
  ...data,
  totalAmount: data.totalAmount ?? data.totalPrice ?? (data.unitPrice * data.quantity),
}));

const returnItemSchema = z.object({
  productId: z.string().regex(objectIdRegex, 'Invalid product ID'),
  variantId: z.string().regex(objectIdRegex).optional(),
  name: z.string().optional(),
  sku: z.string().optional(),
  variantSku: z.string().optional(),
  selectedSize: z.string().optional(),
  selectedColor: z.string().optional(),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
  unitPrice: z.number().nonnegative('Unit price must be non-negative'),
  taxRate: z.number().nonnegative().default(0),
  taxAmount: z.number().nonnegative().default(0),
  totalAmount: z.number().nonnegative().optional(),
  originalInvoiceNumber: z.string().optional(),
  reason: z.string().optional().default('Exchange / Return'),
  condition: z.enum(['restockable', 'damaged_scrap']).optional().default('restockable'),
}).transform((data) => ({
  ...data,
  totalAmount: data.totalAmount ?? (data.unitPrice * data.quantity),
}));

const purchaseItemSchema = z.object({
  productId: z.string().regex(objectIdRegex, 'Invalid product ID').optional(),
  variantId: z.string().regex(objectIdRegex).optional(),
  productName: z.string().optional().default('General Stock / Inward Bill'),
  sku: z.string().optional().default('GEN-PURCHASE'),
  quantity: z.number().int().positive().optional().default(1),
  unitCost: z.number().nonnegative().optional().default(0),
  taxRate: z.number().nonnegative().default(0),
  taxAmount: z.number().nonnegative().default(0),
  totalAmount: z.number().nonnegative().optional().default(0),
});

export const createSaleSchema = z.object({
  companyId: z.string().regex(objectIdRegex).optional(),
  branchId: z.string().regex(objectIdRegex).optional(),
  customerId: z.string().regex(objectIdRegex).optional(),
  items: z.array(saleItemSchema).default([]),
  isExchange: z.boolean().default(false),
  returnedItems: z.array(returnItemSchema).default([]),
  returnCreditTotal: z.number().nonnegative().default(0),
  netAmount: z.number().optional(),
  refundAmount: z.number().nonnegative().default(0),
  refundMethod: z.string().optional(),
  subtotal: z.number().nonnegative().default(0),
  taxTotal: z.number().nonnegative().default(0),
  discount: z.number().nonnegative().default(0),
  couponDiscount: z.number().nonnegative().default(0),
  grandTotal: z.number().nonnegative().default(0),
  paidAmount: z.number().nonnegative().default(0),
  paymentMethod: z.enum(['cash', 'card', 'upi', 'credit', 'mixed']).default('cash'),
  notes: z.string().optional(),
  saleDate: z.string().optional(),
  dueDate: z.string().optional(),
}).refine(
  (data) => (data.items && data.items.length > 0) || (data.returnedItems && data.returnedItems.length > 0),
  { message: 'At least one purchased or returned item is required' }
);

export const createPurchaseSchema = z.object({
  companyId: z.string().regex(objectIdRegex).optional(),
  branchId: z.string().regex(objectIdRegex).optional(),
  supplierId: z.string().regex(objectIdRegex).optional(),
  items: z.array(purchaseItemSchema).optional().default([]),
  subtotal: z.number().nonnegative(),
  taxTotal: z.number().nonnegative().default(0),
  shippingCost: z.number().nonnegative().default(0),
  discount: z.number().nonnegative().default(0),
  grandTotal: z.number().nonnegative(),
  paidAmount: z.number().nonnegative().optional(),
  paymentMethod: z.string().default('cash'),
  notes: z.string().optional(),
  purchaseDate: z.string().optional(),
});

export const createExpenseSchema = z.object({
  companyId: z.string().regex(objectIdRegex).optional(),
  branchId: z.string().regex(objectIdRegex).optional(),
  title: z.string().min(1, 'Title is required'),
  amount: z.number().positive('Amount must be positive'),
  category: z.string().min(1, 'Category is required'),
  date: z.string().optional(),
  notes: z.string().optional(),
  paymentMethod: z.string().default('cash'),
});

export const creditPaymentSchema = z.object({
  amount: z.number().positive('Payment amount must be positive'),
  paymentMethod: z.string().default('cash'),
  notes: z.string().optional(),
});

export const inventoryAdjustSchema = z.object({
  productId: z.string().regex(objectIdRegex, 'Invalid product ID'),
  action: z.enum(['adjustment_in', 'adjustment_out']),
  quantity: z.number().int().positive(),
  companyId: z.string().regex(objectIdRegex).optional(),
  branchId: z.string().regex(objectIdRegex).optional(),
  notes: z.string().optional(),
});
