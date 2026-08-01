import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISupplier extends Document {
  companyId: Types.ObjectId;
  name: string;
  phone: string;
  email?: string;
  gstNumber?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const supplierSchema = new Schema<ISupplier>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    gstNumber: { type: String, uppercase: true, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

supplierSchema.index({ companyId: 1, phone: 1 }, { unique: true });

export const Supplier = mongoose.model<ISupplier>('Supplier', supplierSchema);
export default Supplier;
