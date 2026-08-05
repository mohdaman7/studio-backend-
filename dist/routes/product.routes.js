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
const express_1 = require("express");
const productController = __importStar(require("../controllers/product.controller"));
const prodMgmtController = __importStar(require("../controllers/productManagement.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const rbac_middleware_1 = require("../middlewares/rbac.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
// Standard Product CRUD
router.get('/products', (0, rbac_middleware_1.authorize)('product:read'), productController.getProducts);
router.get('/products/:id', (0, rbac_middleware_1.authorize)('product:read'), productController.getProductById);
router.get('/products/barcode/:barcode', (0, rbac_middleware_1.authorize)('product:read'), productController.getProductByBarcode);
router.post('/products', (0, rbac_middleware_1.authorize)('product:create'), productController.createProduct);
router.put('/products/:id', (0, rbac_middleware_1.authorize)('product:update'), productController.updateProduct);
router.delete('/products/:id', (0, rbac_middleware_1.authorize)('product:delete'), productController.deleteProduct);
// Advanced Product Utilities
router.post('/products/:id/duplicate', (0, rbac_middleware_1.authorize)('product:create'), prodMgmtController.duplicateProduct);
router.post('/products/utility/generate-sku', (0, rbac_middleware_1.authorize)('product:create'), prodMgmtController.generateSkuBarcode);
// Stock Adjustments
router.post('/inventory/adjust', (0, rbac_middleware_1.authorize)('inventory:adjust'), productController.adjustStock);
router.get('/inventory/history/:id', (0, rbac_middleware_1.authorize)('inventory:read'), productController.getStockHistory);
// Master Tables
router.get('/categories', (0, rbac_middleware_1.authorize)('category:read'), productController.getCategories);
router.post('/categories', (0, rbac_middleware_1.authorize)('category:create'), productController.createCategory);
router.put('/categories/:id', (0, rbac_middleware_1.authorize)('category:update'), productController.updateCategory);
router.delete('/categories/:id', (0, rbac_middleware_1.authorize)('category:delete'), productController.deleteCategory);
router.get('/brands', (0, rbac_middleware_1.authorize)('brand:read'), productController.getBrands);
router.post('/brands', (0, rbac_middleware_1.authorize)('brand:create'), productController.createBrand);
router.put('/brands/:id', (0, rbac_middleware_1.authorize)('brand:update'), productController.updateBrand);
router.delete('/brands/:id', (0, rbac_middleware_1.authorize)('brand:delete'), productController.deleteBrand);
router.get('/suppliers', (0, rbac_middleware_1.authorize)('supplier:read'), productController.getSuppliers);
router.post('/suppliers', (0, rbac_middleware_1.authorize)('supplier:create'), productController.createSupplier);
router.put('/suppliers/:id', (0, rbac_middleware_1.authorize)('supplier:update'), productController.updateSupplier);
router.delete('/suppliers/:id', (0, rbac_middleware_1.authorize)('supplier:delete'), productController.deleteSupplier);
router.get('/customers', (0, rbac_middleware_1.authorize)('customer:read'), productController.getCustomers);
router.post('/customers', (0, rbac_middleware_1.authorize)('customer:create'), productController.createCustomer);
router.put('/customers/:id', (0, rbac_middleware_1.authorize)('customer:update'), productController.updateCustomer);
router.delete('/customers/:id', (0, rbac_middleware_1.authorize)('customer:delete'), productController.deleteCustomer);
exports.default = router;
