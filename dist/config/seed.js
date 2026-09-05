"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDatabase = void 0;
const Role_model_1 = require("../models/Role.model");
const User_model_1 = require("../models/User.model");
const Company_model_1 = require("../models/Company.model");
const Branch_model_1 = require("../models/Branch.model");
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
const seedDatabase = async () => {
    try {
        // ─── 1. Seed Roles & Permissions ───
        const rolesToSeed = [
            {
                name: 'Super Admin',
                slug: Role_model_1.SYSTEM_ROLES.SUPER_ADMIN,
                description: 'Full system access bypasses all checks',
                permissions: Object.values(Role_model_1.PERMISSIONS),
                isSystem: true,
            },
            {
                name: 'Admin',
                slug: Role_model_1.SYSTEM_ROLES.ADMIN,
                description: 'Administrative access for branch management',
                permissions: Object.values(Role_model_1.PERMISSIONS).filter((p) => p !== 'role:delete'),
                isSystem: true,
            },
            {
                name: 'Manager',
                slug: Role_model_1.SYSTEM_ROLES.MANAGER,
                description: 'Branch manager for sales and inventory control',
                permissions: [
                    Role_model_1.PERMISSIONS.USER_READ,
                    Role_model_1.PERMISSIONS.PRODUCT_READ,
                    Role_model_1.PERMISSIONS.PRODUCT_CREATE,
                    Role_model_1.PERMISSIONS.PRODUCT_UPDATE,
                    Role_model_1.PERMISSIONS.CATEGORY_READ,
                    Role_model_1.PERMISSIONS.CATEGORY_CREATE,
                    Role_model_1.PERMISSIONS.CATEGORY_UPDATE,
                    Role_model_1.PERMISSIONS.BRAND_READ,
                    Role_model_1.PERMISSIONS.BRAND_CREATE,
                    Role_model_1.PERMISSIONS.BRAND_UPDATE,
                    Role_model_1.PERMISSIONS.SUPPLIER_READ,
                    Role_model_1.PERMISSIONS.SUPPLIER_CREATE,
                    Role_model_1.PERMISSIONS.SUPPLIER_UPDATE,
                    Role_model_1.PERMISSIONS.CUSTOMER_READ,
                    Role_model_1.PERMISSIONS.CUSTOMER_CREATE,
                    Role_model_1.PERMISSIONS.CUSTOMER_UPDATE,
                    Role_model_1.PERMISSIONS.PURCHASE_READ,
                    Role_model_1.PERMISSIONS.PURCHASE_CREATE,
                    Role_model_1.PERMISSIONS.INVENTORY_READ,
                    Role_model_1.PERMISSIONS.INVENTORY_ADJUST,
                    Role_model_1.PERMISSIONS.SALE_READ,
                    Role_model_1.PERMISSIONS.SALE_CREATE,
                    Role_model_1.PERMISSIONS.INVOICE_READ,
                    Role_model_1.PERMISSIONS.INVOICE_CREATE,
                    Role_model_1.PERMISSIONS.CREDIT_READ,
                    Role_model_1.PERMISSIONS.CREDIT_CREATE,
                    Role_model_1.PERMISSIONS.EXPENSE_READ,
                    Role_model_1.PERMISSIONS.EXPENSE_CREATE,
                    Role_model_1.PERMISSIONS.REPORT_READ,
                    Role_model_1.PERMISSIONS.DASHBOARD_READ,
                    Role_model_1.PERMISSIONS.SETTINGS_READ,
                ],
                isSystem: true,
            },
            {
                name: 'Cashier',
                slug: Role_model_1.SYSTEM_ROLES.CASHIER,
                description: 'Standard Point of Sale terminal operator',
                permissions: [
                    Role_model_1.PERMISSIONS.PRODUCT_READ,
                    Role_model_1.PERMISSIONS.CUSTOMER_READ,
                    Role_model_1.PERMISSIONS.CUSTOMER_CREATE,
                    Role_model_1.PERMISSIONS.SALE_CREATE,
                    Role_model_1.PERMISSIONS.SALE_READ,
                    Role_model_1.PERMISSIONS.INVOICE_CREATE,
                    Role_model_1.PERMISSIONS.INVOICE_READ,
                    Role_model_1.PERMISSIONS.CREDIT_CREATE,
                    Role_model_1.PERMISSIONS.CREDIT_READ,
                    Role_model_1.PERMISSIONS.DASHBOARD_READ,
                ],
                isSystem: true,
            },
        ];
        for (const r of rolesToSeed) {
            const existing = await Role_model_1.Role.findOne({ slug: r.slug });
            if (!existing) {
                await Role_model_1.Role.create(r);
                logger_1.logger.info(`Seeded Role: ${r.name}`);
            }
            else {
                existing.permissions = r.permissions;
                await existing.save();
            }
        }
        // ─── 2. Seed Default Tenant Company & Branch ───
        const companyName = env_1.env.APP_NAME || 'Studio99 ERP';
        let company = await Company_model_1.Company.findOne({ name: companyName });
        if (!company) {
            company = await Company_model_1.Company.create({
                name: companyName,
                email: env_1.env.DEFAULT_ADMIN_EMAIL,
                phone: '+0000000000',
                isActive: true,
            });
            logger_1.logger.info(`Seeded Company: ${company.name}`);
        }
        const branchName = env_1.env.DEFAULT_BRANCH_NAME || 'Main Branch';
        const branchCode = branchName.toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 10) || 'MAIN';
        let branch = await Branch_model_1.Branch.findOne({ companyId: company._id, name: branchName });
        if (!branch) {
            // Check if code duplicate exists to prevent E11000 errors
            const duplicateCodeBranch = await Branch_model_1.Branch.findOne({ companyId: company._id, code: branchCode });
            if (duplicateCodeBranch) {
                branch = duplicateCodeBranch;
            }
            else {
                branch = await Branch_model_1.Branch.create({
                    companyId: company._id,
                    name: branchName,
                    code: branchCode,
                    phone: '+0000000000',
                    email: env_1.env.DEFAULT_ADMIN_EMAIL,
                    isActive: true,
                });
                logger_1.logger.info(`Seeded Branch: ${branch.name}`);
            }
        }
        // ─── 3. Seed Default Super Admin User ───
        const superAdminRole = await Role_model_1.Role.findOne({ slug: Role_model_1.SYSTEM_ROLES.SUPER_ADMIN });
        if (!superAdminRole) {
            throw new Error('Super Admin role must be created before seeding user');
        }
        const adminEmail = env_1.env.DEFAULT_ADMIN_EMAIL;
        let existingAdmin = await User_model_1.User.findOne({ email: adminEmail });
        if (!existingAdmin) {
            try {
                await User_model_1.User.create({
                    companyId: company._id,
                    branchId: branch._id,
                    name: 'Super Admin',
                    email: adminEmail,
                    password: env_1.env.DEFAULT_ADMIN_PASSWORD,
                    role: superAdminRole._id,
                    isActive: true,
                });
                logger_1.logger.info(`Seeded Super Admin User: ${adminEmail}`);
            }
            catch (error) {
                if (error?.code === 11000 || error?.codeName === 'DuplicateKey') {
                    existingAdmin = await User_model_1.User.findOne({ email: adminEmail });
                    if (!existingAdmin) {
                        throw error;
                    }
                }
                else {
                    throw error;
                }
            }
        }
        if (existingAdmin) {
            existingAdmin.companyId = company._id;
            existingAdmin.branchId = branch._id;
            existingAdmin.role = superAdminRole._id;
            existingAdmin.isActive = true;
            await existingAdmin.save();
        }
        // ─── 4. Seed epicadmin@gmail.com User ───
        const epicAdminEmail = 'epicadmin@gmail.com';
        let existingEpicAdmin = await User_model_1.User.findOne({ email: epicAdminEmail });
        if (!existingEpicAdmin) {
            try {
                await User_model_1.User.create({
                    companyId: company._id,
                    branchId: branch._id,
                    name: 'Epic Admin',
                    email: epicAdminEmail,
                    password: env_1.env.DEFAULT_ADMIN_PASSWORD || 'Admin@123456',
                    role: superAdminRole._id,
                    isActive: true,
                });
                logger_1.logger.info(`Seeded Epic Admin User: ${epicAdminEmail}`);
            }
            catch (error) {
                if (error?.code === 11000 || error?.codeName === 'DuplicateKey') {
                    existingEpicAdmin = await User_model_1.User.findOne({ email: epicAdminEmail });
                    if (!existingEpicAdmin) {
                        throw error;
                    }
                }
                else {
                    throw error;
                }
            }
        }
        if (existingEpicAdmin) {
            existingEpicAdmin.companyId = company._id;
            existingEpicAdmin.branchId = branch._id;
            existingEpicAdmin.role = superAdminRole._id;
            existingEpicAdmin.isActive = true;
            await existingEpicAdmin.save();
            logger_1.logger.info(`Updated epicadmin@gmail.com to Super Admin role`);
        }
    }
    catch (error) {
        logger_1.logger.error(`❌ Seeding failed: ${error.message}`);
        // Do not crash the entire server startup if database seeding fails, log it instead
    }
};
exports.seedDatabase = seedDatabase;
