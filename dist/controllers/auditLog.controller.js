"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuditLog = exports.getAuditLogs = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const apiResponse_1 = require("../utils/apiResponse");
const AuditLog_model_1 = require("../models/AuditLog.model");
const mongoose_1 = __importDefault(require("mongoose"));
// ─── Get Audit Logs ───────────────────────────────────────────────────────────
exports.getAuditLogs = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const companyId = req.user?.companyId;
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '20', 10);
    const skip = (page - 1) * limit;
    const filter = { companyId: new mongoose_1.default.Types.ObjectId(companyId) };
    if (req.query.module)
        filter.module = req.query.module;
    if (req.query.userId)
        filter.userId = new mongoose_1.default.Types.ObjectId(req.query.userId);
    if (req.query.action)
        filter.action = { $regex: req.query.action, $options: 'i' };
    if (req.query.startDate || req.query.endDate) {
        filter.createdAt = {};
        if (req.query.startDate)
            filter.createdAt.$gte = new Date(req.query.startDate);
        if (req.query.endDate)
            filter.createdAt.$lte = new Date(req.query.endDate);
    }
    const [data, total] = await Promise.all([
        AuditLog_model_1.AuditLog.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('userId', 'name email')
            .lean()
            .exec(),
        AuditLog_model_1.AuditLog.countDocuments(filter).exec(),
    ]);
    return apiResponse_1.ApiResponse.paginated(res, 'Audit logs fetched successfully', data, page, limit, total);
});
// ─── Create Audit Entry (Internal helper exposed as API) ──────────────────────
exports.createAuditLog = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const companyId = req.user?.companyId;
    const userId = req.user?.userId;
    const log = await AuditLog_model_1.AuditLog.create({
        companyId,
        userId,
        action: req.body.action,
        module: req.body.module,
        details: req.body.details,
        ipAddress: req.ip,
    });
    return apiResponse_1.ApiResponse.created(res, 'Audit log created', log);
});
