import { Router } from 'express';
import * as productController from '../controllers/product.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';

const router = Router();

router.use(authenticate);

// Products
router.get('/products', authorize('product:read'), productController.getProducts);
router.get('/products/:id', authorize('product:read'), productController.getProductById);
router.get('/products/barcode/:barcode', authorize('product:read'), productController.getProductByBarcode);
router.post('/products', authorize('product:create'), productController.createProduct);
router.put('/products/:id', authorize('product:update'), productController.updateProduct);
router.delete('/products/:id', authorize('product:delete'), productController.deleteProduct);

// Stock Adjustments
router.post('/inventory/adjust', authorize('inventory:adjust'), productController.adjustStock);
router.get('/inventory/history/:id', authorize('inventory:read'), productController.getStockHistory);

// Categories
router.get('/categories', authorize('category:read'), productController.getCategories);
router.post('/categories', authorize('category:create'), productController.createCategory);
router.put('/categories/:id', authorize('category:update'), productController.updateCategory);
router.delete('/categories/:id', authorize('category:delete'), productController.deleteCategory);

// Brands
router.get('/brands', authorize('brand:read'), productController.getBrands);
router.post('/brands', authorize('brand:create'), productController.createBrand);
router.put('/brands/:id', authorize('brand:update'), productController.updateBrand);
router.delete('/brands/:id', authorize('brand:delete'), productController.deleteBrand);

// Suppliers
router.get('/suppliers', authorize('supplier:read'), productController.getSuppliers);
router.post('/suppliers', authorize('supplier:create'), productController.createSupplier);
router.put('/suppliers/:id', authorize('supplier:update'), productController.updateSupplier);
router.delete('/suppliers/:id', authorize('supplier:delete'), productController.deleteSupplier);

// Customers
router.get('/customers', authorize('customer:read'), productController.getCustomers);
router.post('/customers', authorize('customer:create'), productController.createCustomer);
router.put('/customers/:id', authorize('customer:update'), productController.updateCustomer);
router.delete('/customers/:id', authorize('customer:delete'), productController.deleteCustomer);

export default router;
