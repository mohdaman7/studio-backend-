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
exports.Role = exports.PERMISSIONS = exports.SYSTEM_ROLES = void 0;
const mongoose_1 = __importStar(require("mongoose"));
exports.SYSTEM_ROLES = {
    SUPER_ADMIN: 'super-admin',
    ADMIN: 'admin',
    MANAGER: 'manager',
    CASHIER: 'cashier'
};
exports.PERMISSIONS = {
    USER_READ: 'user:read',
    USER_CREATE: 'user:create',
    USER_UPDATE: 'user:update',
    USER_DELETE: 'user:delete',
    ROLE_READ: 'role:read',
    ROLE_CREATE: 'role:create',
    ROLE_UPDATE: 'role:update',
    ROLE_DELETE: 'role:delete',
    PRODUCT_READ: 'product:read',
    PRODUCT_CREATE: 'product:create',
    PRODUCT_UPDATE: 'product:update',
    PRODUCT_DELETE: 'product:delete',
    CATEGORY_READ: 'category:read',
    CATEGORY_CREATE: 'category:create',
    CATEGORY_UPDATE: 'category:update',
    CATEGORY_DELETE: 'category:delete',
    BRAND_READ: 'brand:read',
    BRAND_CREATE: 'brand:create',
    BRAND_UPDATE: 'brand:update',
    BRAND_DELETE: 'brand:delete',
    SUPPLIER_READ: 'supplier:read',
    SUPPLIER_CREATE: 'supplier:create',
    SUPPLIER_UPDATE: 'supplier:update',
    SUPPLIER_DELETE: 'supplier:delete',
    CUSTOMER_READ: 'customer:read',
    CUSTOMER_CREATE: 'customer:create',
    CUSTOMER_UPDATE: 'customer:update',
    CUSTOMER_DELETE: 'customer:delete',
    PURCHASE_READ: 'purchases:read',
    PURCHASE_CREATE: 'purchases:create',
    PURCHASE_UPDATE: 'purchases:update',
    PURCHASE_DELETE: 'purchases:delete',
    INVENTORY_READ: 'inventory:read',
    INVENTORY_ADJUST: 'inventory:write',
    SALE_READ: 'sales:read',
    SALE_CREATE: 'sales:create',
    SALE_UPDATE: 'sales:update',
    SALE_DELETE: 'sales:delete',
    INVOICE_READ: 'invoice:read',
    INVOICE_CREATE: 'invoice:create',
    CREDIT_READ: 'credit:read',
    CREDIT_CREATE: 'credit:create',
    CREDIT_WRITE: 'credit:write',
    EXPENSE_READ: 'expenses:read',
    EXPENSE_CREATE: 'expenses:create',
    REPORT_READ: 'reports:read',
    DASHBOARD_READ: 'dashboard:read',
    SETTINGS_READ: 'settings:read',
    SETTINGS_WRITE: 'settings:write',
    AUDIT_READ: 'audit:read'
};
const roleSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    permissions: [{ type: String, required: true }],
    isSystem: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
roleSchema.index({ slug: 1 }, { unique: true });
exports.Role = mongoose_1.default.model('Role', roleSchema);
exports.default = exports.Role;
