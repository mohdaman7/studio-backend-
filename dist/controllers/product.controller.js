"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCustomer = exports.updateCustomer = exports.createCustomer = exports.getCustomers = exports.deleteSupplier = exports.updateSupplier = exports.createSupplier = exports.getSuppliers = exports.deleteBrand = exports.updateBrand = exports.createBrand = exports.getBrands = exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getCategories = exports.getStockHistory = exports.adjustStock = exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductByBarcode = exports.getProductById = exports.getProducts = void 0;
const product_service_1 = require("../services/product.service");
const masterData_service_1 = require("../services/masterData.service");
const apiResponse_1 = require("../utils/apiResponse");
const product_validator_1 = require("../validators/product.validator");
const asyncHandler_1 = require("../utils/asyncHandler");
// Helpers to get parameters safely
const getParamId = (req) => String(req.params.id || '');
const getParamBarcode = (req) => String(req.params.barcode || '');
// ─── Products ────────────────────────────────────────────────────────────────
exports.getProducts = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await product_service_1.productService.getAll(req);
    return apiResponse_1.ApiResponse.paginated(res, 'Products fetched successfully', result.data, result.page, result.limit, result.total);
});
exports.getProductById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const id = getParamId(req);
    const item = await product_service_1.productService.getById(id);
    return apiResponse_1.ApiResponse.success(res, 'Product fetched successfully', item);
});
exports.getProductByBarcode = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const barcode = getParamBarcode(req);
    const item = await product_service_1.productService.getByBarcode(barcode);
    return apiResponse_1.ApiResponse.success(res, 'Product fetched successfully', item);
});
exports.createProduct = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const validated = product_validator_1.createProductSchema.parse(req.body);
    const createdBy = req.user?.userId || '';
    const item = await product_service_1.productService.create(validated, createdBy);
    return apiResponse_1.ApiResponse.created(res, 'Product created successfully', item);
});
exports.updateProduct = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const id = getParamId(req);
    const validated = product_validator_1.updateProductSchema.parse(req.body);
    const item = await product_service_1.productService.update(id, validated);
    return apiResponse_1.ApiResponse.success(res, 'Product updated successfully', item);
});
exports.deleteProduct = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const id = getParamId(req);
    await product_service_1.productService.delete(id);
    return apiResponse_1.ApiResponse.success(res, 'Product deleted successfully');
});
exports.adjustStock = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const validated = product_validator_1.stockAdjustmentSchema.parse(req.body);
    const userId = req.user?.userId || '';
    const item = await product_service_1.productService.adjustStock(validated, userId);
    return apiResponse_1.ApiResponse.success(res, 'Stock adjusted successfully', item);
});
exports.getStockHistory = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const id = getParamId(req);
    const history = await product_service_1.productService.getStockHistory(id);
    return apiResponse_1.ApiResponse.success(res, 'Stock history fetched successfully', history);
});
// ─── Categories ─────────────────────────────────────────────────────────────
exports.getCategories = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await masterData_service_1.categoryService.getAll(req);
    return apiResponse_1.ApiResponse.paginated(res, 'Categories fetched successfully', result.data, result.page, result.limit, result.total);
});
exports.createCategory = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const item = await masterData_service_1.categoryService.create(req.body);
    return apiResponse_1.ApiResponse.created(res, 'Category created successfully', item);
});
exports.updateCategory = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const id = getParamId(req);
    const item = await masterData_service_1.categoryService.update(id, req.body);
    return apiResponse_1.ApiResponse.success(res, 'Category updated successfully', item);
});
exports.deleteCategory = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const id = getParamId(req);
    await masterData_service_1.categoryService.delete(id);
    return apiResponse_1.ApiResponse.success(res, 'Category deleted successfully');
});
// ─── Brands ──────────────────────────────────────────────────────────────────
exports.getBrands = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await masterData_service_1.brandService.getAll(req);
    return apiResponse_1.ApiResponse.paginated(res, 'Brands fetched successfully', result.data, result.page, result.limit, result.total);
});
exports.createBrand = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const item = await masterData_service_1.brandService.create(req.body);
    return apiResponse_1.ApiResponse.created(res, 'Brand created successfully', item);
});
exports.updateBrand = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const id = getParamId(req);
    const item = await masterData_service_1.brandService.update(id, req.body);
    return apiResponse_1.ApiResponse.success(res, 'Brand updated successfully', item);
});
exports.deleteBrand = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const id = getParamId(req);
    await masterData_service_1.brandService.delete(id);
    return apiResponse_1.ApiResponse.success(res, 'Brand deleted successfully');
});
// ─── Suppliers ───────────────────────────────────────────────────────────────
exports.getSuppliers = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await masterData_service_1.supplierService.getAll(req);
    return apiResponse_1.ApiResponse.paginated(res, 'Suppliers fetched successfully', result.data, result.page, result.limit, result.total);
});
exports.createSupplier = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const item = await masterData_service_1.supplierService.create(req.body);
    return apiResponse_1.ApiResponse.created(res, 'Supplier created successfully', item);
});
exports.updateSupplier = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const id = getParamId(req);
    const item = await masterData_service_1.supplierService.update(id, req.body);
    return apiResponse_1.ApiResponse.success(res, 'Supplier updated successfully', item);
});
exports.deleteSupplier = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const id = getParamId(req);
    await masterData_service_1.supplierService.delete(id);
    return apiResponse_1.ApiResponse.success(res, 'Supplier deleted successfully');
});
// ─── Customers ───────────────────────────────────────────────────────────────
exports.getCustomers = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await masterData_service_1.customerService.getAll(req);
    return apiResponse_1.ApiResponse.paginated(res, 'Customers fetched successfully', result.data, result.page, result.limit, result.total);
});
exports.createCustomer = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const item = await masterData_service_1.customerService.create(req.body);
    return apiResponse_1.ApiResponse.created(res, 'Customer created successfully', item);
});
exports.updateCustomer = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const id = getParamId(req);
    const item = await masterData_service_1.customerService.update(id, req.body);
    return apiResponse_1.ApiResponse.success(res, 'Customer updated successfully', item);
});
exports.deleteCustomer = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const id = getParamId(req);
    await masterData_service_1.customerService.delete(id);
    return apiResponse_1.ApiResponse.success(res, 'Customer deleted successfully');
});
