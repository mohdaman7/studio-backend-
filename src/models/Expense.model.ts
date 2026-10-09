import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IExpense extends Document {
  companyId: Types.ObjectId;
  branchId: Types.ObjectId;
  title: string;
  amount: number;
  category: string;
  date: Date;
  notes?: string;
  paymentMethod: string;
  supplierId?: Types.ObjectId;
  purchaseId?: Types.ObjectId;
  isSupplierPayout?: boolean;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const expenseSchema = new Schema<IExpense>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: false },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: false },
    title: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, trim: true },
    date: { type: Date, default: Date.now },
    notes: { type: String },
    paymentMethod: { type: String, default: 'cash' },
    supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier', required: false },
    purchaseId: { type: Schema.Types.ObjectId, ref: 'Purchase', required: false },
    isSupplierPayout: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

expenseSchema.index({ companyId: 1, branchId: 1 });
expenseSchema.index({ supplierId: 1 });
expenseSchema.index({ purchaseId: 1 });
expenseSchema.index({ date: -1 });
expenseSchema.index({ createdAt: -1 });

export const Expense = mongoose.model<IExpense>('Expense', expenseSchema);
export default Expense;
