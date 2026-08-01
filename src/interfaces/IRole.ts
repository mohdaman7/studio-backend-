import { Schema, Document, Types } from 'mongoose';

export interface IRole extends Document {
  name: string;
  slug: string;
  permissions: string[];
  isSystem: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
export const SYSTEM_ROLES = {
  SUPER_ADMIN: 'super-admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  CASHIER: 'cashier',
  INVENTORY: 'inventory',
} as const;
