import { z } from 'zod';

const itemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
  price: z.number().positive('Price must be a positive number'),
});

export const createSaleSchema = z.object({
  customerId: z.string().optional(),
  items: z.array(itemSchema).min(1, 'At least one sale item is required'),
  total: z.number().positive('Total must be a positive number'),
});

export const createPurchaseSchema = z.object({
  supplierId: z.string().optional(),
  items: z.array(itemSchema).min(1, 'At least one purchase item is required'),
  total: z.number().positive('Total must be a positive number'),
});

export const createExpenseSchema = z.object({
  amount: z.number().positive('Amount must be a positive number'),
  category: z.string().optional(),
  description: z.string().optional(),
});

export const creditPaymentSchema = z.object({
  amount: z.number().positive('Amount must be a positive number'),
  paymentMethod: z.string().optional(),
});
