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
const userController = __importStar(require("../controllers/user.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const rbac_middleware_1 = require("../middlewares/rbac.middleware");
const router = (0, express_1.Router)();
// Apply authentication to all user/role routes
router.use(auth_middleware_1.authenticate);
// Users CRUD
router.get('/users', (0, rbac_middleware_1.authorize)('user:read'), userController.getUsers);
router.get('/users/:id', (0, rbac_middleware_1.authorize)('user:read'), userController.getUserById);
router.post('/users', (0, rbac_middleware_1.authorize)('user:create'), userController.createUser);
router.put('/users/:id', (0, rbac_middleware_1.authorize)('user:update'), userController.updateUser);
router.delete('/users/:id', (0, rbac_middleware_1.authorize)('user:delete'), userController.deleteUser);
router.patch('/users/:id/toggle-status', (0, rbac_middleware_1.authorize)('user:update'), userController.toggleUserActive);
// Roles CRUD
router.get('/roles', (0, rbac_middleware_1.authorize)('role:read'), userController.getRoles);
router.get('/roles/:id', (0, rbac_middleware_1.authorize)('role:read'), userController.getRoleById);
router.post('/roles', (0, rbac_middleware_1.authorize)('role:create'), userController.createRole);
router.put('/roles/:id', (0, rbac_middleware_1.authorize)('role:update'), userController.updateRole);
router.delete('/roles/:id', (0, rbac_middleware_1.authorize)('role:delete'), userController.deleteRole);
exports.default = router;
