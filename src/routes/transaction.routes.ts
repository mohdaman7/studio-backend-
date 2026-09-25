import { Router } from 'express';
import * as transactionController from '../controllers/transaction.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';

const router = Router();

// All transaction routes require authentication
router.use(authenticate);

// ─── Sales ────────────────────────────────────────────────────────────────────
router.get('/sales', authorize('sales:read'), transactionController.getSales);
router.post('/sales', authorize('sales:create'), transactionController.createSale);
router.get('/sales/:id', authorize('sales:read'), transactionController.getSaleById);
router.patch('/sales/:id/cancel', authorize('sales:delete'), transactionController.cancelSale);
router.delete('/sales/:id', authorize('sales:delete'), transactionController.deleteSale);

// ─── Purchases ────────────────────────────────────────────────────────────────
router.get('/purchases', authorize('purchases:read'), transactionController.getPurchases);
router.post('/purchases', authorize('purchases:create'), transactionController.createPurchase);
router.post('/purchases/:id/payment', transactionController.recordPurchasePayment);
router.post('/suppliers/:id/settle-dues', transactionController.settleSupplierPayment);

// ─── Credit Sales ─────────────────────────────────────────────────────────────
router.get('/credit-sales', authorize('credit:read'), transactionController.getCreditSales);
router.post('/credit-sales', transactionController.createCreditSale);
router.post('/credit-sales/:id/payment', authorize('credit:write'), transactionController.recordCreditPayment);

// ─── Expenses ─────────────────────────────────────────────────────────────────
router.get('/expenses', authorize('expenses:read'), transactionController.getExpenses);
router.post('/expenses', authorize('expenses:create'), transactionController.createExpense);
router.delete('/expenses/:id', authorize('expenses:create'), transactionController.deleteExpense);

// ─── Inventory ────────────────────────────────────────────────────────────────
router.get('/inventory/ledger', authorize('inventory:read'), transactionController.getStockLedger);
router.post('/inventory/adjust', authorize('inventory:write'), transactionController.adjustInventory);

// ─── Dashboard & Reports ──────────────────────────────────────────────────────
router.get('/dashboard', transactionController.getDashboardData);
router.get('/reports/:type', authorize('reports:read'), transactionController.getReports);

export default router;
