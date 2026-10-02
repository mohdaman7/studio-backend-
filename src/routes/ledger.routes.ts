import { Router, Request, Response } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/apiResponse';
import { DailySettlement } from '../models/DailySettlement.model';
import { CashDraw } from '../models/CashDraw.model';

const router = Router();
router.use(authenticate);

// ─── Daily Settlements ───────────────────────────────────────────────────────

// GET /daily-settlements?limit=90
router.get('/daily-settlements', asyncHandler(async (req: Request, res: Response) => {
  const companyId = req.body.companyId || (req.user as any)?.companyId;
  const branchId = req.body.branchId || (req.user as any)?.branchId;
  const limit = Math.min(Number(req.query.limit) || 90, 366);

  const filter: any = {};
  if (companyId) filter.companyId = companyId;
  if (branchId) filter.branchId = branchId;

  const records = await DailySettlement.find(filter)
    .sort({ date: -1 })
    .limit(limit)
    .lean();

  return ApiResponse.success(res, 'Settlements fetched', records);
}));

// GET /daily-settlements/:date  (e.g. 2026-10-01)
router.get('/daily-settlements/:date', asyncHandler(async (req: Request, res: Response) => {
  const companyId = (req.user as any)?.companyId;
  const branchId = (req.user as any)?.branchId;
  const filter: any = { date: req.params.date };
  if (companyId) filter.companyId = companyId;
  if (branchId) filter.branchId = branchId;

  const record = await DailySettlement.findOne(filter).lean();
  return ApiResponse.success(res, record ? 'Settlement found' : 'No settlement for this date', record || null);
}));

// POST /daily-settlements  — upsert (create or update for that date)
router.post('/daily-settlements', asyncHandler(async (req: Request, res: Response) => {
  const companyId = req.body.companyId || (req.user as any)?.companyId;
  const branchId = req.body.branchId || (req.user as any)?.branchId;
  const userId = (req.user as any)?.userId || (req.user as any)?.id;

  const { date, openingCb, cashSales, upiSales, cardSales, totalExpenses, expenseItems, cashTaken, notes, closingCb } = req.body;

  if (!date) {
    return res.status(400).json({ success: false, message: 'date is required (YYYY-MM-DD)' });
  }

  const filter: any = { date };
  if (companyId) filter.companyId = companyId;
  if (branchId) filter.branchId = branchId;

  const update = {
    companyId,
    branchId,
    date,
    openingCb: Number(openingCb ?? 0),
    cashSales: Number(cashSales ?? 0),
    upiSales: Number(upiSales ?? 0),
    cardSales: Number(cardSales ?? 0),
    totalExpenses: Number(totalExpenses ?? 0),
    expenseItems: expenseItems || [],
    cashTaken: Number(cashTaken ?? 0),
    notes: notes || '',
    closingCb: Number(closingCb ?? 0),
    savedBy: userId,
  };

  const record = await DailySettlement.findOneAndUpdate(
    filter,
    { $set: update },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return ApiResponse.success(res, 'Settlement saved successfully', record);
}));

// DELETE /daily-settlements/:date
router.delete('/daily-settlements/:date', asyncHandler(async (req: Request, res: Response) => {
  const companyId = (req.user as any)?.companyId;
  const branchId = (req.user as any)?.branchId;
  const filter: any = { date: req.params.date };
  if (companyId) filter.companyId = companyId;
  if (branchId) filter.branchId = branchId;
  await DailySettlement.findOneAndDelete(filter);
  return ApiResponse.success(res, 'Settlement deleted', null);
}));

// ─── Cash Draws ──────────────────────────────────────────────────────────────

// GET /cash-draws?limit=200
router.get('/cash-draws', asyncHandler(async (req: Request, res: Response) => {
  const companyId = (req.user as any)?.companyId;
  const branchId = (req.user as any)?.branchId;
  const limit = Math.min(Number(req.query.limit) || 200, 1000);

  const filter: any = {};
  if (companyId) filter.companyId = companyId;
  if (branchId) filter.branchId = branchId;

  const draws = await CashDraw.find(filter)
    .sort({ date: -1, createdAt: -1 })
    .limit(limit)
    .lean();

  return ApiResponse.success(res, 'Cash draws fetched', draws);
}));

// POST /cash-draws
router.post('/cash-draws', asyncHandler(async (req: Request, res: Response) => {
  const companyId = req.body.companyId || (req.user as any)?.companyId;
  const branchId = req.body.branchId || (req.user as any)?.branchId;
  const userId = (req.user as any)?.userId || (req.user as any)?.id;

  const { date, amount, note } = req.body;
  if (!date || !amount) {
    return res.status(400).json({ success: false, message: 'date and amount are required' });
  }

  const draw = await CashDraw.create({
    companyId,
    branchId,
    date,
    amount: Number(amount),
    note: note || 'Cash taken by owner',
    recordedBy: userId,
  });

  return ApiResponse.created(res, 'Cash draw recorded', draw);
}));

// DELETE /cash-draws/:id
router.delete('/cash-draws/:id', asyncHandler(async (req: Request, res: Response) => {
  await CashDraw.findByIdAndDelete(req.params.id);
  return ApiResponse.success(res, 'Cash draw removed', null);
}));

export default router;
