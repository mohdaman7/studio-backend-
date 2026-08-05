"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCompanyProfile = exports.getCompanyProfile = exports.updateSettings = exports.getSettings = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const apiResponse_1 = require("../utils/apiResponse");
const CompanySetting_model_1 = require("../models/CompanySetting.model");
const Company_model_1 = require("../models/Company.model");
const zod_1 = require("zod");
const updateSettingsSchema = zod_1.z.object({
    businessName: zod_1.z.string().min(1).optional(),
    address: zod_1.z.string().optional(),
    phone: zod_1.z.string().optional(),
    email: zod_1.z.string().email().optional(),
    gstNumber: zod_1.z.string().optional(),
    currency: zod_1.z.string().length(3).optional(),
    taxEnabled: zod_1.z.boolean().optional(),
    defaultTaxRate: zod_1.z.number().nonnegative().optional(),
    invoicePrefix: zod_1.z.string().optional(),
    invoiceFooter: zod_1.z.string().optional(),
    timezone: zod_1.z.string().optional(),
    dateFormat: zod_1.z.string().optional(),
    lowStockThreshold: zod_1.z.number().int().nonnegative().optional(),
});
// ─── Get Settings ─────────────────────────────────────────────────────────────
exports.getSettings = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const companyId = req.user?.companyId;
    let settings = await CompanySetting_model_1.CompanySetting.findOne({ companyId }).lean().exec();
    if (!settings) {
        // Return defaults if not configured yet
        settings = { companyId };
    }
    return apiResponse_1.ApiResponse.success(res, 'Settings fetched successfully', settings);
});
// ─── Update Settings ──────────────────────────────────────────────────────────
exports.updateSettings = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const companyId = req.user?.companyId;
    const validated = updateSettingsSchema.parse(req.body);
    const settings = await CompanySetting_model_1.CompanySetting.findOneAndUpdate({ companyId }, { $set: validated }, { upsert: true, new: true, runValidators: true }).exec();
    return apiResponse_1.ApiResponse.success(res, 'Settings updated successfully', settings);
});
// ─── Get Company Profile ──────────────────────────────────────────────────────
exports.getCompanyProfile = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const companyId = req.user?.companyId;
    const company = await Company_model_1.Company.findById(companyId).lean().exec();
    if (!company) {
        return apiResponse_1.ApiResponse.notFound(res, 'Company not found');
    }
    return apiResponse_1.ApiResponse.success(res, 'Company profile fetched', company);
});
// ─── Update Company Profile ───────────────────────────────────────────────────
exports.updateCompanyProfile = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const companyId = req.user?.companyId;
    const allowed = ['name', 'address', 'phone', 'email', 'logo', 'website'];
    const update = {};
    allowed.forEach((k) => { if (req.body[k] !== undefined)
        update[k] = req.body[k]; });
    const company = await Company_model_1.Company.findByIdAndUpdate(companyId, { $set: update }, { new: true }).exec();
    if (!company)
        return apiResponse_1.ApiResponse.notFound(res, 'Company not found');
    return apiResponse_1.ApiResponse.success(res, 'Company profile updated', company);
});
