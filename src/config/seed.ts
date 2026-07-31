import { Role, SYSTEM_ROLES, PERMISSIONS } from '../models/Role.model';
import { User } from '../models/User.model';
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
        // Sync permissions in case list grew
        existing.permissions = r.permissions;
        await existing.save();
      }
    }

    // ─── 2. Seed Default Super Admin User ───
    const superAdminRole = await Role.findOne({ slug: SYSTEM_ROLES.SUPER_ADMIN });
    if (!superAdminRole) {
      throw new Error('Super Admin role must be created before seeding user');
    }

    const adminEmail = env.DEFAULT_ADMIN_EMAIL;
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      await User.create({
        name: 'Super Admin',
        email: adminEmail,
        password: env.DEFAULT_ADMIN_PASSWORD,
        role: superAdminRole._id,
        isActive: true,
      });
      logger.info(`Seeded Super Admin User: ${adminEmail}`);
    }
  } catch (error: any) {
    logger.error(`❌ Seeding failed: ${error.message}`);
  }
};
