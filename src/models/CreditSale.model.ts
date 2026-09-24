import mongoose, { Schema, Document, Types } from 'mongoose';

export type CreditSaleStatus = 'active' | 'settled' | 'overdue';

export interface ICreditPaymentLog {
  amount: number;
  paymentMethod: 'cash' | 'card' | 'upi';
  paidAt: Date;
  receivedBy: Types.ObjectId;
}

export interface ICreditSale extends Document {
  companyId: Types.ObjectId;
  branchId?: Types.ObjectId;
  customerId: Types.ObjectId;
  saleId?: Types.ObjectId;
  invoiceNumber?: string;
  notes?: string;
  totalCreditAmount: number;
  paidAmount: number;
  dueAmount: number;
  dueDate: Date;
  status: CreditSaleStatus;
  paymentLogs: ICreditPaymentLog[];
  createdAt: Date;
  updatedAt: Date;
}

const creditPaymentLogSchema = new Schema<ICreditPaymentLog>({
  amount: { type: Number, required: true, min: 0.01 },
  paymentMethod: { type: String, enum: ['cash', 'card', 'upi'], required: true },
  paidAt: { type: Date, default: Date.now },
  receivedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

const creditSaleSchema = new Schema<ICreditSale>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: false },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    saleId: { type: Schema.Types.ObjectId, ref: 'Sale', required: false },
    invoiceNumber: { type: String, required: false, trim: true },
    notes: { type: String, default: '', trim: true },
    totalCreditAmount: { type: Number, required: true },
    paidAmount: { type: Number, required: true, default: 0 },
    dueAmount: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['active', 'settled', 'overdue'],
      default: 'active',
    },
    paymentLogs: [creditPaymentLogSchema],
  },
  { timestamps: true }
);

creditSaleSchema.index({ companyId: 1, customerId: 1 });
creditSaleSchema.index({ dueDate: 1 });

export const CreditSale = mongoose.model<ICreditSale>('CreditSale', creditSaleSchema);
export default CreditSale;
