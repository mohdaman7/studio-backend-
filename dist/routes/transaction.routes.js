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
const transactionController = __importStar(require("../controllers/transaction.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const rbac_middleware_1 = require("../middlewares/rbac.middleware");
const router = (0, express_1.Router)();
// All transaction routes require authentication
router.use(auth_middleware_1.authenticate);
// ─── Sales ────────────────────────────────────────────────────────────────────
router.get('/sales', (0, rbac_middleware_1.authorize)('sales:read'), transactionController.getSales);
router.post('/sales', (0, rbac_middleware_1.authorize)('sales:create'), transactionController.createSale);
router.get('/sales/:id', (0, rbac_middleware_1.authorize)('sales:read'), transactionController.getSaleById);
router.patch('/sales/:id/cancel', (0, rbac_middleware_1.authorize)('sales:delete'), transactionController.cancelSale);
// ─── Purchases ────────────────────────────────────────────────────────────────
router.get('/purchases', (0, rbac_middleware_1.authorize)('purchases:read'), transactionController.getPurchases);
router.post('/purchases', (0, rbac_middleware_1.authorize)('purchases:create'), transactionController.createPurchase);
// ─── Credit Sales ─────────────────────────────────────────────────────────────
router.get('/credit-sales', (0, rbac_middleware_1.authorize)('credit:read'), transactionController.getCreditSales);
router.post('/credit-sales/:id/payment', (0, rbac_middleware_1.authorize)('credit:write'), transactionController.recordCreditPayment);
// ─── Expenses ─────────────────────────────────────────────────────────────────
router.get('/expenses', (0, rbac_middleware_1.authorize)('expenses:read'), transactionController.getExpenses);
router.post('/expenses', (0, rbac_middleware_1.authorize)('expenses:create'), transactionController.createExpense);
// ─── Inventory ────────────────────────────────────────────────────────────────
router.get('/inventory/ledger', (0, rbac_middleware_1.authorize)('inventory:read'), transactionController.getStockLedger);
router.post('/inventory/adjust', (0, rbac_middleware_1.authorize)('inventory:write'), transactionController.adjustInventory);
// ─── Dashboard & Reports ──────────────────────────────────────────────────────
router.get('/dashboard', transactionController.getDashboardData);
router.get('/reports/:type', (0, rbac_middleware_1.authorize)('reports:read'), transactionController.getReports);
exports.default = router;
