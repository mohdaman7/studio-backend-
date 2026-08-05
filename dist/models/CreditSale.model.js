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
exports.CreditSale = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const creditPaymentLogSchema = new mongoose_1.Schema({
    amount: { type: Number, required: true, min: 0.01 },
    paymentMethod: { type: String, enum: ['cash', 'card', 'upi'], required: true },
    paidAt: { type: Date, default: Date.now },
    receivedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
});
const creditSaleSchema = new mongoose_1.Schema({
    companyId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Company', required: true },
    branchId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Branch', required: true },
    customerId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Customer', required: true },
    saleId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Sale', required: true },
    totalCreditAmount: { type: Number, required: true },
    paidAmount: { type: Number, required: true, default: 0 },
    dueAmount: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    status: {
        type: String,
        enum: ['active', 'settled', 'overdue'],
        default: 'active',
    },
    paymentLogs: [creditPaymentLogSchema],
}, { timestamps: true });
creditSaleSchema.index({ companyId: 1, customerId: 1 });
creditSaleSchema.index({ dueDate: 1 });
exports.CreditSale = mongoose_1.default.model('CreditSale', creditSaleSchema);
exports.default = exports.CreditSale;
