import { Role, SYSTEM_ROLES, PERMISSIONS } from '../models/Role.model';
import { User } from '../models/User.model';
import { Company } from '../models/Company.model';
import { Branch } from '../models/Branch.model';
import { env } from '../config/env';
import { logger } from '../utils/logger';

export const seedDatabase = async (): Promise<void> => {
  try {
    // ─── 1. Seed Roles & Permissions ───
    const rolesToSeed = [
      {
        name: 'Super Admin',
        slug: SYSTEM_ROLES.SUPER_ADMIN,
        description: 'Full system access bypasses all checks',
        permissions: Object.values(PERMISSIONS),
        isSystem: true,
      },
      {
        name: 'Admin',
        slug: SYSTEM_ROLES.ADMIN,
        description: 'Administrative access for branch management',
        permissions: Object.values(PERMISSIONS).filter((p) => p !== 'role:delete'),
        isSystem: true,
      },
      {
        name: 'Manager',
        slug: SYSTEM_ROLES.MANAGER,
        description: 'Branch manager for sales and inventory control',
        permissions: [
          PERMISSIONS.USER_READ,
          PERMISSIONS.PRODUCT_READ,
          PERMISSIONS.PRODUCT_CREATE,
          PERMISSIONS.PRODUCT_UPDATE,
          PERMISSIONS.CATEGORY_READ,
          PERMISSIONS.CATEGORY_CREATE,
          PERMISSIONS.CATEGORY_UPDATE,
          PERMISSIONS.BRAND_READ,
          PERMISSIONS.BRAND_CREATE,
          PERMISSIONS.BRAND_UPDATE,
          PERMISSIONS.SUPPLIER_READ,
          PERMISSIONS.SUPPLIER_CREATE,
          PERMISSIONS.SUPPLIER_UPDATE,
          PERMISSIONS.CUSTOMER_READ,
          PERMISSIONS.CUSTOMER_CREATE,
          PERMISSIONS.CUSTOMER_UPDATE,
          PERMISSIONS.PURCHASE_READ,
          PERMISSIONS.PURCHASE_CREATE,
          PERMISSIONS.INVENTORY_READ,
          PERMISSIONS.INVENTORY_ADJUST,
          PERMISSIONS.SALE_READ,
          PERMISSIONS.SALE_CREATE,
          PERMISSIONS.INVOICE_READ,
          PERMISSIONS.INVOICE_CREATE,
          PERMISSIONS.CREDIT_READ,
          PERMISSIONS.CREDIT_CREATE,
          PERMISSIONS.EXPENSE_READ,
          PERMISSIONS.EXPENSE_CREATE,
          PERMISSIONS.REPORT_READ,
          PERMISSIONS.DASHBOARD_READ,
          PERMISSIONS.SETTINGS_READ,
        ],
        isSystem: true,
      },
      {
        name: 'Cashier',
        slug: SYSTEM_ROLES.CASHIER,
        description: 'Standard Point of Sale terminal operator',
        permissions: [
          PERMISSIONS.PRODUCT_READ,
          PERMISSIONS.CUSTOMER_READ,
          PERMISSIONS.CUSTOMER_CREATE,
          PERMISSIONS.SALE_CREATE,
          PERMISSIONS.SALE_READ,
          PERMISSIONS.INVOICE_CREATE,
          PERMISSIONS.INVOICE_READ,
          PERMISSIONS.CREDIT_CREATE,
          PERMISSIONS.CREDIT_READ,
          PERMISSIONS.DASHBOARD_READ,
        ],
        isSystem: true,
      },
    ];

    for (const r of rolesToSeed) {
      const existing = await Role.findOne({ slug: r.slug });
      if (!existing) {
        await Role.create(r);
        logger.info(`Seeded Role: ${r.name}`);
      } else {
        existing.permissions = r.permissions;
        await existing.save();
      }
    }

    // ─── 2. Seed Default Tenant Company & Branch ───
    const companyName = env.APP_NAME || 'Studio99 ERP';
    let company = await Company.findOne({ name: companyName });

    if (!company) {
      company = await Company.create({
        name: companyName,
        email: env.DEFAULT_ADMIN_EMAIL,
        phone: '+0000000000',
        isActive: true,
      });
      logger.info(`Seeded Company: ${company.name}`);
    }

    const branchName = env.DEFAULT_BRANCH_NAME || 'Main Branch';
    const branchCode = branchName.toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 10) || 'MAIN';
    let branch = await Branch.findOne({ companyId: company._id, name: branchName });

    if (!branch) {
      // Check if code duplicate exists to prevent E11000 errors
      const duplicateCodeBranch = await Branch.findOne({ companyId: company._id, code: branchCode });
      if (duplicateCodeBranch) {
        branch = duplicateCodeBranch;
      } else {
        branch = await Branch.create({
          companyId: company._id,
          name: branchName,
          code: branchCode,
          phone: '+0000000000',
          email: env.DEFAULT_ADMIN_EMAIL,
          isActive: true,
        });
        logger.info(`Seeded Branch: ${branch.name}`);
      }
    }

    // ─── 3. Seed Default Super Admin User ───
    const superAdminRole = await Role.findOne({ slug: SYSTEM_ROLES.SUPER_ADMIN });
    if (!superAdminRole) {
      throw new Error('Super Admin role must be created before seeding user');
    }

    const adminEmail = env.DEFAULT_ADMIN_EMAIL;
    let existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      try {
        await User.create({
          companyId: company._id,
          branchId: branch._id,
          name: 'Super Admin',
          email: adminEmail,
          password: env.DEFAULT_ADMIN_PASSWORD,
          role: superAdminRole._id,
          isActive: true,
        });
        logger.info(`Seeded Super Admin User: ${adminEmail}`);
      } catch (error: any) {
        if (error?.code === 11000 || error?.codeName === 'DuplicateKey') {
          existingAdmin = await User.findOne({ email: adminEmail });
          if (!existingAdmin) {
            throw error;
          }
        } else {
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
    let existingEpicAdmin = await User.findOne({ email: epicAdminEmail });

    if (!existingEpicAdmin) {
      try {
        await User.create({
          companyId: company._id,
          branchId: branch._id,
          name: 'Epic Admin',
          email: epicAdminEmail,
          password: env.DEFAULT_ADMIN_PASSWORD || 'Admin@123456',
          role: superAdminRole._id,
          isActive: true,
        });
        logger.info(`Seeded Epic Admin User: ${epicAdminEmail}`);
      } catch (error: any) {
        if (error?.code === 11000 || error?.codeName === 'DuplicateKey') {
          existingEpicAdmin = await User.findOne({ email: epicAdminEmail });
          if (!existingEpicAdmin) {
            throw error;
          }
        } else {
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
      logger.info(`Updated epicadmin@gmail.com to Super Admin role`);
    }
  } catch (error: any) {
    logger.error(`❌ Seeding failed: ${error.message}`);
    // Do not crash the entire server startup if database seeding fails, log it instead
  }
};
