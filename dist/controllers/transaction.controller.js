"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReports = exports.getDashboardData = exports.getStockLedger = exports.adjustInventory = exports.getExpenses = exports.createExpense = exports.recordCreditPayment = exports.getCreditSales = exports.getPurchases = exports.createPurchase = exports.cancelSale = exports.getSaleById = exports.getSales = exports.createSale = void 0;
const transaction_service_1 = require("../services/transaction.service");
const dashboard_service_1 = require("../services/dashboard.service");
const apiResponse_1 = require("../utils/apiResponse");
const transaction_validator_1 = require("../validators/transaction.validator");
const asyncHandler_1 = require("../utils/asyncHandler");
// Helpers to get parameters safely
const getParamId = (req) => String(req.params.id || '');
const getParamType = (req) => String(req.params.type || '');
// ─── Sales ───────────────────────────────────────────────────────────────────
exports.createSale = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const validated = transaction_validator_1.createSaleSchema.parse({
        ...req.body,
        companyId: req.body.companyId || req.user?.companyId,
        branchId: req.body.branchId || req.user?.branchId,
    });
    const cashierId = req.user?.userId || '';
    const sale = await transaction_service_1.transactionService.createSale(validated, cashierId);
    return apiResponse_1.ApiResponse.created(res, 'Sale completed successfully', sale);
});
exports.getSales = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await transaction_service_1.transactionService.getAllSales(req);
    return apiResponse_1.ApiResponse.paginated(res, 'Sales fetched successfully', result.data, result.page, result.limit, result.total);
});
exports.getSaleById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const id = getParamId(req);
    const sale = await transaction_service_1.transactionService.getSaleById(id);
    return apiResponse_1.ApiResponse.success(res, 'Sale fetched successfully', sale);
});
exports.cancelSale = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const id = getParamId(req);
    const userId = req.user?.userId || '';
    const result = await transaction_service_1.transactionService.cancelSale(id, userId);
    return apiResponse_1.ApiResponse.success(res, 'Sale cancelled successfully', result);
});
// ─── Purchases ───────────────────────────────────────────────────────────────
exports.createPurchase = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const validated = transaction_validator_1.createPurchaseSchema.parse({
        ...req.body,
        companyId: req.body.companyId || req.user?.companyId,
        branchId: req.body.branchId || req.user?.branchId,
    });
    const userId = req.user?.userId || '';
    const purchase = await transaction_service_1.transactionService.createPurchase(validated, userId);
    return apiResponse_1.ApiResponse.created(res, 'Purchase recorded successfully', purchase);
});
exports.getPurchases = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await transaction_service_1.transactionService.getAllPurchases(req);
    return apiResponse_1.ApiResponse.paginated(res, 'Purchases fetched successfully', result.data, result.page, result.limit, result.total);
});
// ─── Credit Sales ─────────────────────────────────────────────────────────────
exports.getCreditSales = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await transaction_service_1.transactionService.getCreditSales(req);
    return apiResponse_1.ApiResponse.paginated(res, 'Credit sales fetched successfully', result.data, result.page, result.limit, result.total);
});
exports.recordCreditPayment = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const id = getParamId(req);
    const validated = transaction_validator_1.creditPaymentSchema.parse(req.body);
    const userId = req.user?.userId || '';
    const result = await transaction_service_1.transactionService.recordCreditPayment(id, validated, userId);
    return apiResponse_1.ApiResponse.success(res, 'Payment recorded successfully', result);
});
// ─── Expenses ────────────────────────────────────────────────────────────────
exports.createExpense = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const validated = transaction_validator_1.createExpenseSchema.parse({
        ...req.body,
        companyId: req.body.companyId || req.user?.companyId,
        branchId: req.body.branchId || req.user?.branchId,
    });
    const userId = req.user?.userId || '';
    const expense = await transaction_service_1.transactionService.createExpense(validated, userId);
    return apiResponse_1.ApiResponse.created(res, 'Expense recorded successfully', expense);
});
exports.getExpenses = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await transaction_service_1.transactionService.getAllExpenses(req);
    return apiResponse_1.ApiResponse.paginated(res, 'Expenses fetched successfully', result.data, result.page, result.limit, result.total);
});
// ─── Inventory ────────────────────────────────────────────────────────────────
exports.adjustInventory = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const validated = transaction_validator_1.inventoryAdjustSchema.parse({
        ...req.body,
        companyId: req.body.companyId || req.user?.companyId,
        branchId: req.body.branchId || req.user?.branchId,
    });
    const userId = req.user?.userId || '';
    const result = await transaction_service_1.transactionService.adjustInventory(validated, userId);
    return apiResponse_1.ApiResponse.success(res, 'Inventory adjusted successfully', result);
});
exports.getStockLedger = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await transaction_service_1.transactionService.getStockLedger(req);
    return apiResponse_1.ApiResponse.paginated(res, 'Stock ledger fetched successfully', result.data, result.page, result.limit, result.total);
});
// ─── Dashboard & Reports ─────────────────────────────────────────────────────
exports.getDashboardData = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const branchId = req.query.branchId;
    const data = await dashboard_service_1.dashboardService.getDashboardData(branchId);
    return apiResponse_1.ApiResponse.success(res, 'Dashboard metrics fetched successfully', data);
});
exports.getReports = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const type = getParamType(req);
    const data = await dashboard_service_1.dashboardService.getReports(type, req.query);
    return apiResponse_1.ApiResponse.success(res, 'Report generated successfully', data);
});
