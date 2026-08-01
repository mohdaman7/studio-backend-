import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICustomer extends Document {
  companyId: Types.ObjectId;
  name: string;
  phone: string;
  email?: string;
  loyaltyPoints: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const customerSchema = new Schema<ICustomer>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    loyaltyPoints: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Composed index for unique validation within each SaaS tenant
customerSchema.index({ companyId: 1, phone: 1 }, { unique: true });

export const Customer = mongoose.model<ICustomer>('Customer', customerSchema);
export default Customer;
