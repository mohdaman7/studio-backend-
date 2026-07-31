import { Router } from 'express';
import * as transactionController from '../controllers/transaction.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';

const router = Router();

router.use(authenticate);

// Sales & POS
router.post('/sales', authorize('sale:create'), transactionController.createSale);
router.get('/sales', authorize('sale:read'), transactionController.getSales);

// Purchases
router.post('/purchases', authorize('purchase:create'), transactionController.createPurchase);
router.get('/purchases', authorize('purchase:read'), transactionController.getPurchases);

// Credit Sales
router.get('/credit-sales', authorize('credit:read'), transactionController.getCreditSales);
router.post('/credit-sales/:id/payments', authorize('credit:create'), transactionController.recordCreditPayment);

// Expenses
router.post('/expenses', authorize('expense:create'), transactionController.createExpense);
router.get('/expenses', authorize('expense:read'), transactionController.getExpenses);

// Reports
router.get('/reports/:type', authorize('report:read'), transactionController.getReports);

// Dashboard
router.get('/dashboard', authorize('dashboard:read'), transactionController.getDashboardData);

export default router;
