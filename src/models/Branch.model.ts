import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IBranch extends Document {
  _id: Types.ObjectId;
  companyId: Types.ObjectId;
  name: string;
  code: string; // e.g. BR-001
  phone: string;
  email?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const branchSchema = new Schema<IBranch>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      postalCode: String,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Indexes
branchSchema.index({ companyId: 1, isActive: 1 });
branchSchema.index({ code: 1 });

export const Branch = mongoose.model<IBranch>('Branch', branchSchema);
