import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICategory extends Document {
  companyId: Types.ObjectId;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

categorySchema.index({ companyId: 1, slug: 1 }, { unique: true });

export const Category = mongoose.model<ICategory>('Category', categorySchema);
export default Category;
