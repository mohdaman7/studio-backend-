import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  barcode: z.string().optional(),
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  supplierId: z.string().optional(),
  price: z.number().positive('Price must be a positive number'),
  costPrice: z.number().positive('Cost price must be a positive number'),
  quantity: z.number().int().nonnegative('Quantity must be a non-negative integer'),
});

export const updateProductSchema = createProductSchema.partial();

export const stockAdjustmentSchema = z.object({
  adjustment: z.number().int('Adjustment must be an integer'),
  reason: z.string().optional(),
});
