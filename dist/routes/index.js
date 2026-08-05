"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRoutes = void 0;
const auth_routes_1 = __importDefault(require("./auth.routes"));
const user_routes_1 = __importDefault(require("./user.routes"));
const product_routes_1 = __importDefault(require("./product.routes"));
const transaction_routes_1 = __importDefault(require("./transaction.routes"));
const settings_routes_1 = __importDefault(require("./settings.routes"));
const notification_routes_1 = __importDefault(require("./notification.routes"));
const auditLog_routes_1 = __importDefault(require("./auditLog.routes"));
const registerRoutes = (app, prefix) => {
    // Auth (no prefix duplication — auth router internally maps /login, /register etc.)
    app.use(`${prefix}/auth`, auth_routes_1.default);
    // User & Roles
    app.use(prefix, user_routes_1.default);
    // Products, Categories, Brands, Suppliers, Customers, Inventory
    app.use(prefix, product_routes_1.default);
    // Sales, Purchases, Credit Sales, Expenses, Dashboard, Reports
    app.use(prefix, transaction_routes_1.default);
    // Settings & Company Profile
    app.use(prefix, settings_routes_1.default);
    // Notifications
    app.use(prefix, notification_routes_1.default);
    // Audit Logs
    app.use(prefix, auditLog_routes_1.default);
};
exports.registerRoutes = registerRoutes;
