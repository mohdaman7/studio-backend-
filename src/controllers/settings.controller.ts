import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/apiResponse';
import { CompanySetting } from '../models/CompanySetting.model';
import { Company } from '../models/Company.model';
import { z } from 'zod';

const updateSettingsSchema = z.object({
  businessName: z.string().min(1).optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  gstNumber: z.string().optional(),
  currency: z.string().length(3).optional(),
  taxEnabled: z.boolean().optional(),
  defaultTaxRate: z.number().nonnegative().optional(),
  invoicePrefix: z.string().optional(),
  invoiceFooter: z.string().optional(),
  timezone: z.string().optional(),
  dateFormat: z.string().optional(),
  lowStockThreshold: z.number().int().nonnegative().optional(),
});

// ─── Get Settings ─────────────────────────────────────────────────────────────
export const getSettings = asyncHandler(async (req: Request, res: Response) => {
  const companyId = (req.user as any)?.companyId;
  
  let settings = await CompanySetting.findOne({ companyId }).lean().exec();
  
  if (!settings) {
    // Return defaults if not configured yet
    settings = { companyId } as any;
  }
  
  return ApiResponse.success(res, 'Settings fetched successfully', settings);
});

// ─── Update Settings ──────────────────────────────────────────────────────────
export const updateSettings = asyncHandler(async (req: Request, res: Response) => {
  const companyId = (req.user as any)?.companyId;
  const validated = updateSettingsSchema.parse(req.body);

  const settings = await CompanySetting.findOneAndUpdate(
    { companyId },
    { $set: validated },
    { upsert: true, new: true, runValidators: true }
  ).exec();

  return ApiResponse.success(res, 'Settings updated successfully', settings);
});

// ─── Get Company Profile ──────────────────────────────────────────────────────
export const getCompanyProfile = asyncHandler(async (req: Request, res: Response) => {
  const companyId = (req.user as any)?.companyId;
  const company = await Company.findById(companyId).lean().exec();
  if (!company) {
    return ApiResponse.notFound(res, 'Company not found');
  }
  return ApiResponse.success(res, 'Company profile fetched', company);
});

// ─── Update Company Profile ───────────────────────────────────────────────────
export const updateCompanyProfile = asyncHandler(async (req: Request, res: Response) => {
  const companyId = (req.user as any)?.companyId;
  const allowed = ['name', 'address', 'phone', 'email', 'logo', 'website'];
  const update: any = {};
  allowed.forEach((k) => { if (req.body[k] !== undefined) update[k] = req.body[k]; });

  const company = await Company.findByIdAndUpdate(companyId, { $set: update }, { new: true }).exec();
  if (!company) return ApiResponse.notFound(res, 'Company not found');

  return ApiResponse.success(res, 'Company profile updated', company);
});
