import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IDailySettlement extends Document {
  companyId: Types.ObjectId;
  branchId: Types.ObjectId;
  date: string;
  openingCb: number;
  cashSales: number;
  upiSales: number;
  cardSales: number;
  totalExpenses: number;
  expenseItems: { title: string; amount: number; category: string }[];
  cashTaken: number;
  notes: string;
  closingCb: number;
  savedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const dailySettlementSchema = new Schema<IDailySettlement>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: false },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: false },
    date: { type: String, required: true, trim: true },
    openingCb: { type: Number, default: 0 },
    cashSales: { type: Number, default: 0 },
    upiSales: { type: Number, default: 0 },
    cardSales: { type: Number, default: 0 },
    totalExpenses: { type: Number, default: 0 },
    expenseItems: [{ title: String, amount: Number, category: String }],
    cashTaken: { type: Number, default: 0 },
    notes: { type: String, default: '' },
    closingCb: { type: Number, default: 0 },
    savedBy: { type: Schema.Types.ObjectId, ref: 'User', required: false },
  },
  { timestamps: true }
);

dailySettlementSchema.index({ companyId: 1, branchId: 1, date: 1 }, { unique: true });
dailySettlementSchema.index({ date: -1 });

export const DailySettlement = mongoose.model<IDailySettlement>('DailySettlement', dailySettlementSchema);
export default DailySettlement;
