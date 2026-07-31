import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICompanySetting extends Document {
  companyId: Types.ObjectId;
  invoicePrefix: string;
  nextInvoiceNumber: number;
  barcodeSettings: {
    skuPrefix: string;
    width: number;
    height: number;
  };
  gstRate: number;
  currency: string;
  currencySymbol: string;
  createdAt: Date;
  updatedAt: Date;
}

const companySettingSchema = new Schema<ICompanySetting>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, unique: true },
    invoicePrefix: { type: String, default: 'INV' },
    nextInvoiceNumber: { type: Number, default: 1 },
    barcodeSettings: {
      skuPrefix: { type: String, default: 'DRS' },
      width: { type: Number, default: 2 },
      height: { type: Number, default: 100 },
    },
    gstRate: { type: Number, default: 18 },
    currency: { type: String, default: 'INR' },
    currencySymbol: { type: String, default: '₹' },
  },
  { timestamps: true }
);

export const CompanySetting = mongoose.model<ICompanySetting>('CompanySetting', companySettingSchema);
export default CompanySetting;
