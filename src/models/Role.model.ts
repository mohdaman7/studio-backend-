import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IRole extends Document {
  name: string;
  slug: string;
  permissions: string[];
  isSystem: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const roleSchema = new Schema<IRole>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    permissions: [{ type: String, required: true }],
    isSystem: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

roleSchema.index({ slug: 1 }, { unique: true });

export const Role = mongoose.model<IRole>('Role', roleSchema);
export default Role;
