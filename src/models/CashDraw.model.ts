import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICashDraw extends Document {
  companyId: Types.ObjectId;
  branchId: Types.ObjectId;
  date: string; // "YYYY-MM-DD"
  amount: number;
  note: string;
  recordedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const cashDrawSchema = new Schema<ICashDraw>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: false },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: false },
    date: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    note: { type: String, default: 'Cash taken by owner' },
    recordedBy: { type: Schema.Types.ObjectId, ref: 'User', required: false },
  },
  { timestamps: true }
);

cashDrawSchema.index({ companyId: 1, branchId: 1, date: 1 });
cashDrawSchema.index({ date: -1 });
cashDrawSchema.index({ createdAt: -1 });

export const CashDraw = mongoose.model<ICashDraw>('CashDraw', cashDrawSchema);
export default CashDraw;
