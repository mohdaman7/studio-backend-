import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IExpense extends Document {
  companyId: Types.ObjectId;
  branchId: Types.ObjectId;
  title: string;
  amount: number;
  category: string;
  notes?: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const expenseSchema = new Schema<IExpense>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    title: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, trim: true },
    notes: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

expenseSchema.index({ companyId: 1, branchId: 1 });
expenseSchema.index({ createdAt: -1 });

export const Expense = mongoose.model<IExpense>('Expense', expenseSchema);
export default Expense;
