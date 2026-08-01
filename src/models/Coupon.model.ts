import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICoupon extends Document {
  companyId: Types.ObjectId;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  isActive: boolean;
  expiryDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const couponSchema = new Schema<ICoupon>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    code: { type: String, required: true, uppercase: true, trim: true },
    discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
    discountValue: { type: Number, required: true, min: 0 },
    minOrderValue: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
    expiryDate: { type: Date, required: true },
  },
  { timestamps: true }
);

couponSchema.index({ companyId: 1, code: 1 }, { unique: true });

export const Coupon = mongoose.model<ICoupon>('Coupon', couponSchema);
export default Coupon;
