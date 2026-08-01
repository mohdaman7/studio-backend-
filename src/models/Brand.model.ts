import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IBrand extends Document {
  companyId: Types.ObjectId;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const brandSchema = new Schema<IBrand>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

brandSchema.index({ companyId: 1, slug: 1 }, { unique: true });

export const Brand = mongoose.model<IBrand>('Brand', brandSchema);
export default Brand;
