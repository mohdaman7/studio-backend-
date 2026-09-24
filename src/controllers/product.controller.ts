import { Request, Response } from 'express';
import { productService } from '../services/product.service';
import { categoryService, brandService, supplierService, customerService } from '../services/masterData.service';
import { ApiResponse } from '../utils/apiResponse';
import { createProductSchema, updateProductSchema, stockAdjustmentSchema } from '../validators/product.validator';
import { asyncHandler } from '../utils/asyncHandler';

// Helpers to get parameters safely
const getParamId = (req: Request): string => String(req.params.id || '');
const getParamBarcode = (req: Request): string => String(req.params.barcode || '');

// ─── Products ────────────────────────────────────────────────────────────────
export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const result = await productService.getAll(req);
  return ApiResponse.paginated(res, 'Products fetched successfully', result.data, result.page, result.limit, result.total);
});

export const getProductById = asyncHandler(async (req: Request, res: Response) => {
  const id = getParamId(req);
  const item = await productService.getById(id);
  return ApiResponse.success(res, 'Product fetched successfully', item);
});

export const getProductByBarcode = asyncHandler(async (req: Request, res: Response) => {
  const barcode = getParamBarcode(req);
  const item = await productService.getByBarcode(barcode);
  return ApiResponse.success(res, 'Product fetched successfully', item);
});

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const validated = createProductSchema.parse(req.body);
  const createdBy = req.user?.userId || '';
  const item = await productService.create(validated, createdBy);
  return ApiResponse.created(res, 'Product created successfully', item);
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const id = getParamId(req);
  const validated = updateProductSchema.parse(req.body);
  const item = await productService.update(id, validated);
  return ApiResponse.success(res, 'Product updated successfully', item);
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const id = getParamId(req);
  await productService.delete(id);
  return ApiResponse.success(res, 'Product deleted successfully');
});

export const adjustStock = asyncHandler(async (req: Request, res: Response) => {
  const validated = stockAdjustmentSchema.parse(req.body);
  const userId = req.user?.userId || '';
  const item = await productService.adjustStock(validated, userId);
  return ApiResponse.success(res, 'Stock adjusted successfully', item);
});

export const getStockHistory = asyncHandler(async (req: Request, res: Response) => {
  const id = getParamId(req);
  const history = await productService.getStockHistory(id);
  return ApiResponse.success(res, 'Stock history fetched successfully', history);
});

// ─── Categories ─────────────────────────────────────────────────────────────
export const getCategories = asyncHandler(async (req: Request, res: Response) => {
  const result = await categoryService.getAll(req);
  return ApiResponse.paginated(res, 'Categories fetched successfully', result.data, result.page, result.limit, result.total);
});

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const item = await categoryService.create(req.body);
  return ApiResponse.created(res, 'Category created successfully', item);
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const id = getParamId(req);
  const item = await categoryService.update(id, req.body);
  return ApiResponse.success(res, 'Category updated successfully', item);
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const id = getParamId(req);
  await categoryService.delete(id);
  return ApiResponse.success(res, 'Category deleted successfully');
});

// ─── Brands ──────────────────────────────────────────────────────────────────
export const getBrands = asyncHandler(async (req: Request, res: Response) => {
  const result = await brandService.getAll(req);
  return ApiResponse.paginated(res, 'Brands fetched successfully', result.data, result.page, result.limit, result.total);
});

export const createBrand = asyncHandler(async (req: Request, res: Response) => {
  const item = await brandService.create(req.body);
  return ApiResponse.created(res, 'Brand created successfully', item);
});

export const updateBrand = asyncHandler(async (req: Request, res: Response) => {
  const id = getParamId(req);
  const item = await brandService.update(id, req.body);
  return ApiResponse.success(res, 'Brand updated successfully', item);
});

export const deleteBrand = asyncHandler(async (req: Request, res: Response) => {
  const id = getParamId(req);
  await brandService.delete(id);
  return ApiResponse.success(res, 'Brand deleted successfully');
});

// ─── Suppliers ───────────────────────────────────────────────────────────────
export const getSuppliers = asyncHandler(async (req: Request, res: Response) => {
  const result = await supplierService.getAll(req);
  return ApiResponse.paginated(res, 'Suppliers fetched successfully', result.data, result.page, result.limit, result.total);
});

export const createSupplier = asyncHandler(async (req: Request, res: Response) => {
  const item = await supplierService.create(req.body);
  return ApiResponse.created(res, 'Supplier created successfully', item);
});

export const updateSupplier = asyncHandler(async (req: Request, res: Response) => {
  const id = getParamId(req);
  const item = await supplierService.update(id, req.body);
  return ApiResponse.success(res, 'Supplier updated successfully', item);
});

export const deleteSupplier = asyncHandler(async (req: Request, res: Response) => {
  const id = getParamId(req);
  await supplierService.delete(id);
  return ApiResponse.success(res, 'Supplier deleted successfully');
});

// ─── Customers ───────────────────────────────────────────────────────────────
export const getCustomers = asyncHandler(async (req: Request, res: Response) => {
  const result = await customerService.getAll(req);
  return ApiResponse.paginated(res, 'Customers fetched successfully', result.data, result.page, result.limit, result.total);
});

export const createCustomer = asyncHandler(async (req: Request, res: Response) => {
  const item = await customerService.create(req.body);
  return ApiResponse.created(res, 'Customer created successfully', item);
});

export const updateCustomer = asyncHandler(async (req: Request, res: Response) => {
  const id = getParamId(req);
  const item = await customerService.update(id, req.body);
  return ApiResponse.success(res, 'Customer updated successfully', item);
});

export const deleteCustomer = asyncHandler(async (req: Request, res: Response) => {
  const id = getParamId(req);
  await customerService.delete(id);
  return ApiResponse.success(res, 'Customer deleted successfully');
});


export const bulkCostUpdate = asyncHandler(async (req: Request, res: Response) => {
  const result = await productService.bulkCostUpdate(req);
  return ApiResponse.success(res, 'Products cost updated successfully', result);
});

export const batchCostUpdate = asyncHandler(async (req: Request, res: Response) => {
  const result = await productService.batchCostUpdate(req);
  return ApiResponse.success(res, 'Batch costs updated successfully', result);
});
