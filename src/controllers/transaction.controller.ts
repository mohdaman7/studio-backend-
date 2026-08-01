import { Request, Response } from 'express';
import { transactionService } from '../services/transaction.service';
import { dashboardService } from '../services/dashboard.service';
import { ApiResponse } from '../utils/apiResponse';
import {
  createSaleSchema,
  createPurchaseSchema,
  createExpenseSchema,
  creditPaymentSchema,
  inventoryAdjustSchema,
} from '../validators/transaction.validator';
import { asyncHandler } from '../utils/asyncHandler';

// Helpers to get parameters safely
const getParamId = (req: Request): string => String(req.params.id || '');
const getParamType = (req: Request): string => String(req.params.type || '');

// ─── Sales ───────────────────────────────────────────────────────────────────
export const createSale = asyncHandler(async (req: Request, res: Response) => {
  const validated = createSaleSchema.parse({
    ...req.body,
    companyId: req.body.companyId || (req.user as any)?.companyId,
    branchId: req.body.branchId || (req.user as any)?.branchId,
  });
  const cashierId = (req.user as any)?.userId || '';
  const sale = await transactionService.createSale(validated, cashierId);
  return ApiResponse.created(res, 'Sale completed successfully', sale);
});

export const getSales = asyncHandler(async (req: Request, res: Response) => {
  const result = await transactionService.getAllSales(req);
  return ApiResponse.paginated(res, 'Sales fetched successfully', result.data, result.page, result.limit, result.total);
});

export const getSaleById = asyncHandler(async (req: Request, res: Response) => {
  const id = getParamId(req);
  const sale = await transactionService.getSaleById(id);
  return ApiResponse.success(res, 'Sale fetched successfully', sale);
});

export const cancelSale = asyncHandler(async (req: Request, res: Response) => {
  const id = getParamId(req);
  const userId = (req.user as any)?.userId || '';
  const result = await transactionService.cancelSale(id, userId);
  return ApiResponse.success(res, 'Sale cancelled successfully', result);
});

// ─── Purchases ───────────────────────────────────────────────────────────────
export const createPurchase = asyncHandler(async (req: Request, res: Response) => {
  const validated = createPurchaseSchema.parse({
    ...req.body,
    companyId: req.body.companyId || (req.user as any)?.companyId,
    branchId: req.body.branchId || (req.user as any)?.branchId,
  });
  const userId = (req.user as any)?.userId || '';
  const purchase = await transactionService.createPurchase(validated, userId);
  return ApiResponse.created(res, 'Purchase recorded successfully', purchase);
});

export const getPurchases = asyncHandler(async (req: Request, res: Response) => {
  const result = await transactionService.getAllPurchases(req);
  return ApiResponse.paginated(res, 'Purchases fetched successfully', result.data, result.page, result.limit, result.total);
});

// ─── Credit Sales ─────────────────────────────────────────────────────────────
export const getCreditSales = asyncHandler(async (req: Request, res: Response) => {
  const result = await transactionService.getCreditSales(req);
  return ApiResponse.paginated(res, 'Credit sales fetched successfully', result.data, result.page, result.limit, result.total);
});

export const recordCreditPayment = asyncHandler(async (req: Request, res: Response) => {
  const id = getParamId(req);
  const validated = creditPaymentSchema.parse(req.body);
  const userId = (req.user as any)?.userId || '';
  const result = await transactionService.recordCreditPayment(id, validated, userId);
  return ApiResponse.success(res, 'Payment recorded successfully', result);
});

// ─── Expenses ────────────────────────────────────────────────────────────────
export const createExpense = asyncHandler(async (req: Request, res: Response) => {
  const validated = createExpenseSchema.parse({
    ...req.body,
    companyId: req.body.companyId || (req.user as any)?.companyId,
    branchId: req.body.branchId || (req.user as any)?.branchId,
  });
  const userId = (req.user as any)?.userId || '';
  const expense = await transactionService.createExpense(validated, userId);
  return ApiResponse.created(res, 'Expense recorded successfully', expense);
});

export const getExpenses = asyncHandler(async (req: Request, res: Response) => {
  const result = await transactionService.getAllExpenses(req);
  return ApiResponse.paginated(res, 'Expenses fetched successfully', result.data, result.page, result.limit, result.total);
});

// ─── Inventory ────────────────────────────────────────────────────────────────
export const adjustInventory = asyncHandler(async (req: Request, res: Response) => {
  const validated = inventoryAdjustSchema.parse({
    ...req.body,
    companyId: req.body.companyId || (req.user as any)?.companyId,
    branchId: req.body.branchId || (req.user as any)?.branchId,
  });
  const userId = (req.user as any)?.userId || '';
  const result = await transactionService.adjustInventory(validated, userId);
  return ApiResponse.success(res, 'Inventory adjusted successfully', result);
});

export const getStockLedger = asyncHandler(async (req: Request, res: Response) => {
  const result = await transactionService.getStockLedger(req);
  return ApiResponse.paginated(res, 'Stock ledger fetched successfully', result.data, result.page, result.limit, result.total);
});

// ─── Dashboard & Reports ─────────────────────────────────────────────────────
export const getDashboardData = asyncHandler(async (req: Request, res: Response) => {
  const branchId = req.query.branchId as string | undefined;
  const data = await dashboardService.getDashboardData(branchId);
  return ApiResponse.success(res, 'Dashboard metrics fetched successfully', data);
});

export const getReports = asyncHandler(async (req: Request, res: Response) => {
  const type = getParamType(req);
  const data = await dashboardService.getReports(type, req.query);
  return ApiResponse.success(res, 'Report generated successfully', data);
});
