import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICompany extends Document {
  _id: Types.ObjectId;
  name: string;
  taxId?: string;
  email: string;
  phone: string;
  website?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  logoUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const companySchema = new Schema<ICompany>(
  {
    name: { type: String, required: true, trim: true },
    taxId: { type: String, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    website: { type: String, trim: true },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      postalCode: String,
    },
    logoUrl: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Indexes for rapid multi-tenant identification
companySchema.index({ name: 1 });
companySchema.index({ isActive: 1 });

export const Company = mongoose.model<ICompany>('Company', companySchema);
