import { z } from 'zod';

const objectIdRegex = /^[a-fA-F0-9]{24}$/;

const variantSchema = z.object({
  sku: z.string().min(1),
  size: z.string().optional(),
  color: z.string().optional(),
  material: z.string().optional(),
  price: z.number().nonnegative(),
  salePrice: z.number().nonnegative().optional(),
  costPrice: z.number().nonnegative().default(0),
  stock: z.number().int().nonnegative().default(0),
  lowStockAlert: z.number().int().nonnegative().default(5),
  barcode: z.string().optional(),
});

export const createProductSchema = z.object({
  companyId: z.string().regex(objectIdRegex).optional(),
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  sku: z.string().min(1, 'SKU is required'),
  barcode: z.string().optional(),
  categoryId: z.string().regex(objectIdRegex).optional(),
  brandId: z.string().regex(objectIdRegex).optional(),
  supplierId: z.string().regex(objectIdRegex).optional(),
  hasVariants: z.boolean().default(false),
  variants: z.array(variantSchema).default([]),
  price: z.number().nonnegative('Price must be non-negative'),
  salePrice: z.number().nonnegative().optional(),
  costPrice: z.number().nonnegative().default(0),
  stock: z.number().int().nonnegative().default(0),
  lowStockAlert: z.number().int().nonnegative().default(5),
  unit: z.string().default('pcs'),
  taxRate: z.number().nonnegative().default(0),
  tags: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

export const updateProductSchema = createProductSchema.partial();

export const stockAdjustmentSchema = z.object({
  productId: z.string().regex(objectIdRegex, 'Invalid product ID'),
  action: z.enum(['adjustment_in', 'adjustment_out']),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
  companyId: z.string().regex(objectIdRegex).optional(),
  branchId: z.string().regex(objectIdRegex).optional(),
  notes: z.string().optional(),
});
